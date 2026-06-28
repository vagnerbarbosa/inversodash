"""
Backend FastAPI para Dashboard do Inversor Solar
"""
import asyncio
import json
import logging
from datetime import datetime, timedelta
from zoneinfo import ZoneInfo
from typing import Dict, Any, List
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import schedule
import uvicorn

from inverter_reader import InverterReader, read_inverter_goodwe_lib, BR_TIMEZONE, now_brazil

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Dados em memória (para histórico)
historical_data: List[Dict[str, Any]] = []
MAX_HISTORY = 10080  # 7 dias em minutos

current_data: Dict[str, Any] = {
    "timestamp": now_brazil().isoformat(),
    "connected": False,
    "pv": {"pv1_voltage": 0, "pv1_current": 0, "pv1_power": 0, "total_power": 0},
    "grid": {"voltage": 0, "current": 0, "frequency": 0},
    "power": {"output": 0},
    "temperature": {"inverter": 0, "heatsink": 0},
    "energy": {"daily": 0, "total": 0},
    "status": {"work_mode": "Unknown", "error_code": 0}
}

# Clientes WebSocket ativos
websocket_clients: List[WebSocket] = []


async def read_inverter_data():
    """Lê dados do inversor periodicamente"""
    global current_data, historical_data

    try:
        # Tentar usar a biblioteca goodwe primeiro
        data = await read_inverter_goodwe_lib()

        if not data.get("connected"):
            # Fallback para leitura Modbus direta
            reader = InverterReader()
            data = await reader.read_all_data()

        current_data = data

        # Adicionar ao histórico
        historical_data.append(data)
        if len(historical_data) > MAX_HISTORY:
            historical_data.pop(0)

        # Broadcast para clientes WebSocket
        await broadcast_message({
            "type": "data_update",
            "data": current_data
        })

        logger.info(f"Dados lidos: PV={data.get('pv', {}).get('total_power', 0)}W, "
                   f"Temp={data.get('temperature', {}).get('inverter', 0)}°C")

    except Exception as e:
        logger.error(f"Erro na leitura: {e}")


async def broadcast_message(message: Dict[str, Any]):
    """Envia mensagem para todos os clientes WebSocket"""
    disconnected = []
    for client in websocket_clients:
        try:
            await client.send_json(message)
        except:
            disconnected.append(client)

    # Remover desconectados
    for client in disconnected:
        if client in websocket_clients:
            websocket_clients.remove(client)


async def scheduler_loop():
    """Loop de agendamento para leitura periódica"""
    # Agendar leitura a cada 30 segundos
    schedule.every(30).seconds.do(lambda: asyncio.create_task(read_inverter_data()))

    while True:
        schedule.run_pending()
        await asyncio.sleep(1)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerenciamento de ciclo de vida da aplicação"""
    # Inicialização
    logger.info("Iniciando serviço de leitura do inversor...")
    asyncio.create_task(scheduler_loop())

    # Primeira leitura
    await read_inverter_data()

    yield

    # Finalização
    logger.info("Encerrando serviço...")


# Criar app FastAPI
app = FastAPI(
    title="InversoDash API",
    description="API para monitoramento do Inversor Solar Goodwe",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============= ROTAS API =============

@app.get("/api/status")
async def get_status():
    """Retorna status atual do inversor"""
    return current_data


@app.get("/api/history")
async def get_history(minutes: int = 60):
    """Retorna histórico de dados"""
    cutoff = now_brazil() - timedelta(minutes=minutes)
    filtered = [
        d for d in historical_data
        if datetime.fromisoformat(d.get("timestamp", "1970-01-01")) > cutoff
    ]
    return {
        "count": len(filtered),
        "data": filtered
    }


@app.get("/api/stats")
async def get_stats():
    """Retorna estatísticas calculadas"""
    if not historical_data:
        return {"error": "Sem dados históricos"}

    # Calcular estatísticas
    pv_powers = [d.get("pv", {}).get("total_power", 0) for d in historical_data if d.get("pv")]
    temps = [d.get("temperature", {}).get("inverter", 0) for d in historical_data if d.get("temperature")]

    if pv_powers:
        avg_pv = sum(pv_powers) / len(pv_powers)
        max_pv = max(pv_powers)
        min_pv = min(pv_powers)
    else:
        avg_pv = max_pv = min_pv = 0

    if temps:
        avg_temp = sum(temps) / len(temps)
        max_temp = max(temps)
    else:
        avg_temp = max_temp = 0

    return {
        "pv_power": {
            "average": round(avg_pv, 2),
            "maximum": round(max_pv, 2),
            "minimum": round(min_pv, 2),
            "current": current_data.get("pv", {}).get("total_power", 0)
        },
        "temperature": {
            "average": round(avg_temp, 2),
            "maximum": round(max_temp, 2),
            "current": current_data.get("temperature", {}).get("inverter", 0)
        },
        "energy": {
            "daily": current_data.get("energy", {}).get("daily", 0),
            "total": current_data.get("energy", {}).get("total", 0)
        }
    }


# ============= WEBSOCKET =============

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Endpoint WebSocket para streaming em tempo real"""
    await websocket.accept()
    websocket_clients.append(websocket)

    # Enviar dados atuais ao conectar
    await websocket.send_json({
        "type": "data_update",
        "data": current_data
    })

    try:
        while True:
            # Aguardar mensagens do cliente (heartbeat ou comandos)
            data = await websocket.receive_text()
            msg = json.loads(data)

            if msg.get("action") == "refresh":
                # Forçar atualização
                await read_inverter_data()
            elif msg.get("action") == "ping":
                # Heartbeat
                await websocket.send_json({"type": "pong"})

    except WebSocketDisconnect:
        websocket_clients.remove(websocket)
        logger.info("Cliente WebSocket desconectado")
    except Exception as e:
        logger.error(f"Erro WebSocket: {e}")
        if websocket in websocket_clients:
            websocket_clients.remove(websocket)


# ============= ENERGY STATISTICS =============

def calculate_energy_stats(period: str) -> Dict[str, Any]:
    """Calcula estatísticas de energia por período usando dados históricos"""
    global historical_data

    now = now_brazil()
    stats = {
        "period": period,
        "current": 0.0,
        "previous": 0.0,
        "average": 0.0,
        "change_percent": 0.0,
        "peak_day": None
    }

    if not historical_data:
        return stats

    try:
        if period == "day":
            # Hoje (desde a última meia-noite)
            today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
            yesterday_start = today_start - timedelta(days=1)

            today_data = [d for d in historical_data
                         if datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) >= today_start]
            yesterday_data = [d for d in historical_data
                            if yesterday_start <= datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) < today_start]

            # Pegar o valor máximo de energia diária (o acumulado do dia)
            if today_data:
                stats["current"] = max([d.get("energy", {}).get("daily", 0) for d in today_data], default=0)
            if yesterday_data:
                stats["previous"] = max([d.get("energy", {}).get("daily", 0) for d in yesterday_data], default=0)

            # Calcular média dos últimos 7 dias
            week_ago = today_start - timedelta(days=7)
            week_data = [d for d in historical_data
                        if datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) >= week_ago]
            daily_values = [max([d.get("energy", {}).get("daily", 0) for d in week_data], default=0)]
            if len(week_data) >= 7:
                stats["average"] = sum(daily_values) / len(daily_values)

        elif period == "week":
            # Esta semana (domingo a hoje)
            week_start = now - timedelta(days=now.weekday() + 1)  # Domingo
            week_start = week_start.replace(hour=0, minute=0, second=0, microsecond=0)
            last_week_start = week_start - timedelta(weeks=1)

            # Agrupar por dia e somar
            def sum_period_energy(data_list, start, end):
                period_data = [d for d in data_list
                              if start <= datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) < end]
                if not period_data:
                    return 0.0
                # Pegar o valor máximo de cada dia e somar
                daily_max = {}
                for d in period_data:
                    day = datetime.fromisoformat(d.get("timestamp", "")).date()
                    energy = d.get("energy", {}).get("daily", 0)
                    daily_max[day] = max(daily_max.get(day, 0), energy)
                return sum(daily_max.values())

            stats["current"] = sum_period_energy(historical_data, week_start, now)
            stats["previous"] = sum_period_energy(historical_data, last_week_start, week_start)

        elif period == "month":
            # Este mês
            month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            last_month = month_start - timedelta(days=1)
            last_month_start = last_month.replace(day=1)

            def sum_monthly_energy(data_list, start, end):
                period_data = [d for d in data_list
                              if start <= datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) < end]
                if not period_data:
                    return 0.0
                daily_max = {}
                for d in period_data:
                    day = datetime.fromisoformat(d.get("timestamp", "")).date()
                    energy = d.get("energy", {}).get("daily", 0)
                    daily_max[day] = max(daily_max.get(day, 0), energy)
                return sum(daily_max.values())

            stats["current"] = sum_monthly_energy(historical_data, month_start, now)
            stats["previous"] = sum_monthly_energy(historical_data, last_month_start, month_start)

        elif period == "year":
            # Este ano
            year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
            last_year_start = year_start.replace(year=year_start.year - 1)

            def sum_yearly_energy(data_list, start, end):
                period_data = [d for d in data_list
                              if start <= datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) < end]
                if not period_data:
                    return 0.0
                daily_max = {}
                for d in period_data:
                    day = datetime.fromisoformat(d.get("timestamp", "")).date()
                    energy = d.get("energy", {}).get("daily", 0)
                    daily_max[day] = max(daily_max.get(day, 0), energy)
                return sum(daily_max.values())

            stats["current"] = sum_yearly_energy(historical_data, year_start, now)
            stats["previous"] = sum_yearly_energy(historical_data, last_year_start, year_start)

        # Calcular porcentagem de mudança
        if stats["previous"] > 0:
            stats["change_percent"] = round(((stats["current"] - stats["previous"]) / stats["previous"]) * 100, 1)
        elif stats["current"] > 0:
            stats["change_percent"] = 100.0

        # Encontrar dia de pico (últimos 30 dias)
        thirty_days_ago = now - timedelta(days=30)
        recent_data = [d for d in historical_data
                      if datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) >= thirty_days_ago]

        if recent_data:
            peak = max(recent_data, key=lambda x: x.get("energy", {}).get("daily", 0))
            peak_date = datetime.fromisoformat(peak.get("timestamp", "")).date()
            stats["peak_day"] = {
                "date": peak_date.isoformat(),
                "energy": round(peak.get("energy", {}).get("daily", 0), 2)
            }

        # Arredondar valores
        stats["current"] = round(stats["current"], 2)
        stats["previous"] = round(stats["previous"], 2)
        stats["average"] = round(stats["average"], 2)

    except Exception as e:
        logger.error(f"Erro ao calcular estatísticas: {e}")

    return stats


@app.get("/api/stats/energy")
async def get_energy_stats(period: str = "day"):
    """
    Retorna estatísticas de energia por período.

    Períodos válidos: day, week, month, year
    """
    if period not in ["day", "week", "month", "year"]:
        return {"error": "Período inválido. Use: day, week, month, year"}

    stats = calculate_energy_stats(period)
    return stats


# ============= HEALTH CHECK =============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": now_brazil().isoformat()}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

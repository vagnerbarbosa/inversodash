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


# ============= ECONOMY CALCULATION =============

# Configuração de tarifa (Energisa PB - valor padrão: R$ 0,77/kWh)
# Pode ser ajustado via variável de ambiente
import os

TARIFA_PADRAO = float(os.getenv('TARIFA_KWH', '0.77'))
BANDEIRA_ATUAL = os.getenv('BANDEIRA_TARIFARIA', 'verde')  # verde, amarela, vermelha_p1, vermelha_p2

# Acréscimos de bandeira (Energisa PB)
BANDEIRA_ACRESCIMO = {
    'verde': 0.0,
    'amarela': 0.020,
    'vermelha_p1': 0.045,
    'vermelha_p2': 0.065
}

# Configurações de economia (em memória - em produção usar banco de dados)
economy_config = {
    'tarifa_kwh': TARIFA_PADRAO,
    'bandeira': BANDEIRA_ATUAL,
    'custo_instalacao': float(os.getenv('CUSTO_INSTALACAO', '25000')),  # Custo do sistema em R$
    'data_instalacao': os.getenv('DATA_INSTALACAO', now_brazil().strftime('%Y-%m-%d'))
}

# Histórico de economia calculada (em memória)
economy_history = []

def get_tarifa_efetiva():
    """Retorna a tarifa efetiva com acréscimo de bandeira"""
    tarifa_base = economy_config['tarifa_kwh']
    acrescimo = BANDEIRA_ACRESCIMO.get(economy_config['bandeira'], 0.0)
    return tarifa_base + acrescimo

def calculate_economy_stats():
    """Calcula estatísticas de economia em reais"""
    global historical_data, economy_config

    now = now_brazil()
    tarifa_efetiva = get_tarifa_efetiva()

    stats = {
        'tarifa_atual': round(tarifa_efetiva, 4),
        'bandeira': economy_config['bandeira'],
        'custo_instalacao': economy_config['custo_instalacao'],
        'data_instalacao': economy_config['data_instalacao'],
        'daily': {'energy_kwh': 0.0, 'value_brl': 0.0},
        'monthly': {'energy_kwh': 0.0, 'value_brl': 0.0},
        'yearly': {'energy_kwh': 0.0, 'value_brl': 0.0},
        'total': {'energy_kwh': 0.0, 'value_brl': 0.0},
        'payback': {'percent': 0.0, 'years': 0.0, 'remaining_brl': 0.0},
        'projection_25y': 0.0
    }

    if not historical_data:
        return stats

    try:
        # Economia do dia atual
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_data = [d for d in historical_data
                       if datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) >= today_start]
        if today_data:
            daily_energy = max([d.get("energy", {}).get("daily", 0) for d in today_data], default=0)
            stats['daily']['energy_kwh'] = round(daily_energy, 2)
            stats['daily']['value_brl'] = round(daily_energy * tarifa_efetiva, 2)

        # Economia do mês atual
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        month_data = [d for d in historical_data
                      if datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) >= month_start]
        if month_data:
            daily_max = {}
            for d in month_data:
                day = datetime.fromisoformat(d.get("timestamp", "")).date()
                energy = d.get("energy", {}).get("daily", 0)
                daily_max[day] = max(daily_max.get(day, 0), energy)
            monthly_energy = sum(daily_max.values())
            stats['monthly']['energy_kwh'] = round(monthly_energy, 2)
            stats['monthly']['value_brl'] = round(monthly_energy * tarifa_efetiva, 2)

        # Economia do ano atual
        year_start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        year_data = [d for d in historical_data
                     if datetime.fromisoformat(d.get("timestamp", "")).replace(tzinfo=BR_TIMEZONE) >= year_start]
        if year_data:
            daily_max = {}
            for d in year_data:
                day = datetime.fromisoformat(d.get("timestamp", "")).date()
                energy = d.get("energy", {}).get("daily", 0)
                daily_max[day] = max(daily_max.get(day, 0), energy)
            yearly_energy = sum(daily_max.values())
            stats['yearly']['energy_kwh'] = round(yearly_energy, 2)
            stats['yearly']['value_brl'] = round(yearly_energy * tarifa_efetiva, 2)

        # Economia total desde a instalação
        try:
            install_date = datetime.strptime(economy_config['data_instalacao'], '%Y-%m-%d').date()
        except:
            install_date = now.date()

        total_data = [d for d in historical_data]
        if total_data:
            daily_max = {}
            for d in total_data:
                day = datetime.fromisoformat(d.get("timestamp", "")).date()
                # Só conta a partir da data de instalação
                if day >= install_date:
                    energy = d.get("energy", {}).get("daily", 0)
                    daily_max[day] = max(daily_max.get(day, 0), energy)
            total_energy = sum(daily_max.values())
            total_value = total_energy * tarifa_efetiva
            stats['total']['energy_kwh'] = round(total_energy, 2)
            stats['total']['value_brl'] = round(total_value, 2)

            # Cálculo de payback
            if economy_config['custo_instalacao'] > 0:
                payback_percent = min((total_value / economy_config['custo_instalacao']) * 100, 100)
                stats['payback']['percent'] = round(payback_percent, 1)
                stats['payback']['remaining_brl'] = round(max(economy_config['custo_instalacao'] - total_value, 0), 2)

                # Tempo estimado para payback completo
                dias_desde_instalacao = (now.date() - install_date).days
                if dias_desde_instalacao > 0 and total_value > 0:
                    economia_diaria = total_value / dias_desde_instalacao
                    dias_restantes = stats['payback']['remaining_brl'] / economia_diaria if economia_diaria > 0 else 0
                    stats['payback']['years'] = round(dias_restantes / 365, 1)

            # Projeção para 25 anos (vida útil do sistema)
            if dias_desde_instalacao > 0:
                media_diaria = total_energy / dias_desde_instalacao
                projecao_25anos = media_diaria * 365 * 25 * tarifa_efetiva
                stats['projection_25y'] = round(projecao_25anos, 2)

    except Exception as e:
        logger.error(f"Erro ao calcular economia: {e}")

    return stats


@app.get("/api/economy")
async def get_economy_stats():
    """
    Retorna estatísticas de economia em reais.
    Inclui economia diária, mensal, anual e total.
    """
    stats = calculate_economy_stats()
    return stats


@app.get("/api/economy/config")
async def get_economy_config():
    """Retorna configuração atual de economia"""
    return {
        'tarifa_kwh': economy_config['tarifa_kwh'],
        'bandeira': economy_config['bandeira'],
        'custo_instalacao': economy_config['custo_instalacao'],
        'data_instalacao': economy_config['data_instalacao']
    }


@app.post("/api/economy/config")
async def update_economy_config(config: dict):
    """
    Atualiza configuração de economia.

    Exemplo de payload:
    {
        "tarifa_kwh": 0.77,
        "bandeira": "verde",
        "custo_instalacao": 25000,
        "data_instalacao": "2024-01-15"
    }
    """
    global economy_config

    try:
        if 'tarifa_kwh' in config:
            economy_config['tarifa_kwh'] = float(config['tarifa_kwh'])
        if 'bandeira' in config:
            if config['bandeira'] in BANDEIRA_ACRESCIMO:
                economy_config['bandeira'] = config['bandeira']
            else:
                return {"error": f"Bandeira inválida. Use: {list(BANDEIRA_ACRESCIMO.keys())}"}
        if 'custo_instalacao' in config:
            economy_config['custo_instalacao'] = float(config['custo_instalacao'])
        if 'data_instalacao' in config:
            # Validar formato de data
            datetime.strptime(config['data_instalacao'], '%Y-%m-%d')
            economy_config['data_instalacao'] = config['data_instalacao']

        return {"success": True, "config": economy_config}
    except Exception as e:
        return {"error": str(e)}


# ============= HEALTH CHECK =============

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": now_brazil().isoformat()}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")

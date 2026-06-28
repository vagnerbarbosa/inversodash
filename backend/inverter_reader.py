"""
Módulo para leitura do inversor Goodwe via Modbus TCP
"""
import asyncio
import logging
from typing import Dict, Any, Optional
from datetime import datetime
from zoneinfo import ZoneInfo
import struct

# Timezone Brasil (São Paulo)
BR_TIMEZONE = ZoneInfo("America/Sao_Paulo")

def now_brazil():
    """Retorna datetime atual no timezone Brasil"""
    return datetime.now(BR_TIMEZONE)

from pymodbus.client import ModbusTcpClient

logger = logging.getLogger(__name__)

class InverterReader:
    """Classe para ler dados do inversor Goodwe"""

    def __init__(self, host: str = "127.0.0.1", port: int = 502):
        self.host = host
        self.port = port
        self.client = None

    async def connect(self) -> bool:
        """Conecta ao inversor via Modbus TCP"""
        try:
            self.client = ModbusTcpClient(self.host, port=self.port)
            return self.client.connect()
        except Exception as e:
            logger.error(f"Erro ao conectar: {e}")
            return False

    def disconnect(self):
        """Desconecta do inversor"""
        if self.client:
            self.client.close()
            self.client = None

    def read_register(self, address: int, count: int = 1) -> Optional[list]:
        """Lê registradores do inversor"""
        try:
            result = self.client.read_holding_registers(address, count, slave=247)
            if result.isError():
                logger.error(f"Erro ao ler registrador {address}: {result}")
                return None
            return result.registers
        except Exception as e:
            logger.error(f"Erro na leitura: {e}")
            return None

    def parse_value(self, registers: list, signed: bool = False, scale: float = 1.0) -> float:
        """Converte registradores para valor numérico"""
        if len(registers) == 1:
            value = registers[0]
            if signed and value > 32767:
                value -= 65536
            return value * scale
        elif len(registers) == 2:
            # 32-bit value
            value = (registers[0] << 16) | registers[1]
            if signed and value > 2147483647:
                value -= 4294967296
            return value * scale
        return 0.0

    async def read_all_data(self) -> Dict[str, Any]:
        """Lê todos os dados do inversor"""
        data = {
            "timestamp": now_brazil().isoformat(),
            "connected": False,
            "pv": {},
            "grid": {},
            "power": {},
            "temperature": {},
            "status": {},
            "energy": {}
        }

        if not await self.connect():
            data["error"] = "Não foi possível conectar ao inversor"
            return data

        try:
            # Dados PV (registradores típicos da família DT/Goodwe)
            # PV1 Voltage (35003) - scale 0.1
            regs = self.read_register(35003, 1)
            if regs:
                data["pv"]["pv1_voltage"] = self.parse_value(regs, scale=0.1)

            # PV1 Current (35004) - scale 0.1
            regs = self.read_register(35004, 1)
            if regs:
                data["pv"]["pv1_current"] = self.parse_value(regs, scale=0.1)

            # PV1 Power (calculado)
            if "pv1_voltage" in data["pv"] and "pv1_current" in data["pv"]:
                data["pv"]["pv1_power"] = data["pv"]["pv1_voltage"] * data["pv"]["pv1_current"]

            # PV2 Voltage (35005)
            regs = self.read_register(35005, 1)
            if regs:
                data["pv"]["pv2_voltage"] = self.parse_value(regs, scale=0.1)

            # PV2 Current (35006)
            regs = self.read_register(35006, 1)
            if regs:
                data["pv"]["pv2_current"] = self.parse_value(regs, scale=0.1)

            # PV Total Power (35107)
            regs = self.read_register(35107, 1)
            if regs:
                data["pv"]["total_power"] = self.parse_value(regs)

            # Grid Voltage (35121) - scale 0.1
            regs = self.read_register(35121, 1)
            if regs:
                data["grid"]["voltage"] = self.parse_value(regs, scale=0.1)

            # Grid Current (35122) - scale 0.1
            regs = self.read_register(35122, 1)
            if regs:
                data["grid"]["current"] = self.parse_value(regs, scale=0.1)

            # Grid Frequency (35123) - scale 0.01
            regs = self.read_register(35123, 1)
            if regs:
                data["grid"]["frequency"] = self.parse_value(regs, scale=0.01)

            # Output Power (35137)
            regs = self.read_register(35137, 1)
            if regs:
                val = self.parse_value(regs, signed=True)
                data["power"]["output"] = val

            # Inverter Temperature (35174) - scale 0.1
            regs = self.read_register(35174, 1)
            if regs:
                data["temperature"]["inverter"] = self.parse_value(regs, scale=0.1)

            # Heatsink Temperature (35175)
            regs = self.read_register(35175, 1)
            if regs:
                data["temperature"]["heatsink"] = self.parse_value(regs, scale=0.1)

            # Daily Energy (35191) - scale 0.1
            regs = self.read_register(35191, 1)
            if regs:
                data["energy"]["daily"] = self.parse_value(regs, scale=0.1)

            # Total Energy (35192) - scale 0.1
            regs = self.read_register(35192, 2)
            if regs:
                data["energy"]["total"] = self.parse_value(regs, scale=0.1)

            # Work Mode (35000)
            regs = self.read_register(35000, 1)
            if regs:
                modes = {0: "Standby", 1: "Normal", 2: "Fault"}
                data["status"]["work_mode"] = modes.get(regs[0], f"Unknown({regs[0]})")

            # Error Code (35001)
            regs = self.read_register(35001, 1)
            if regs:
                data["status"]["error_code"] = regs[0]

            data["connected"] = True

        except Exception as e:
            logger.error(f"Erro ao ler dados: {e}")
            data["error"] = str(e)
        finally:
            self.disconnect()

        return data


# Fallback: usar a biblioteca goodwe se disponível
async def read_inverter_goodwe_lib() -> Dict[str, Any]:
    """Lê dados usando a biblioteca goodwe (fallback)"""
    try:
        import goodwe
        inverter = await asyncio.wait_for(
            goodwe.connect("127.0.0.1", family="DT"),
            timeout=10
        )
        runtime_data = await inverter.read_runtime_data()

        data = {
            "timestamp": now_brazil().isoformat(),
            "connected": True,
            "pv": {},
            "grid": {},
            "power": {},
            "temperature": {},
            "status": {},
            "energy": {}
        }

        for sensor in inverter.sensors():
            if sensor.id_ in runtime_data:
                val = runtime_data[sensor.id_]
                name = sensor.name.lower()

                if "pv" in name:
                    if "voltage" in name:
                        data["pv"]["pv1_voltage"] = val
                    elif "current" in name:
                        data["pv"]["pv1_current"] = val
                    elif "power" in name:
                        data["pv"]["total_power"] = val
                elif "grid" in name or "voltage" in name:
                    if "voltage" in name:
                        data["grid"]["voltage"] = val
                    elif "current" in name:
                        data["grid"]["current"] = val
                    elif "freq" in name:
                        data["grid"]["frequency"] = val
                elif "temp" in name:
                    if "inverter" in name:
                        data["temperature"]["inverter"] = val
                    elif "heatsink" in name:
                        data["temperature"]["heatsink"] = val
                elif "energy" in name:
                    if "day" in name or "daily" in name:
                        data["energy"]["daily"] = val
                    elif "total" in name:
                        data["energy"]["total"] = val

        return data

    except Exception as e:
        logger.error(f"Erro com biblioteca goodwe: {e}")
        return {"timestamp": now_brazil().isoformat(), "connected": False, "error": str(e)}
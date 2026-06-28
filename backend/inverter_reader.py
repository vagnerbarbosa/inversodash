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

    def __init__(self, host: str = None, port: int = 502):
        if host is None:
            import os
            host = os.getenv('INVERTER_IP', '127.0.0.1')
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
            "pv_strings": [],  # Dados individuais de cada string PV
            "grid": {},
            "power": {},
            "meter": {},  # Dados do medidor/smart meter
            "temperature": {},
            "status": {},
            "energy": {},
            "diagnostics": {}  # Dados de diagnóstico
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

            # PV3 Voltage (35007) - se disponível
            regs = self.read_register(35007, 1)
            if regs:
                data["pv"]["pv3_voltage"] = self.parse_value(regs, scale=0.1)

            # PV3 Current (35008)
            regs = self.read_register(35008, 1)
            if regs:
                data["pv"]["pv3_current"] = self.parse_value(regs, scale=0.1)

            # PV4 Voltage (35009) - se disponível
            regs = self.read_register(35009, 1)
            if regs:
                data["pv"]["pv4_voltage"] = self.parse_value(regs, scale=0.1)

            # PV4 Current (35010)
            regs = self.read_register(35010, 1)
            if regs:
                data["pv"]["pv4_current"] = self.parse_value(regs, scale=0.1)

            # Criar array de strings PV para fácil iteração no frontend
            for i in range(1, 5):
                v_key = f"pv{i}_voltage"
                i_key = f"pv{i}_current"
                if v_key in data["pv"] or i_key in data["pv"]:
                    string_data = {
                        "string_id": i,
                        "voltage": data["pv"].get(v_key, 0),
                        "current": data["pv"].get(i_key, 0),
                        "power": data["pv"].get(v_key, 0) * data["pv"].get(i_key, 0)
                    }
                    data["pv_strings"].append(string_data)

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

            # Grid Power Factor (35124) - scale 0.001
            regs = self.read_register(35124, 1)
            if regs:
                data["grid"]["power_factor"] = self.parse_value(regs, scale=0.001)

            # Active Power (35125)
            regs = self.read_register(35125, 1)
            if regs:
                data["power"]["active"] = self.parse_value(regs, signed=True)

            # Reactive Power (35126)
            regs = self.read_register(35126, 1)
            if regs:
                data["power"]["reactive"] = self.parse_value(regs, signed=True)

            # Apparent Power (35127)
            regs = self.read_register(35127, 1)
            if regs:
                data["power"]["apparent"] = self.parse_value(regs)

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

            # Energy Exported Today (35193) - scale 0.1
            regs = self.read_register(35193, 1)
            if regs:
                data["energy"]["exported_daily"] = self.parse_value(regs, scale=0.1)
                logger.info(f"Smart Meter OK - Exportado hoje: {data['energy']['exported_daily']} kWh")
            else:
                logger.info("Smart Meter: Registro 35193 (exported_daily) não disponível - possivelmente sem smart meter instalado")

            # Energy Exported Total (35194) - scale 0.1
            regs = self.read_register(35194, 2)
            if regs:
                data["energy"]["exported_total"] = self.parse_value(regs, scale=0.1)
                logger.info(f"Smart Meter OK - Exportado total: {data['energy']['exported_total']} kWh")
            else:
                logger.info("Smart Meter: Registro 35194 (exported_total) não disponível")

            # Energy Imported Today (35196) - scale 0.1
            regs = self.read_register(35196, 1)
            if regs:
                data["energy"]["imported_daily"] = self.parse_value(regs, scale=0.1)
                logger.info(f"Smart Meter OK - Importado hoje: {data['energy']['imported_daily']} kWh")
            else:
                logger.info("Smart Meter: Registro 35196 (imported_daily) não disponível")

            # Energy Imported Total (35197) - scale 0.1
            regs = self.read_register(35197, 2)
            if regs:
                data["energy"]["imported_total"] = self.parse_value(regs, scale=0.1)
                logger.info(f"Smart Meter OK - Importado total: {data['energy']['imported_total']} kWh")
            else:
                logger.info("Smart Meter: Registro 35197 (imported_total) não disponível")

            # Total Operation Hours (35199)
            regs = self.read_register(35199, 1)
            if regs:
                data["diagnostics"]["operation_hours"] = self.parse_value(regs)
                logger.info(f"Operation Hours OK: {data['diagnostics']['operation_hours']}h")
            else:
                logger.info("Operation Hours: Registro 35199 não disponível")

            # Work Mode (35000)
            regs = self.read_register(35000, 1)
            if regs:
                # Mapeamento completo dos modos do inversor Goodwe (em português)
                modes = {
                    0: "Espera",
                    1: "Normal",
                    2: "Falha",
                    3: "Desligado",
                    4: "Verificação",
                    5: "Normal",
                    6: "Atualizando",
                    7: "EPS",
                    8: "DRM",
                    9: "Auto-Teste"
                }
                mode_value = regs[0]
                data["status"]["work_mode"] = modes.get(mode_value, f"Desconhecido({mode_value})")

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
        import os
        inverter_ip = os.getenv('INVERTER_IP', '127.0.0.1')
        logger.info(f"Tentando conectar via goodwe lib ao IP: {inverter_ip}")
        inverter = await asyncio.wait_for(
            goodwe.connect(inverter_ip, family="DT"),
            timeout=10
        )
        runtime_data = await inverter.read_runtime_data()
        logger.info(f"Goodwe lib - Dados obtidos: e_day={runtime_data.get('e_day', 'N/A')}, e_total={runtime_data.get('e_total', 'N/A')}")

        data = {
            "timestamp": now_brazil().isoformat(),
            "connected": True,
            "pv": {},
            "pv_strings": [],
            "grid": {},
            "power": {},
            "meter": {},
            "temperature": {},
            "status": {},
            "energy": {},
            "diagnostics": {}
        }

        work_mode_set = False

        sensor_count = 0
        for sensor in inverter.sensors():
            if sensor.id_ in runtime_data:
                val = runtime_data[sensor.id_]
                name = sensor.name.lower()
                sensor_count += 1

                # Geração de energia do inversor (e_day, e_total) - VER PRIMEIRO pois contém "pv" no nome
                if sensor.id_ == "e_day":
                    data["energy"]["daily"] = val
                    logger.info(f"Geração hoje: {val} kWh")
                elif sensor.id_ == "e_total":
                    data["energy"]["total"] = val
                    logger.info(f"Geração total: {val} kWh")
                elif "pv" in name:
                    if "voltage" in name:
                        data["pv"]["pv1_voltage"] = val
                    elif "current" in name:
                        data["pv"]["pv1_current"] = val
                    elif "power" in name:
                        data["pv"]["total_power"] = val
                # Dados do Grid (vgrid1, igrid1, fgrid1, etc)
                elif sensor.id_.startswith("vgrid"):
                    if "voltage" not in data["grid"]:
                        data["grid"]["voltage"] = val
                        logger.info(f"Grid Voltage: {val}V")
                elif sensor.id_.startswith("igrid"):
                    if "current" not in data["grid"]:
                        data["grid"]["current"] = val
                        logger.info(f"Grid Current: {val}A")
                elif sensor.id_.startswith("fgrid"):
                    if "frequency" not in data["grid"]:
                        data["grid"]["frequency"] = val
                        logger.info(f"Grid Frequency: {val}Hz")
                elif sensor.id_ == "power_factor":
                    data["grid"]["power_factor"] = val
                    logger.info(f"Power Factor: {val}")
                # Dados de Potência (active, reactive, apparent)
                elif sensor.id_ == "total_inverter_power":
                    data["power"]["active"] = val
                    logger.info(f"Active Power: {val}W")
                elif sensor.id_ == "reactive_power":
                    data["power"]["reactive"] = val
                    logger.info(f"Reactive Power: {val}VAR")
                elif sensor.id_ == "apparent_power":
                    data["power"]["apparent"] = val
                    logger.info(f"Apparent Power: {val}VA")
                # Smart Meter / Medidor Bidirecional
                elif sensor.id_ == "meter_e_total_exp":
                    data["energy"]["exported_total"] = val
                    logger.info(f"Smart Meter - Exportado total: {val} kWh")
                elif sensor.id_ == "meter_e_total_imp":
                    data["energy"]["imported_total"] = val
                    logger.info(f"Smart Meter - Importado total: {val} kWh")
                elif sensor.id_ == "meter_active_power":
                    data["meter"]["active_power"] = val
                elif sensor.id_ == "meter_comm_label":
                    data["meter"]["communication_status"] = val
                    if val:
                        logger.info(f"Smart Meter - Status comunicação: {val}")
                elif sensor.id_ == "h_total":
                    data["diagnostics"]["operation_hours"] = val
                    logger.info(f"Operation Hours: {val}h")
                elif "temp" in name:
                    if "inverter" in name:
                        data["temperature"]["inverter"] = val
                    elif "heatsink" in name:
                        data["temperature"]["heatsink"] = val
                elif "work" in name or "operation" in name:
                    if "work_mode" in name or "operation_mode" in name or ("mode" in name and "work" in name):
                        # Traduzir nomes de modos do inglês para português
                        mode_translations = {
                            "Standby": "Espera",
                            "Stand by": "Espera",
                            "Wait": "Espera",
                            "Wait Mode": "Espera",
                            "Waiting": "Espera",
                            "Normal": "Normal",
                            "On-grid": "Normal",
                            "On Grid": "Normal",
                            "Fault": "Falha",
                            "Off": "Desligado",
                            "Off-grid": "EPS",
                            "Off Grid": "EPS",
                            "Check": "Verificação",
                            "Check Mode": "Verificação",
                            "Self-Check": "Verificação",
                            "Self Check": "Verificação",
                            "Update": "Atualizando",
                            "Updating": "Atualizando",
                            "Upgrade": "Atualizando",
                            "EPS": "EPS",
                            "DRM": "DRM",
                            "Self-Test": "Auto-Teste",
                            "Self Test": "Auto-Teste"
                        }
                        mode_value = str(val) if val else "Normal"
                        data["status"]["work_mode"] = mode_translations.get(mode_value, mode_value)
                        work_mode_set = True
                elif "error" in name or "fault" in name or "alarm" in name:
                    if "code" in name or "num" in name:
                        data["status"]["error_code"] = int(val) if val else 0
                elif "energy" in name:
                    if "day" in name or "daily" in name:
                        data["energy"]["daily"] = val
                    elif "total" in name:
                        data["energy"]["total"] = val

        # Extrair dados das strings PV individuais
        pv_strings_data = {}
        for sensor in inverter.sensors():
            if sensor.id_ in runtime_data:
                sensor_id = sensor.id_
                # Extrair vpvx e ipvx usando o ID do sensor (vpv1, ipv1, etc)
                if sensor_id.startswith("vpv"):
                    try:
                        string_num = int(sensor_id.replace("vpv", "").strip())
                        if string_num not in pv_strings_data:
                            pv_strings_data[string_num] = {}
                        pv_strings_data[string_num]["voltage"] = runtime_data[sensor_id]
                    except:
                        pass
                elif sensor_id.startswith("ipv"):
                    try:
                        string_num = int(sensor_id.replace("ipv", "").strip())
                        if string_num not in pv_strings_data:
                            pv_strings_data[string_num] = {}
                        pv_strings_data[string_num]["current"] = runtime_data[sensor_id]
                    except:
                        pass

        # Montar array de strings PV
        for string_id, values in sorted(pv_strings_data.items()):
            voltage = values.get("voltage", 0)
            current = values.get("current", 0)
            power = voltage * current if voltage and current else 0
            data["pv_strings"].append({
                "string_id": string_id,
                "voltage": voltage,
                "current": current,
                "power": power
            })
            logger.info(f"PV String {string_id}: V={voltage}V, I={current}A, P={power}W")

        # Fallback para work_mode se não foi definido
        if not work_mode_set or not data["status"].get("work_mode"):
            # Tentar encontrar nos sensores novamente
            for sensor in inverter.sensors():
                if sensor.id_ in runtime_data:
                    if "work" in sensor.name.lower() and "mode" in sensor.name.lower():
                        val = str(runtime_data[sensor.id_])
                        # Traduzir
                        mode_translations = {
                            "Standby": "Espera",
                            "Stand by": "Espera",
                            "Wait": "Espera",
                            "Wait Mode": "Espera",
                            "Waiting": "Espera",
                            "Normal": "Normal",
                            "On-grid": "Normal",
                            "On Grid": "Normal",
                            "Fault": "Falha",
                            "Off": "Desligado",
                            "Off-grid": "EPS",
                            "Off Grid": "EPS",
                            "Check": "Verificação",
                            "Check Mode": "Verificação",
                            "Self-Check": "Verificação",
                            "Self Check": "Verificação",
                            "Update": "Atualizando",
                            "Updating": "Atualizando",
                            "Upgrade": "Atualizando",
                            "EPS": "EPS",
                            "DRM": "DRM",
                            "Self-Test": "Auto-Teste",
                            "Self Test": "Auto-Teste"
                        }
                        data["status"]["work_mode"] = mode_translations.get(val, val)
                        break
            else:
                # Se ainda não temos work_mode, assumir Normal se há geração
                if data["energy"].get("daily", 0) > 0 or data["pv"].get("total_power", 0) > 0:
                    data["status"]["work_mode"] = "Normal"
                else:
                    data["status"]["work_mode"] = "Espera"

        return data

    except Exception as e:
        logger.error(f"Erro com biblioteca goodwe: {e}")
        return {"timestamp": now_brazil().isoformat(), "connected": False, "error": str(e)}
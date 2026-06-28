"""
Configurações do backend
"""
import os
from dotenv import load_dotenv

load_dotenv()

# Configurações do Inversor
INVERTER_IP = os.getenv('INVERTER_IP', '127.0.0.1')
INVERTER_PORT = int(os.getenv('INVERTER_PORT', '502'))
INVERTER_FAMILY = os.getenv('INVERTER_FAMILY', 'DT')

# Configurações da API
API_HOST = os.getenv('API_HOST', '0.0.0.0')
API_PORT = int(os.getenv('API_PORT', '8000'))
UPDATE_INTERVAL = int(os.getenv('UPDATE_INTERVAL', '30'))

# Configurações do InfluxDB
INFLUXDB_URL = os.getenv('INFLUXDB_URL', 'http://influxdb:8086')
INFLUXDB_TOKEN = os.getenv('INFLUXDB_TOKEN', 'admin:inversodash2024')
INFLUXDB_ORG = os.getenv('INFLUXDB_ORG', 'inversodash')
INFLUXDB_BUCKET = os.getenv('INFLUXDB_BUCKET', 'inversodash')

# Configurações de log
LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')

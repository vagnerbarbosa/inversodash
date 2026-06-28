# ☀️ InversoDash - Dashboard Solar

Dashboard moderno e em tempo real para monitoramento de inversores solares Goodwe via Modbus TCP.

![Dashboard Solar](https://img.shields.io/badge/Solar-Monitoring-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)

## ✨ Funcionalidades

- 📊 **Dashboard em tempo real** com WebSocket
- 📈 **Gráficos interativos** de potência e histórico
- ⚡ **Fluxo de energia** visual animado
- 🌡️ **Monitoramento de temperaturas** do inversor
- 🔋 **Estatísticas de energia** (diária, total, média)
- 🏠 **Informações da rede** (tensão, corrente, frequência)
- 📱 **Design responsivo** para desktop e mobile
- 🗄️ **Banco de dados InfluxDB** para histórico

## 🏗️ Arquitetura

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Frontend      │────▶│    Backend      │────▶│   Inversor      │
│   (React)       │     │   (FastAPI)     │     │   Goodwe        │
│   Porta 80      │     │   Porta 8000    │     │   Modbus TCP    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   InfluxDB      │
                        │   Porta 8086    │
                        └─────────────────┘
```

## 🚀 Instalação Rápida

### Pré-requisitos
- Docker
- Docker Compose
- Acesso à rede local (IP do inversor)

### Instalação

```bash
# Clonar ou navegar até o diretório
cd /home/vagner-barbosa/Documentos/DevZone/inversodash

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas credenciais

# Executar instalador
chmod +x install.sh
./install.sh
```

Ou manualmente:

```bash
# Copiar e configurar .env
cp .env.example .env
nano .env  # Configure suas credenciais

# Iniciar serviços
docker-compose up -d
```

## 🌐 Acesso

| Serviço | URL |
|---------|-----|
| Dashboard | http://localhost |
| API | http://localhost:8000/api/status |
| InfluxDB | http://localhost:8086 |

> **Nota**: Configure as credenciais do InfluxDB no arquivo `.env` ou via variáveis de ambiente no `docker-compose.yml`.

## 📡 Endpoints da API

### Status atual
```bash
GET /api/status
```

### Histórico
```bash
GET /api/history?minutes=60
```

### Estatísticas
```bash
GET /api/stats
```

### WebSocket
```bash
ws://localhost:8000/ws
```

## 🔧 Configuração

Configure o IP do inversor no arquivo `.env`:

```bash
# Copie o exemplo
cp .env.example .env

# Edite com seu IP
INVERTER_IP=<IP_DO_INVERSOR>  # Altere para o IP do seu inversor
```

## 📊 Dados Coletados

| Métrica | Descrição | Unidade |
|---------|-----------|---------|
| PV Power | Potência do painel solar | W |
| PV Voltage | Tensão do painel | V |
| PV Current | Corrente do painel | A |
| Grid Voltage | Tensão da rede | V |
| Grid Frequency | Frequência da rede | Hz |
| Output Power | Potência de saída | W |
| Temperature | Temperatura do inversor | °C |
| Daily Energy | Energia gerada hoje | kWh |
| Total Energy | Energia total | kWh |

## 🎨 Telas

### Dashboard Principal
- Cards de estatísticas em tempo real
- Gráfico de potência histórico
- Visualização de fluxo de energia
- Painéis de temperatura e status

### Responsivo
- Desktop: Layout em grid 3 colunas
- Tablet: Layout em grid 2 colunas
- Mobile: Layout em coluna única

## 🛠️ Desenvolvimento

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

## 🔍 Troubleshooting

### Inversor não conecta
- Verifique se o IP configurado no `.env` está correto
- Verifique se a porta 502 está aberta: `nc -zv <IP_DO_INVERSOR> 502`
- Verifique se o inversor suporta Modbus TCP

### Containers não iniciam
```bash
# Verificar logs
docker-compose logs -f

# Reconstruir
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

### Porta em uso
Altere as portas no `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Altere a porta externa
```

## 📁 Estrutura de Arquivos

```
inversodash/
├── docker-compose.yml
├── README.md
├── install.sh
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py
│   └── inverter_reader.py
├── frontend/
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       └── index.css
└── database/
    └── (InfluxDB volumes)
```

## 📚 Tecnologias

### Backend
- Python 3.11
- FastAPI
- pymodbus
- python-socketio
- influxdb-client

### Frontend
- React 18
- Tailwind CSS
- Recharts
- Lucide Icons
- Vite

### Infraestrutura
- Docker
- Docker Compose
- Nginx
- InfluxDB

## 📝 Licença

MIT License - Sinta-se livre para usar, modificar e distribuir!

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues ou pull requests.

## ⚡ Inspirado por

- [Goodwe Python Library](https://github.com/marcelblijleven/goodwe)
- [Victron Venus Dashboard](https://github.com/victron-venus/inverter-dashboard)
- [ACBC GivEnergy Dashboard](https://software.andrewcampbell.co.uk/)

---

**Desenvolvido com ☀️ para monitoramento solar!**

# ☀️ InversoDash - Dashboard Solar

Dashboard moderno e em tempo real para monitoramento de inversores solares Goodwe via Modbus TCP.

![Dashboard Solar](https://img.shields.io/badge/Solar-Monitoring-green)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![React](https://img.shields.io/badge/React-18-61DAFB)

## ✨ Funcionalidades

- 📊 **Dashboard em tempo real** com WebSocket
- 📈 **Gráficos interativos** de potência e histórico
- 🌃 **Background Cyberpunk animado** com ciclo dia/noite sincronizado ao horário real
- 🏙️ **Cidade procedimental gerada** com prédios e janelas iluminadas em neon
- ⚡ **Dados elétricos detalhados** (fator de potência, potência ativa/reativa/aparente)
- 🔌 **Strings PV individuais** com monitoramento de cada string separadamente
- 🌡️ **Monitoramento de temperaturas** do inversor e dissipador
- 🔋 **Estatísticas de energia** (diária, semanal, mensal, anual)
- 💰 **Economia em Reais** com cálculo de payback e projeção de 25 anos
- 🚩 **Bandeira tarifária animada** com visualização do custo da energia (verde/amarela/vermelha)
- 🏠 **Informações da rede** (tensão, corrente, frequência)
- ⏱️ **Horas de operação** do inversor com barra de vida útil
- 📱 **Design responsivo** para desktop e mobile (dark theme)
- 🗄️ **Banco de dados InfluxDB** para persistência de dados históricos

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

### Potência e Energia
| Métrica | Descrição | Unidade |
|---------|-----------|---------|
| PV Power | Potência total dos painéis solares | W |
| PV Voltage | Tensão dos painéis | V |
| PV Current | Corrente dos painéis | A |
| Daily Energy | Energia gerada hoje | kWh |
| Total Energy | Energia total acumulada | kWh |

### Strings PV Individuais
| Métrica | Descrição | Unidade |
|---------|-----------|---------|
| String 1-6 | Potência de cada string individual | W |
| V PV1-6 | Tensão de cada string | V |
| I PV1-6 | Corrente de cada string | A |

### Dados Elétricos Detalhados
| Métrica | Descrição | Unidade |
|---------|-----------|---------|
| Active Power | Potência ativa (real) | W |
| Reactive Power | Potência reativa | VAR |
| Apparent Power | Potência aparente | VA |
| Power Factor | Fator de potência | - |
| Grid Voltage | Tensão da rede | V |
| Grid Current | Corrente da rede | A |
| Grid Frequency | Frequência da rede | Hz |

### Temperatura e Status
| Métrica | Descrição | Unidade |
|---------|-----------|---------|
| Inverter Temp | Temperatura do inversor | °C |
| Heatsink Temp | Temperatura do dissipador | °C |
| Operation Hours | Horas totais de operação | h |
| Work Mode | Modo de operação do inversor | - |
| Error Code | Código de erro (se houver) | - |

## 🎨 Telas

### Dashboard Principal
- 🎴 **Cards de estatísticas em tempo real** (PV, Grid, Potência, Energia)
- 📈 **Gráfico de potência histórico** (últimos 60 minutos)
- 💰 **Economia Gerada** em Reais com barra de payback
- ⚡ **Dados Elétricos Detalhados** (potência ativa/reativa/aparente, fator de potência)
- 🔌 **Strings PV Individuais** com eficiência de cada string
- 🌡️ **Painéis de temperatura** (inversor e dissipador)
- ℹ️ **Informações do Sistema** (modo de operação com tooltip, status, horas)

### Background Cyberpunk
- Cidade procedimental gerada aleatoriamente
- Ciclo dia/noite sincronizado com horário real
- Prédios com janelas iluminadas em neon (ciano/magenta)
- Estrelas durante a noite
- Sol e lua animados
- Linha do horizonte com brilho neon

### Responsivo
- Desktop: Layout em grid 3-4 colunas
- Tablet: Layout em grid 2 colunas
- Mobile: Layout em coluna única
- Dark theme com gradientes e glassmorphism

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
- Verifique se o inversor está na mesma rede

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

### Dados não aparecem no dashboard
- Verifique se o backend está conectado ao inversor: `docker-compose logs backend`
- Verifique se o WebSocket está funcionando (ícone de conexão no header)
- Verifique se há dados no InfluxDB: http://localhost:8086

### Background Cyberpunk não aparece
- Verifique se o JavaScript está habilitado no navegador
- O background usa Canvas API - verifique se seu navegador suporta
- Limpe o cache do navegador (Ctrl+F5)

## 📁 Estrutura de Arquivos

```
inversodash/
├── docker-compose.yml
├── README.md
├── install.sh
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── main.py              # API FastAPI + WebSocket
│   └── inverter_reader.py   # Leitura Modbus do inversor
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
│       ├── index.css
│       └── components/
│           ├── CyberpunkCityBackground.jsx  # Background animado
│           ├── PVStringsSection.jsx         # Strings PV individuais
│           ├── ElectricalDetails.jsx          # Dados elétricos detalhados
│           └── TariffFlag.jsx               # Bandeira tarifária animada
```

## 🎭 Animações e Efeitos Visuais

### Background Cyberpunk
- **Geração procedural**: Prédios criados aleatoriamente a cada carregamento
- **Ciclo dia/noite**: Gradiente de céu muda conforme horário real
  - Madrugada (0-5h): Escuro profundo
  - Amanhecer (5-7h): Gradiente roxo/laranja
  - Dia (7-17h): Azul claro
  - Entardecer (17-19h): Gradiente laranja/roxo
  - Noite (19-24h): Roxo escuro com estrelas
- **Janelas iluminadas**: Cores ciano (#00ffff) e magenta (#ff00ff)
- **Antenas piscantes**: LED vermelho em alguns prédios
- **Linha do horizonte**: Brilho neon azul durante a noite

### Bandeira Tarifária Animada
- **Verde**: Pulso suave e lento (3s), glow suave
- **Amarela**: Pulso moderado, glow médio
- **Vermelha**: Pulso rápido de alerta (1.5s), glow intenso
- Tooltip informativo ao passar o mouse

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

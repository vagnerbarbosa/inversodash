# InversoDash - Dashboard Solar

> Dashboard moderno e em tempo real para monitoramento de inversores solares Goodwe via Modbus TCP.

## Overview

**InversoDash** é um sistema completo de monitoramento solar composto por:

- **Backend (Python/FastAPI)**: API REST + WebSocket para leitura do inversor via Modbus TCP
- **Frontend (React)**: Dashboard interativo com gráficos em tempo real
- **Database (InfluxDB)**: Armazenamento de séries temporais de métricas
- **Infrastructure (Docker)**: Containerização completa com Docker Compose

### Principais Tecnologias

| Componente | Tecnologia | Propósito |
|------------|------------|-----------|
| Backend | Python 3.11 + FastAPI | API REST, WebSocket, leitura Modbus |
| Frontend | React 18 + Vite + Tailwind | Interface web responsiva |
| Gráficos | Recharts | Visualização de dados em tempo real |
| Database | InfluxDB 2.7 | Time-series database para histórico |
| Proxy | Nginx | Reverse proxy, servir frontend |
| Containers | Docker + Compose | Orquestração e deploy |

---

## Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTE                                 │
│                    (Browser/Desktop/Mobile)                     │
└────────────────────┬────────────────────────────────────────────┘
                     │ HTTP/WebSocket
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DOCKER HOST                                │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Frontend   │───▶│   Backend    │───▶│  Inversor    │      │
│  │   (Nginx)    │    │  (FastAPI)   │    │  (Modbus)    │      │
│  │   Porta 80   │    │  Porta 8000  │    │<IP_DO_INVERSOR> │      │
│  └──────────────┘    └──────┬───────┘    └──────────────┘      │
│                             │                                   │
│                             ▼                                   │
│                      ┌──────────────┐                          │
│                      │  InfluxDB    │                          │
│                      │  Porta 8086  │                          │
│                      └──────────────┘                          │
└─────────────────────────────────────────────────────────────────┘
```

### Fluxo de Dados

1. **Coleta**: Backend lê dados do inversor via Modbus TCP (a cada 30s)
2. **Armazenamento**: Dados salvos em memória + InfluxDB para histórico
3. **Broadcast**: WebSocket envia atualizações em tempo real para clientes
4. **Visualização**: Frontend React exibe cards, gráficos e fluxo de energia

---

## Estrutura de Diretórios

```
inversodash/
├── CLAUDE.md                  # Este arquivo
├── README.md                  # Documentação do usuário
├── docker-compose.yml         # Orquestração dos serviços
├── Makefile                   # Comandos de conveniência
├── install.sh                 # Script de instalação
├── .env.example               # Template de variáveis
│
├── backend/                   # API Python
│   ├── Dockerfile
│   ├── requirements.txt       # Dependências Python
│   ├── config.py              # Configurações centralizadas
│   ├── main.py                # Servidor FastAPI (entry point)
│   └── inverter_reader.py     # Módulo Modbus TCP
│
├── frontend/                  # Dashboard React
│   ├── Dockerfile
│   ├── nginx.conf             # Configuração reverse proxy
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js     # Configurações de tema
│   ├── index.html
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx           # Entry point React
│       ├── App.jsx            # Componente principal
│       └── index.css          # Estilos globais (Tailwind)
│
└── database/                  # Volumes do InfluxDB (auto-gerado)
```

---

## Convenções de Código

### Backend (Python)

- **Framework**: FastAPI para APIs REST assíncronas
- **Estilo**: PEP 8, type hints obrigatórios
- **Padrão**: Arquitetura em camadas (reader → API → WebSocket)
- **Config**: Centralizada em `config.py` via environment variables
- **Erros**: Tratamento explícito com logging

```python
# Exemplo de estrutura
async def read_inverter_data() -> Dict[str, Any]:
    """Lê dados do inversor com tratamento de erro."""
    try:
        # Leitura Modbus
        data = await reader.read_all_data()
        return {"success": True, "data": data}
    except ModbusException as e:
        logger.error(f"Erro Modbus: {e}")
        return {"success": False, "error": str(e)}
```

### Frontend (React)

- **Estilo**: Functional components com hooks
- **Estilização**: Tailwind CSS com classes utilitárias
- **Componentes**: Pequenos, reutilizáveis, com props tipadas (quando usar TS)
- **Estado**: useState para local, useContext para global (se necessário)
- **Efeitos**: useEffect com cleanup adequado

```jsx
// Exemplo de estrutura
function StatCard({ title, value, unit, icon, color }) {
  const colorClasses = {
    solar: 'from-solar-500/20 to-solar-600/10',
    grid: 'from-grid-500/20 to-grid-600/10',
    // ...
  }

  return (
    <div className={`card bg-gradient-to-br ${colorClasses[color]}`}>
      {/* ... */}
    </div>
  )
}
```

### Docker

- **Multi-stage builds**: Frontend usa build stage (Node) + runtime (Nginx)
- **Imagens slim**: Alpine Linux onde possível
- **Health checks**: Implementar para todos os serviços (TODO)
- **Volumes**: Apenas para dados persistentes (InfluxDB)

---

## Comandos Comuns

### Desenvolvimento Local

```bash
# Backend
cd backend
pip install -r requirements.txt
python main.py

# Frontend
cd frontend
npm install
npm run dev          # Porta 3000
```

### Docker

```bash
# Usar Makefile (recomendado)
make start           # Inicia todos os serviços
make stop            # Para todos os serviços
make restart         # Reinicia serviços
make logs            # Logs em tempo real
make build           # Reconstrói containers
make clean           # Remove tudo incluindo volumes

# Ou docker-compose diretamente
docker-compose up -d
docker-compose logs -f backend
docker-compose exec backend sh
```

### Testes

```bash
# Testar conexão com inversor
make test
# ou
nc -zv <IP_DO_INVERSOR> 502

# Testar API
curl http://localhost:8000/api/status
curl http://localhost:8000/api/stats
curl "http://localhost:8000/api/history?minutes=60"

# WebSocket
wscat -c ws://localhost:8000/ws
```

---

## Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na raiz (copie de `.env.example`):

```bash
# Inversor
INVERTER_IP=<IP_DO_INVERSOR>
INVERTER_PORT=502
INVERTER_FAMILY=DT

# InfluxDB
INFLUXDB_DB=inversodash
INFLUXDB_ADMIN_USER=admin
INFLUXDB_ADMIN_PASSWORD=inversodash2024

# API
UPDATE_INTERVAL=30       # Segundos entre leituras
```

### Personalização do Tema

Editar `frontend/tailwind.config.js`:

```javascript
colors: {
  solar: {
    400: '#facc15',     // Amarelo solar
    500: '#eab308',
  },
  grid: {
    400: '#22d3ee',     // Ciano rede
    500: '#06b6d4',
  },
  // ...
}
```

---

## API Endpoints

| Endpoint | Método | Descrição | Exemplo |
|----------|--------|-----------|---------|
| `/api/status` | GET | Dados atuais | `curl /api/status` |
| `/api/history` | GET | Histórico (min) | `curl "/api/history?minutes=60"` |
| `/api/stats` | GET | Estatísticas | `curl /api/stats` |
| `/ws` | WS | WebSocket tempo real | `wscat -c ws://localhost:8000/ws` |

### Formato de Resposta

```json
{
  "timestamp": "2024-01-15T14:30:00",
  "connected": true,
  "pv": {
    "total_power": 150,
    "pv1_voltage": 300.7,
    "pv1_current": 0.5
  },
  "grid": {
    "voltage": 220.8,
    "current": 0.9,
    "frequency": 59.97
  },
  "power": {
    "output": 160
  },
  "temperature": {
    "inverter": 40.4,
    "heatsink": 40.1
  },
  "energy": {
    "daily": 19.5,
    "total": 92.2
  },
  "status": {
    "work_mode": "Normal",
    "error_code": 0
  }
}
```

---

## Troubleshooting

### Inversor não conecta

```bash
# Verificar porta Modbus
nc -zv <IP_DO_INVERSOR> 502

# Verificar se inversor responde ao ping
ping <IP_DO_INVERSOR>

# Verificar logs do backend
docker-compose logs -f backend
```

### Frontend não carrega

```bash
# Verificar se nginx está rodando
docker-compose ps

# Verificar logs do frontend
docker-compose logs frontend

# Reconstruir frontend
make build
```

### WebSocket desconecta

- Verificar se backend está rodando: `docker-compose ps`
- Verificar logs: `docker-compose logs backend`
- Verificar CORS no navegador (F12 → Console)

---

## Roadmap / TODOs

### Curto Prazo

- [ ] Implementar autenticação JWT
- [ ] Adicionar exportação de dados (CSV/Excel)
- [ ] Implementar alertas via email/telegram
- [ ] Criar página de configurações no frontend

### Médio Prazo

- [ ] Suporte a múltiplos inversores
- [ ] PWA (Progressive Web App) para mobile
- [ ] Integração com previsão do tempo (API)
- [ ] Cálculo de economia financeira (R$)

### Longo Prazo

- [ ] App mobile nativo (React Native)
- [ ] Integração com Home Assistant
- [ ] Machine learning para predição de geração
- [ ] Suporte a outros fabricantes (Sungrow, Growatt)

---

## Dependências Externas

### Hardware

- **Inversor Goodwe** com suporte Modbus TCP (porta 502)
- **Dongle WiFi+LAN** (modelo WLA0000-01-00P ou similar)
- **Rede local** com acesso ao IP do inversor

### Software

- Docker 20.10+
- Docker Compose 2.0+
- Opcional: Make (para comandos simplificados)

---

## Documentação de Referência

- [Goodwe Python Library](https://github.com/marcelblijleven/goodwe)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [React Docs](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [InfluxDB 2.0](https://docs.influxdata.com/influxdb/v2.0/)
- [Modbus TCP Protocol](https://modbus.org/specs.php)

---

## Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Convenções de Commit

- `feat:` Nova funcionalidade
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação, sem alteração de código
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção, dependências

---

## Licença

MIT License - Veja [LICENSE](LICENSE) para detalhes.

---

## Contato / Suporte

- **Issues**: Abrir issue no GitHub
- **Email**: [seu-email@exemplo.com]
- **Wiki**: [Link para wiki se existir]

---

## Notas para Desenvolvedores

### Antes de fazer alterações

1. **Leia este CLAUDE.md** completamente
2. **Verifique se há issues abertas** relacionadas
3. **Execute testes**: `make test` e verifique se o inversor responde
4. **Faça backup** dos dados do InfluxDB antes de alterações estruturais

### Padrões de Commit

- Commits devem ser atômicos (uma alteração lógica por commit)
- Mensagens em português ou inglês, mas consistentes
- Referenciar issue quando aplicável: "Fix #123 - Corrige timeout"

### Code Review

- Sempre revise PRs antes de mergear
- Verifique se o código segue as convenções deste arquivo
- Teste localmente antes de aprovar

---

> **Nota**: Este é um projeto em evolução. Sinta-se livre para sugerir melhorias e reportar problemas!

**Última atualização**: 2024-06-28  
**Versão**: 1.0.0  
**Autor**: [Seu Nome]

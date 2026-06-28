# InversoDash

Dashboard moderno para monitoramento de inversores solares Goodwe via Modbus TCP.

**Stack**: Python 3.11 + FastAPI • React 18 + Vite • InfluxDB • Docker

---

## Quick Start

```bash
# Iniciar tudo
make start

# Ou com docker compose
docker compose up -d

# Verificar status
curl http://localhost:8000/health
docker compose ps
```

---

## Arquitetura

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Browser    │────▶│    Nginx     │────▶│   FastAPI    │
│              │     │   (Port 80)  │     │  (Port 8000) │
└──────────────┘     └──────────────┘     └──────┬───────┘
                                                  │
                       ┌──────────────┐    ┌──────▼───────┐
                       │  InfluxDB    │◄───┤    Modbus    │
                       │ (Port 8086)  │    │<IP_DO_INVERSOR> │
                       └──────────────┘    └──────────────┘
```

**Fluxo**: Inversor → Modbus TCP → FastAPI → WebSocket/HTTP → React + InfluxDB (histórico)

---

## Comandos

| Comando | Descrição |
|---------|-----------|
| `make start` | Inicia todos os serviços |
| `make stop` | Para todos os serviços |
| `make restart` | Reinicia serviços |
| `make logs` | Logs em tempo real |
| `make build` | Reconstrói containers |
| `make clean` | Remove tudo (incluindo volumes) |
| `make test` | Testa conexão com inversor |
| `make network-info` | Mostra IPs de acesso |

---

## API Endpoints

| Endpoint | Descrição | Exemplo |
|----------|-----------|---------|
| `GET /health` | Status do sistema | `curl /health` |
| `GET /api/status` | Dados atuais | `curl /api/status` |
| `GET /api/history?minutes=60` | Histórico | `curl "/api/history?minutes=60"` |
| `WS /ws` | WebSocket tempo real | `wscat -c ws://localhost:8000/ws` |

---

## Acesso via Rede Local

O dashboard está configurado para ser acessível de **qualquer dispositivo na mesma rede WiFi** (celular, tablet, TV, notebook, etc.).

### Descobrir o IP da máquina

```bash
make network-info
```

Ou manualmente:
```bash
ip route get 1.1.1.1 | grep -oP 'src \K\S+'
```

### URLs de acesso

| Origem | URL |
|----------|-----|
| Esta máquina | http://localhost ou http://127.0.0.1 |
| Outros dispositivos | http://**IP_DA_MAQUINA** (ex: http://192.168.0.100) |

### Requisitos

- ✅ Todos os dispositivos na mesma rede WiFi
- ✅ Firewall permitindo porta 80 (HTTP)
- ✅ Docker rodando com `make start`

---

## Working with Spec Kit

Este projeto usa [GitHub Spec Kit](https://github.github.io/spec-kit/) para desenvolvimento guiado por especificações.

### Workflow

1. **Consultar especificação**: Ver `specs/` para ver requisitos detalhados
2. **Executar tarefas**: Cada spec tem `tasks.md` com subtarefas
3. **Atualizar progresso**: Marcar tasks concluídas nos arquivos `.md`

### Estrutura de Specs

```
specs/
├── 001-rate-limiting/          # API rate limiting
├── 002-error-boundaries/       # React Error Boundaries
├── 003-influxdb-implementation/# Persistência time-series
├── 004-jwt-authentication/     # Autenticação JWT
├── 005-non-root-user/          # Docker security
├── 006-health-checks/          # Health monitoring
├── 007-input-validation/       # Pydantic validation
├── 008-react-query/            # Data fetching
├── 009-https-config/           # TLS/HTTPS
└── 010-testing-suite/          # Testes
```

Cada spec contém: `spec.md` (requisitos), `plan.md` (plano), `tasks.md` (tarefas).

### Constituição do Projeto

Ver `.specify/memory/constitution.md` para princípios e padrões técnicos.

---

## Configuração

Copie `.env.example` para `.env` e ajuste:

```bash
INVERTER_IP=<IP_DO_INVERSOR>
INVERTER_PORT=502
INVERTER_FAMILY=DT
UPDATE_INTERVAL=30

INFLUXDB_ADMIN_USER=admin
INFLUXDB_ADMIN_PASSWORD=changeme
```

---

## Troubleshooting

### Inversor não conecta

```bash
nc -zv <IP_DO_INVERSOR> 502
docker compose logs -f backend
```

### Frontend não carrega

```bash
docker compose ps
docker compose logs frontend
make build  # Reconstruir
```

### WebSocket desconecta

- Verificar backend: `docker compose ps`
- Verificar CORS no navegador (F12 → Console)
- Verificar logs: `docker compose logs backend`

---

## Estrutura do Projeto

```
├── backend/              # FastAPI + Modbus reader
├── frontend/             # React + Vite + Tailwind
├── specs/                # Especificações (Spec Kit)
├── .specify/             # Constituição do projeto
├── docker-compose.yml
├── Makefile
└── CLAUDE.md            # Este arquivo
```

---

## Referências

- [FastAPI](https://fastapi.tiangolo.com/) • [React](https://react.dev/) • [Tailwind](https://tailwindcss.com/)
- [InfluxDB](https://docs.influxdata.com/) • [Modbus](https://modbus.org/specs.php)
- [Spec Kit Docs](https://github.github.io/spec-kit/)

---

## Licença

MIT License - Ver [LICENSE](LICENSE)

---

**Última atualização**: 2026-06-28

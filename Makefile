.PHONY: help install start stop restart logs build clean update shell

help: ## Mostra ajuda
	@echo "InversoDash - Comandos disponíveis:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

install: ## Instala o dashboard
	@echo "🔧 Instalando InversoDash..."
	chmod +x install.sh
	./install.sh

start: ## Inicia os serviços
	@echo "🚀 Iniciando serviços..."
	docker compose up -d
	@echo "✅ Serviços iniciados!"
	@echo "🌐 Dashboard: http://localhost"
	@echo "📡 API: http://localhost:8000/api/status"

stop: ## Para os serviços
	@echo "🛑 Parando serviços..."
	docker compose down
	@echo "✅ Serviços parados"

restart: ## Reinicia os serviços
	@echo "🔄 Reiniciando serviços..."
	docker compose restart
	@echo "✅ Serviços reiniciados"

logs: ## Mostra logs em tempo real
	@echo "📋 Logs (Ctrl+C para sair)..."
	docker compose logs -f

logs-backend: ## Mostra logs apenas do backend
	@docker compose logs -f backend

logs-frontend: ## Mostra logs apenas do frontend
	@docker compose logs -f frontend

build: ## Reconstrói os containers
	@echo "🔨 Reconstruindo containers..."
	docker compose down
	docker compose build --no-cache
	docker compose up -d
	@echo "✅ Reconstrução concluída"

clean: ## Remove containers e volumes
	@echo "🧹 Limpando containers e volumes..."
	docker compose down -v
	docker system prune -f
	@echo "✅ Limpeza concluída"

update: ## Atualiza para versão mais recente
	@echo "⬆️  Atualizando..."
	docker compose pull
	docker compose up -d
	@echo "✅ Atualização concluída"

shell-backend: ## Abre shell no container backend
	@docker compose exec backend sh

shell-influx: ## Abre shell no InfluxDB
	@docker compose exec influxdb sh

test: ## Testa conexão com inversor
	@echo "🔌 Testando conexão com inversor 192.168.0.212..."
	@nc -zv 192.168.0.212 502 && echo "✅ Conexão OK" || echo "❌ Falha na conexão"

status: ## Mostra status dos containers
	@echo "📊 Status dos containers:"
	@docker compose ps

api: ## Testa endpoints da API
	@echo "🧪 Testando API..."
	@curl -s http://localhost:8000/api/status | head -20

network-info: ## Mostra IPs para acesso na rede local
	@./scripts/show-network-info.sh

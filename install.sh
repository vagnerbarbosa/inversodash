#!/bin/bash

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║            Instalador InversoDash - Dashboard Solar          ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Instalando Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    echo "✅ Docker instalado. Por favor, faça logout e login novamente."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Instalando..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo "✅ Docker Compose instalado"
fi

echo "✅ Docker e Docker Compose verificados"
echo ""

# Construir e iniciar containers
echo "🔧 Construindo containers..."
docker-compose build --no-cache

echo ""
echo "🚀 Iniciando serviços..."
docker-compose up -d

echo ""
echo "⏳ Aguardando serviços iniciarem..."
sleep 10

# Verificar status
echo ""
echo "📊 Status dos containers:"
docker-compose ps

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ✅ INSTALAÇÃO CONCLUÍDA!                    ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║                                                                ║"
echo "║  🌐 Acesse o dashboard em:                                     ║"
echo "║     http://localhost                                           ║"
echo "║                                                                ║"
echo "║  📡 API disponível em:                                         ║"
echo "║     http://localhost:8000/api/status                           ║"
echo "║                                                                ║"
echo "║  🗄️  InfluxDB disponível em:                                   ║"
echo "║     http://localhost:8086                                      ║"
echo "║     Configure as credenciais em .env antes de iniciar          ║"
echo "║                                                                ║"
echo "╠════════════════════════════════════════════════════════════════╣"
echo "║  Comandos úteis:                                               ║"
echo "║                                                                ║"
echo "║  • Ver logs:         docker-compose logs -f                    ║"
echo "║  • Reiniciar:        docker-compose restart                    ║"
echo "║  • Parar:            docker-compose down                       ║"
echo "║  • Atualizar:        docker-compose pull && docker-compose up  ║"
echo "║                                                                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

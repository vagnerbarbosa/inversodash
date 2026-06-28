#!/bin/bash
# Script para anunciar inversodash.local via mDNS no host
# Este script deve ser executado na máquina host, não no container

echo "================================"
echo "  InversoDash mDNS Announcer"
echo "================================"

# Verificar se avahi-publish está instalado
if ! command -v avahi-publish &> /dev/null; then
    echo "⚠️  avahi-utils não instalado"
    echo "Instalando..."
    sudo apt-get update && sudo apt-get install -y avahi-utils
fi

# Obter IP da máquina
IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I | awk '{print $1}')

echo "📡 Anunciando inversodash.local -> $IP"
echo ""
echo "Pressione Ctrl+C para parar"
echo "================================"

# Anunciar via mDNS (HTTP service)
sudo avahi-publish -s "InversoDash" _http._tcp 80 "path=/" "inversodash.local"

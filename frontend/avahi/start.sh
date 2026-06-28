#!/bin/sh

# Script de inicialização do InversoDash com mDNS

echo "================================"
echo "  InversoDash - Starting..."
echo "================================"

# Configurar hostname mDNS (inversodash.local)
echo "Configurando mDNS..."
hostname inversodash

# Iniciar dbus (requerido pelo avahi)
echo "Iniciando dbus..."
mkdir -p /var/run/dbus
dbus-daemon --system --fork

# Iniciar avahi-daemon para anunciar inversodash.local
echo "Iniciando avahi-daemon (mDNS)..."
avahi-daemon --daemonize --no-drop-root

# Aguardar avahi iniciar
sleep 2

# Verificar se avahi está rodando
if pgrep avahi-daemon > /dev/null; then
    echo "✓ mDNS iniciado - Acesse via http://inversodash.local"
else
    echo "⚠ Falha ao iniciar mDNS, mas nginx continuará"
fi

# Iniciar nginx em foreground
echo "Iniciando nginx..."
echo "================================"
echo "  Dashboard disponível em:"
echo "  - http://localhost"
echo "  - http://inversodash.local"
echo "  - http://$(hostname -i 2>/dev/null || echo 'IP_DA_MAQUINA')"
echo "================================"
exec nginx -g 'daemon off;'

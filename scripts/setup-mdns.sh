#!/bin/bash
# Setup script para configurar mDNS (inversodash.local) no host

echo "==================================="
echo "  InversoDash - mDNS Setup"
echo "==================================="
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo "⚠️  Este script precisa ser executado como root (sudo)"
    echo "   Execute: sudo ./scripts/setup-mdns.sh"
    exit 1
fi

# Obter IP
IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I | awk '{print $1}')
echo "🌐 IP desta máquina: $IP"
echo ""

# Instalar avahi-utils
echo "📦 Instalando avahi-utils..."
apt-get update &> /dev/null
apt-get install -y avahi-utils avahi-daemon &> /dev/null

# Verificar instalação
if ! command -v avahi-publish &> /dev/null; then
    echo "❌ Falha ao instalar avahi-utils"
    exit 1
fi
echo "✓ avahi-utils instalado"
echo ""

# Criar arquivo de host estático para inversodash.local
echo "📝 Configurando inversodash.local..."
mkdir -p /etc/avahi/hosts
echo "$IP inversodash.local" > /etc/avahi/hosts/inversodash

# Criar service file para o InversoDash
cat > /etc/avahi/services/inversodash.service << 'EOF'
<?xml version="1.0" standalone='no'?>
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
  <name>InversoDash Dashboard</name>
  <service>
    <type>_http._tcp</type>
    <port>80</port>
    <txt-record>path=/</txt-record>
  </service>
</service-group>
EOF

echo "✓ Configuração criada"
echo ""

# Reiniciar avahi-daemon
echo "🔄 Reiniciando avahi-daemon..."
systemctl restart avahi-daemon
systemctl enable avahi-daemon

echo "✓ avahi-daemon reiniciado"
echo ""

# Testar
echo "🧪 Testando..."
sleep 2
if avahi-resolve-host-name inversodash.local &> /dev/null; then
    echo "✓ inversodash.local resolvido com sucesso!"
else
    echo "⚠️  Teste de resolução falhou (pode levar alguns segundos para propagar)"
fi
echo ""

echo "==================================="
echo "✅ Configuração concluída!"
echo ""
echo "Agora você pode acessar o dashboard via:"
echo "  📱 http://inversodash.local"
echo "  🌐 http://$IP"
echo ""
echo "Em qualquer dispositivo da rede WiFi!"
echo "==================================="

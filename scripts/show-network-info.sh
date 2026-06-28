#!/bin/bash
# Script para mostrar informações de rede do InversoDash

echo "==================================="
echo "   InversoDash - Network Info"
echo "==================================="
echo ""

# Detectar IP da máquina
if command -v ip &> /dev/null; then
    IP=$(ip route get 1.1.1.1 2>/dev/null | grep -oP 'src \K\S+' || hostname -I | awk '{print $1}')
elif command -v ifconfig &> /dev/null; then
    IP=$(ifconfig | grep -E "inet " | grep -v "127.0.0.1" | head -1 | awk '{print $2}' | sed 's/addr://')
else
    IP=$(hostname -I | awk '{print $1}')
fi

echo "🌐 Endereços de acesso:"
echo ""
echo "   Local (esta máquina):"
echo "      http://localhost"
echo "      http://127.0.0.1"
echo ""
echo "   Rede Local (outros dispositivos):"
echo "      http://${IP:-'IP_DA_MAQUINA'}"
echo ""
echo "   Exemplos por dispositivo:"
echo "      • Celular:  http://${IP:-'IP'}"
echo "      • Tablet:   http://${IP:-'IP'}"
echo "      • TV:       http://${IP:-'IP'}"
echo "      • Notebook: http://${IP:-'IP'}"
echo ""
echo "==================================="
echo ""
echo "ℹ️  Dicas:"
echo "   - Certifique-se de que todos os dispositivos"
echo "     estão na mesma rede WiFi"
echo "   - Se não carregar, verifique o firewall"
echo "   - A porta 80 deve estar liberada"
echo ""

# Verificar status dos containers
echo "🐳 Status dos containers:"
docker compose ps 2>/dev/null || docker-compose ps 2>/dev/null || echo "   Docker não está rodando ou não encontrado"
echo ""

#!/bin/bash
# Quick diagnostic script
set -e

# 1. Login
RESP=$(curl -s -X POST http://localhost:8000/usuarios/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"Admin123!"}')

TOKEN=$(echo "$RESP" | python3 -c "import sys,json;print(json.load(sys.stdin)['access_token'])")
echo "=== TOKEN OK ==="

# 2. Vehiculos via port 3001 (mapped from container port 3000)
echo ""
echo "=== VEHICULOS (port 3001 host -> 3000 container) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:3001/vehiculos -H "Authorization: Bearer $TOKEN"

# 3. Zonas direct port 8081
echo ""
echo "=== ZONAS direct (port 8081) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:8081/api/v1/zonas -H "Authorization: Bearer $TOKEN"

# 4. Zonas via Kong
echo ""
echo "=== ZONAS via Kong ==="
curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:8000/zonas -H "Authorization: Bearer $TOKEN"

# 5. Tickets via Kong
echo ""
echo "=== TICKETS via Kong ==="
curl -s -w "\nHTTP_STATUS:%{http_code}" http://localhost:8000/tickets/emitir -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" -d '{"idEspacio":"test","placa":"ABC-123"}' 2>/dev/null || echo "FAILED"

echo ""
echo "=== DONE ==="

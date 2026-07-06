#!/bin/bash
# Test all services with admin JWT

LOGIN=$(curl -s -X POST http://localhost:8000/usuarios/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"testadmin","password":"Admin123!"}')

TOKEN=$(echo $LOGIN | python3 -c 'import sys,json; print(json.load(sys.stdin)["access_token"])')

if [ -z "$TOKEN" ]; then
  echo "ERROR: No se pudo obtener el token"
  echo $LOGIN
  exit 1
fi

echo "=== TOKEN OK (primeros 50 chars) ==="
echo "${TOKEN:0:50}..."
echo ""

echo "=== GET /vehiculos (via Kong) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/vehiculos/vehiculos | head -c 500

echo ""
echo "=== GET /zonas (directo:8081) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8081/api/v1/zonas/

echo ""
echo "=== GET /zonas (via Kong) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/zonas/zonas/

echo ""
echo "=== GET /trazabilidad/historial (via Kong) ==="
curl -s -w "\nHTTP_STATUS:%{http_code}\n" \
  -H "Authorization: Bearer $TOKEN" \
  http://localhost:8000/trazabilidad/trazabilidad/historial | head -c 500

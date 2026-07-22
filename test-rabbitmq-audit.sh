#!/bin/bash
set -e

USUARIOS="http://localhost:5000"
VEHICULOS="http://localhost:3001"
TICKETS="http://localhost:3003"
AUDIT="http://localhost:3004"

PASS=0
FAIL=0

check() {
  local name="$1" expected="$2" actual="$3"
  if echo "$expected" | grep -qw "$actual"; then
    echo -e "\e[32m[PASS]\e[0m $name -> $actual"
    PASS=$((PASS + 1))
  else
    echo -e "\e[31m[FAIL]\e[0m $name -> $actual (expected: $expected)"
    FAIL=$((FAIL + 1))
  fi
}

echo ""
echo "========================================"
echo "  TEST: RabbitMQ Audit Event Flow"
echo "========================================"
echo ""

# 1. Login
echo "--- 1. Login admin ---"
LOGIN=$(curl -s -X POST "$USUARIOS/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin","password":"Admin123!"}')
TOKEN=$(echo "$LOGIN" | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])" 2>/dev/null || echo "")
if [ -z "$TOKEN" ]; then
  echo "[FATAL] No se pudo obtener token"
  exit 1
fi
echo -e "\e[32m[PASS]\e[0m Login exitoso"

# 2. Baseline audit count
echo ""
echo "--- 2. Baseline audit ---"
BASELINE=$(curl -s "$AUDIT/api/v1/audit" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d, list) else d.get('Count', len(d.get('value',[]))))" 2>/dev/null || echo "0")
echo "  Audit events actuales: $BASELINE"

# 3. Crear vehiculo (CREATE -> RabbitMQ)
echo ""
echo "--- 3. Crear vehiculo (RabbitMQ CREATE) ---"
PLACA="RBT-$(shuf -i 1000-9999 -n 1)"
VEHICLE=$(curl -s -w "\n%{http_code}" -X POST "$VEHICULOS/vehiculos" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-mac-address: AA:BB:CC:DD:EE:FF" \
  -d "{\"tipo\":\"auto\",\"datos\":{\"placa\":\"$PLACA\",\"marca\":\"Toyota\",\"modelo\":\"Corolla\",\"color\":\"Blanco\",\"anio\":2024,\"clasificacion\":\"Gasolina\",\"numeroPuertas\":4,\"capacidadMaletero\":450}}")
HTTP_CODE=$(echo "$VEHICLE" | tail -1)
BODY=$(echo "$VEHICLE" | head -n -1)
check "POST vehiculos" "201" "$HTTP_CODE"
VEHICLE_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null || echo "")
echo "  Vehiculo ID: $VEHICLE_ID"

# 4. Verificar evento CREATE
echo ""
echo "--- 4. Verificar CREATE en audit ---"
sleep 2
AFTER_CREATE=$(curl -s "$AUDIT/api/v1/audit" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d, list) else d.get('Count', len(d.get('value',[]))))" 2>/dev/null || echo "0")
NEW=$((AFTER_CREATE - BASELINE))
echo "  Audit events: $AFTER_CREATE (+$NEW)"
if [ "$NEW" -ge 1 ]; then
  echo -e "\e[32m[PASS]\e[0m Evento CREATE via RabbitMQ"
  PASS=$((PASS + 1))
else
  echo -e "\e[31m[FAIL]\e[0m Evento CREATE no detectado"
  FAIL=$((FAIL + 1))
fi

# 5. Actualizar vehiculo (UPDATE -> RabbitMQ)
echo ""
echo "--- 5. Actualizar vehiculo (RabbitMQ UPDATE) ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X PUT "$VEHICULOS/vehiculos/$VEHICLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "x-mac-address: AA:BB:CC:DD:EE:FF" \
  -d "{\"tipo\":\"auto\",\"datos\":{\"placa\":\"$PLACA\",\"marca\":\"Toyota\",\"modelo\":\"Corolla\",\"color\":\"Gris\",\"anio\":2024,\"clasificacion\":\"Gasolina\",\"numeroPuertas\":4,\"capacidadMaletero\":460}}")
check "PUT vehiculos" "200" "$HTTP_CODE"

# 6. Verificar evento UPDATE
echo ""
echo "--- 6. Verificar UPDATE en audit ---"
sleep 2
AFTER_UPDATE=$(curl -s "$AUDIT/api/v1/audit" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d, list) else d.get('Count', len(d.get('value',[]))))" 2>/dev/null || echo "0")
NEW_UPD=$((AFTER_UPDATE - AFTER_CREATE))
echo "  Audit events: $AFTER_UPDATE (+$NEW_UPD)"
if [ "$NEW_UPD" -ge 1 ]; then
  echo -e "\e[32m[PASS]\e[0m Evento UPDATE via RabbitMQ"
  PASS=$((PASS + 1))
else
  echo -e "\e[31m[FAIL]\e[0m Evento UPDATE no detectado"
  FAIL=$((FAIL + 1))
fi

# 7. Eliminar vehiculo (DELETE -> RabbitMQ)
echo ""
echo "--- 7. Eliminar vehiculo (RabbitMQ DELETE) ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X DELETE "$VEHICULOS/vehiculos/$VEHICLE_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "x-mac-address: AA:BB:CC:DD:EE:FF")
check "DELETE vehiculos" "200" "$HTTP_CODE"

# 8. Verificar evento DELETE
echo ""
echo "--- 8. Verificar DELETE en audit ---"
sleep 2
AFTER_DELETE=$(curl -s "$AUDIT/api/v1/audit" -H "Authorization: Bearer $TOKEN" | python3 -c "import sys,json; d=json.load(sys.stdin); print(len(d) if isinstance(d, list) else d.get('Count', len(d.get('value',[]))))" 2>/dev/null || echo "0")
NEW_DEL=$((AFTER_DELETE - AFTER_UPDATE))
echo "  Audit events: $AFTER_DELETE (+$NEW_DEL)"
if [ "$NEW_DEL" -ge 1 ]; then
  echo -e "\e[32m[PASS]\e[0m Evento DELETE via RabbitMQ"
  PASS=$((PASS + 1))
else
  echo -e "\e[31m[FAIL]\e[0m Evento DELETE no detectado"
  FAIL=$((FAIL + 1))
fi

# 9. Broken Access Control - POST sin token
echo ""
echo "--- 9. BROKEN ACCESS CONTROL: POST audit sin auth ---"
BAC_POST=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$AUDIT/api/v1/audit" \
  -H "Content-Type: application/json" \
  -d '{"servicio":"ms-hacker","accion":"DELETE","entidad":"USUARIO","usuario":"attacker"}')
if [ "$BAC_POST" = "201" ]; then
  echo -e "\e[31m[VULN]\e[0m POST /api/v1/audit acepta requests sin auth -> Broken Access Control!"
  FAIL=$((FAIL + 1))
else
  echo -e "\e[32m[PASS]\e[0m POST /api/v1/audit rechaza sin auth -> $BAC_POST"
  PASS=$((PASS + 1))
fi

# 10. Broken Access Control - GET sin token
echo ""
echo "--- 10. BROKEN ACCESS CONTROL: GET audit sin auth ---"
BAC_GET=$(curl -s -o /dev/null -w "%{http_code}" "$AUDIT/api/v1/audit")
if [ "$BAC_GET" = "200" ]; then
  echo -e "\e[31m[VULN]\e[0m GET /api/v1/audit acepta requests sin auth -> Broken Access Control!"
  FAIL=$((FAIL + 1))
else
  echo -e "\e[32m[PASS]\e[0m GET /api/v1/audit rechaza sin auth -> $BAC_GET"
  PASS=$((PASS + 1))
fi

# 11. GET audit con token
echo ""
echo "--- 11. GET audit con token admin ---"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$AUDIT/api/v1/audit" \
  -H "Authorization: Bearer $TOKEN")
check "GET /api/v1/audit con auth" "200" "$HTTP_CODE"

# 12. Ver contenido del audit
echo ""
echo "--- 12. Contenido audit (ultimos 3 eventos) ---"
  curl -s "$AUDIT/api/v1/audit" -H "Authorization: Bearer $TOKEN" | python3 -c "
import sys, json
d = json.load(sys.stdin)
events = d.get('value', d) if isinstance(d, dict) else d
for e in events[:3]:
    print(f\"  [{e.get('timestamp','?')}] {e.get('servicio','?')}/{e.get('accion','?')} -> {e.get('entidad','?')} by {e.get('username','?')}\")
" 2>/dev/null || echo "  (no se pudo parsear)"

# RESUMEN
echo ""
echo "========================================"
echo "  RESUMEN"
echo "========================================"
echo -e "  \e[32mPASS: $PASS\e[0m"
echo -e "  \e[31mFAIL: $FAIL\e[0m"
echo "  TOTAL: $((PASS + FAIL))"
echo "========================================"

if [ "$FAIL" -gt 0 ]; then
  exit 1
fi

#!/bin/bash
HOST="http://localhost:5000"
GREEN='\033[0;32m'; RED='\033[0;31m'; NC='\033[0m'

ok()  { echo -e "  ${GREEN}✅${NC} $1"; }
err() { echo -e "  ${RED}❌${NC} $1"; }

login() {
  local U="$1" P="$2"
  local RESP=$(curl -s -X POST $HOST/auth/login \
    -H "Content-Type: application/json" \
    -d "{\"username\":\"$U\", \"password\":\"$P\"}")
  local TOKEN=$(echo $RESP | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
  local ROLES=$(echo $RESP | grep -o '"roles":\[[^]]*\]')
  if [ -n "$TOKEN" ]; then ok "$U ($ROLES)"; else err "$U — FALLO login: $RESP"; fi
}

echo ""
echo "═══════════ Verificación de SEED ════════════"
echo "Probando login de todos los usuarios del seed:"
echo ""
login "testadmin" "Admin123!"
login "superusr"  "Super123!"
login "jpropiet"  "Prop123!"
login "mgomez"    "Prop123!"
login "ezona1"    "Zona123!"
echo ""
echo "═════════════════════════════════════════════"

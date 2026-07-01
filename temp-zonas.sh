#!/bin/bash
TOKEN=$(curl -s -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testadmin", "password":"Admin123!"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

echo "Token (primeros 50 chars): ${TOKEN:0:50}..."
echo ""
echo "Probando Zonas con token fresco:"
curl -v -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8080/api/v1/zonas \
  -H "Authorization: Bearer $TOKEN" 2>&1 | grep -E "HTTP|< HTTP|error|Error"

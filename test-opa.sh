#!/bin/bash
# test-opa.sh - Script para probar la autorización con OPA en WSL/Ubuntu
# Asegúrate de que el entorno docker-kong-compose.yml esté corriendo.

HOST="http://localhost:5000"

echo "=========================================="
echo " Pruebas de Autorización (OPA) con cURL"
echo "=========================================="

echo -e "\n1. Obteniendo Token JWT..."
# Reemplaza 'jperez' y 'password123' por credenciales válidas de tu base de datos
ADMIN_TOKEN=$(curl -s -X POST $HOST/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"jperez", "password":"password123"}' | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" == "null" ]; then
    echo "Fallo al obtener token. Verifica que el servicio esté arriba y las credenciales sean correctas."
    echo "Petición HTTP: POST $HOST/auth/login"
else
    echo "Token obtenido: ${ADMIN_TOKEN:0:15}..."
    
    echo -e "\n2. Prueba 1: Acceso a /auth/profile (Permitido por auth.profile)"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -X GET $HOST/auth/profile \
      -H "Authorization: Bearer $ADMIN_TOKEN"

    echo -e "\n3. Prueba 2: Creando un Rol (Debe ser Permitido por ser admin)"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -X POST $HOST/roles \
      -H "Authorization: Bearer $ADMIN_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"nombre":"TEST_ROLE", "descripcion":"Rol de prueba OPA"}'

    echo -e "\n4. Prueba 3: Consultando lista de usuarios (Debe ser Permitido por usuarios.read)"
    curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" -X GET $HOST/usuario \
      -H "Authorization: Bearer $ADMIN_TOKEN"
fi

echo -e "\n=========================================="
echo "Para probar con OPA en caliente:"
echo "1. Modifica ./opa/policies/usuarios/authz.rego"
echo "2. Comenta la regla de 'usuarios.read'"
echo "3. Ejecuta de nuevo este script; la Prueba 3 debería retornar 403 Forbidden."
echo "=========================================="

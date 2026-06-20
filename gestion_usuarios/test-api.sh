#!/bin/bash
export DB_HOST=localhost
export DB_PORT=5436
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=usuarios
cd /mnt/c/Users/gamur/Documents/ESPE\ VII\ SI\ 2026/Apps\ Distribuidas/U2/practica_clase/gestion_usuarios

# Start the app in background
node dist/src/main.js > /tmp/app.log 2>&1 &
APP_PID=$!

echo "App started with PID: $APP_PID"

# Wait for app to be ready
echo "Waiting for app to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        echo "App is ready!"
        break
    fi
    sleep 1
done

# Test the API
echo "Testing API..."

# Test root endpoint
echo "GET /"
curl -s http://localhost:3000
echo ""

# Test create persona
echo "POST /persona"
curl -s -X POST http://localhost:3000/persona \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Juan",
    "middleName": "Carlos",
    "lastName": "Perez",
    "dni": "1234567890",
    "email": "juan.perez@example.com",
    "address": "Calle 123",
    "phone": "0991234567",
    "nationality": "Ecuadorian"
  }'
echo ""

# Test get all personas
echo "GET /persona"
curl -s http://localhost:3000/persona
echo ""

# Test create usuario
echo "POST /usuario"
curl -s -X POST http://localhost:3000/usuario \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-uuid-1",
    "username": "testuser",
    "password": "testpass123"
  }'
echo ""

# Test get all usuarios
echo "GET /usuario"
curl -s http://localhost:3000/usuario
echo ""

# Test create role
echo "POST /roles"
curl -s -X POST http://localhost:3000/roles \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "admin",
    "descripcion": "Administrator role"
  }'
echo ""

# Test get all roles
echo "GET /roles"
curl -s http://localhost:3000/roles
echo ""

# Kill the app
kill $APP_PID
echo "App stopped"
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

# Check if app is still running
if ! ps -p $APP_PID > /dev/null; then
    echo "App process died!"
    cat /tmp/app.log
    exit 1
fi

echo "App is running, testing API..."

# Test root endpoint
echo "=== GET / ==="
curl -v http://localhost:3000
echo ""

# Test create persona
echo "=== POST /persona ==="
curl -v -X POST http://localhost:3000/persona \
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
echo "=== GET /persona ==="
curl -v http://localhost:3000/persona
echo ""

# Keep app running for manual testing
echo "App is running on http://localhost:3000"
echo "Press Ctrl+C to stop..."
wait $APP_PID
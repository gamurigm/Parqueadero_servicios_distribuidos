#!/bin/bash
cd /mnt/c/Users/gamur/Documents/ESPE\ VII\ SI\ 2026/Apps\ Distribuidas/U2/practica_clase/gestion_usuarios
export DB_HOST=localhost
export DB_PORT=5436
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=usuarios
nohup node dist/src/main.js > server.log 2>&1 &
echo $! > server.pid
echo "Server started with PID: $(cat server.pid)"
echo "Logs: tail -f server.log"
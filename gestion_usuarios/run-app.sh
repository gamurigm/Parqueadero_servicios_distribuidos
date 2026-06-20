#!/bin/bash
echo "Starting script..."
export DB_HOST=localhost
export DB_PORT=5436
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_NAME=usuarios
cd /mnt/c/Users/gamur/Documents/ESPE\ VII\ SI\ 2026/Apps\ Distribuidas/U2/practica_clase/gestion_usuarios
node dist/src/main.js 2>&1
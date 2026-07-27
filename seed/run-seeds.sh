#!/bin/sh
set -eu

log() {
  printf '[db-seed] %s\n' "$*"
}

wait_pg() {
  host="$1"
  db="$2"
  user="$3"
  pass="$4"

  log "Esperando PostgreSQL ${host}/${db}..."
  until PGPASSWORD="$pass" pg_isready -h "$host" -U "$user" -d "$db" >/dev/null 2>&1; do
    sleep 2
  done
}

wait_table() {
  host="$1"
  db="$2"
  user="$3"
  pass="$4"
  table="$5"

  log "Esperando tabla ${table} en ${db}..."
  until [ "$(PGPASSWORD="$pass" psql -h "$host" -U "$user" -d "$db" -Atqc "select to_regclass('${table}') is not null" 2>/dev/null || true)" = "t" ]; do
    sleep 2
  done
}

run_sql() {
  host="$1"
  db="$2"
  user="$3"
  pass="$4"
  file="$5"

  log "Ejecutando ${file} en ${db}"
  PGPASSWORD="$pass" psql -v ON_ERROR_STOP=1 -h "$host" -U "$user" -d "$db" -f "/seed/${file}"
}

USUARIOS_PASS="${USUARIOS_DB_PASSWORD:-xasmdno123XAW2342as}"
VEHICULOS_PASS="${VEHICULOS_DB_PASSWORD:-xasmdnoasd65168zcs}"
ZONAS_PASS="${ZONAS_DB_PASSWORD:-xas52sf6zxc123XAW25asdzxkmas}"
TRAZABILIDAD_PASS="${TRAZABILIDAD_DB_PASSWORD:-xasmdno123XAW2342as}"
TICKETS_PASS="${TICKETS_DB_PASSWORD:-t1ck3tsP4ssX2342as}"

wait_pg usuarios-database UsuariosDB admin_user "$USUARIOS_PASS"
wait_table usuarios-database UsuariosDB admin_user "$USUARIOS_PASS" public.roles
wait_table usuarios-database UsuariosDB admin_user "$USUARIOS_PASS" public.personas
wait_table usuarios-database UsuariosDB admin_user "$USUARIOS_PASS" public.usuarios
wait_table usuarios-database UsuariosDB admin_user "$USUARIOS_PASS" public.roles_usuario
run_sql usuarios-database UsuariosDB admin_user "$USUARIOS_PASS" 01_usuarios.sql

wait_pg vehiculos-database VehiculoDB admin_user "$VEHICULOS_PASS"
wait_table vehiculos-database VehiculoDB admin_user "$VEHICULOS_PASS" public.vehiculo
run_sql vehiculos-database VehiculoDB admin_user "$VEHICULOS_PASS" 02_vehiculos.sql

wait_pg zonas-database ZonasDB admin_user "$ZONAS_PASS"
wait_table zonas-database ZonasDB admin_user "$ZONAS_PASS" public.zonas
wait_table zonas-database ZonasDB admin_user "$ZONAS_PASS" public.espacios
run_sql zonas-database ZonasDB admin_user "$ZONAS_PASS" 04_zonas_espacios.sql

wait_pg trazabilidad-database TrazabilidadDB admin_user "$TRAZABILIDAD_PASS"
wait_table trazabilidad-database TrazabilidadDB admin_user "$TRAZABILIDAD_PASS" public.asignaciones
run_sql trazabilidad-database TrazabilidadDB admin_user "$TRAZABILIDAD_PASS" 03_asignaciones.sql

wait_pg tickets-database TicketsDB admin_user "$TICKETS_PASS"
wait_table tickets-database TicketsDB admin_user "$TICKETS_PASS" public.tickets
run_sql tickets-database TicketsDB admin_user "$TICKETS_PASS" 05_tickets.sql

log "Seeds cargadas correctamente"

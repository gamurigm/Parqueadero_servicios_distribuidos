package authz.tickets

import rego.v1

import data.authz.has_role
import data.authz.allow as global_allow

default allow = false

# Admin universal
allow if {
    global_allow
}

# Solo usuarios con el rol empleado pueden emitir tickets.
allow if {
    input.resource == "tickets.emitir"
    has_role("empleado")
}

# Los procesos operativos del ticket tambien son de empleados.
allow if {
    input.resource == "tickets.pagar"
    has_role("empleado")
}

allow if {
    input.resource == "tickets.anular"
    has_role("empleado")
}

# Consultar tickets requiere un usuario autenticado.
allow if {
    input.resource == "tickets.read"
    input.user.id != ""
}
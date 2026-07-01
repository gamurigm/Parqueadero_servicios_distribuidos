package authz.trazabilidad

import rego.v1

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal
allow if {
    global_allow
}

# assignments.create: propietario
allow if {
    input.resource == "assignments.create"
    has_role("propietario")
}

# assignments.read: Cualquier usuario autenticado
allow if {
    input.resource == "assignments.read"
    input.user.id != ""
}

# assignments.list: propietario
allow if {
    input.resource == "assignments.list"
    has_role("propietario")
}

# assignments.fleet: el propio propietario o admin
allow if {
    input.resource == "assignments.fleet"
    input.user.id != ""
}

# assignments.update: propietario
allow if {
    input.resource == "assignments.update"
    has_role("propietario")
}

# assignments.delete: Solo administradores (cubierto por admin universal)

# trazabilidad.read: Solo administradores (cubierto por admin universal)

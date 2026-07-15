package authz.trazabilidad

import rego.v1

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal
allow if {
    global_allow
}

# asignaciones.create: empleado
allow if {
    input.resource == "asignaciones.create"
    has_role("empleado")
}

# asignaciones.read: Cualquier usuario autenticado
allow if {
    input.resource == "asignaciones.read"
    input.user.id != ""
}

# asignaciones.list: propietario
allow if {
    input.resource == "asignaciones.list"
    has_role("propietario")
}

# asignaciones.fleet: el propio propietario o admin
allow if {
    input.resource == "asignaciones.fleet"
    input.user.id != ""
}

# asignaciones.delete: Solo super_user (admin no puede eliminar)
allow if {
    input.resource == "asignaciones.delete"
    has_role("super_user")
}

# asignaciones.physical_delete: Solo super_user
allow if {
    input.resource == "asignaciones.physical_delete"
    has_role("super_user")
}

# trazabilidad.read: admin
allow if {
    input.resource == "trazabilidad.read"
    has_role("admin")
}

# trazabilidad.physical_delete: Solo super_user
allow if {
    input.resource == "trazabilidad.physical_delete"
    has_role("super_user")
}

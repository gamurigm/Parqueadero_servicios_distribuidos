package authz.vehiculos

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal
allow if {
    global_allow
}

# vehiculos.read: Cualquier usuario autenticado
allow if {
    input.resource == "vehiculos.read"
    input.user.id != ""
}

# vehiculos.list: Cualquier usuario autenticado
allow if {
    input.resource == "vehiculos.list"
    input.user.id != ""
}

# vehiculos.create: propietario
allow if {
    input.resource == "vehiculos.create"
    has_role("propietario")
}

# vehiculos.update: propietario
allow if {
    input.resource == "vehiculos.update"
    has_role("propietario")
}

# vehiculos.delete: Solo administradores (cubierto por admin universal)

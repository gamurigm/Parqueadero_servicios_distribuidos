package authz.usuarios

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal
allow if {
    global_allow
}

# usuarios.read: Cualquier usuario autenticado
allow if {
    input.resource == "usuarios.read"
    input.user.id != ""
}

# usuarios.update: El propio usuario o admin
allow if {
    input.resource == "usuarios.update"
    input.user.id != ""
}

# roles.read: Cualquier usuario autenticado
allow if {
    startswith(input.resource, "roles.read")
    input.user.id != ""
}

# personas.read: Cualquier usuario autenticado
allow if {
    input.resource == "personas.read"
    input.user.id != ""
}

# auth.profile: Cualquier usuario autenticado
allow if {
    input.resource == "auth.profile"
    input.user.id != ""
}

# auth.logout: Cualquier usuario autenticado
allow if {
    input.resource == "auth.logout"
    input.user.id != ""
}

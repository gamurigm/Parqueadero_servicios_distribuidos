package authz.usuarios

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal
allow {
    global_allow
}

# usuarios.read: Cualquier usuario autenticado
allow {
    input.resource == "usuarios.read"
    input.user.id != ""
}

# usuarios.update: El propio usuario o admin
allow {
    input.resource == "usuarios.update"
    input.user.id != ""
}

# roles.read: Cualquier usuario autenticado
allow {
    startswith(input.resource, "roles.read")
    input.user.id != ""
}

# personas.read: Cualquier usuario autenticado
allow {
    input.resource == "personas.read"
    input.user.id != ""
}

# auth.profile: Cualquier usuario autenticado
allow {
    input.resource == "auth.profile"
    input.user.id != ""
}

# auth.logout: Cualquier usuario autenticado
allow {
    input.resource == "auth.logout"
    input.user.id != ""
}

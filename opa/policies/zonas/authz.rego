package authz.zonas

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal
allow {
    global_allow
}

# zones.read: Cualquier usuario autenticado
allow {
    input.resource == "zones.read"
    input.user.id != ""
}

# zones.spaces.read: Cualquier usuario autenticado
allow {
    input.resource == "zones.spaces.read"
    input.user.id != ""
}

# zones.create: Solo administradores (cubierto por admin universal)

# zones.update: encargado_zona
allow {
    input.resource == "zones.update"
    has_role("encargado_zona")
}

# zones.delete: Solo administradores (cubierto por admin universal)

# zones.activate: Solo administradores (cubierto por admin universal)

# spaces.create: encargado_zona
allow {
    input.resource == "spaces.create"
    has_role("encargado_zona")
}

# spaces.update: encargado_zona
allow {
    input.resource == "spaces.update"
    has_role("encargado_zona")
}

# spaces.change-status: encargado_zona
allow {
    input.resource == "spaces.change-status"
    has_role("encargado_zona")
}

# spaces.activate: encargado_zona
allow {
    input.resource == "spaces.activate"
    has_role("encargado_zona")
}

# spaces.delete: Solo administradores (cubierto por admin universal)

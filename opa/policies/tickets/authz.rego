package authz.tickets

import data.authz.allow as global_allow
import data.authz.has_role
import data.authz.is_authenticated

default allow = false

# Admin universal
allow if {
    global_allow
}

# ============================================
# RECURSOS DE TICKETS
# ============================================

# tickets.read: Cualquier usuario autenticado
allow if {
    input.resource == "tickets.read"
    is_authenticated
}

# tickets.create: Emitir ticket (cualquier usuario autenticado con rol empleado o admin)
allow if {
    input.resource == "tickets.create"
    is_authenticated
}

allow if {
    input.resource == "tickets.create"
    has_role("admin")
}

# tickets.pay: Pagar ticket (cualquier usuario autenticado)
allow if {
    input.resource == "tickets.pay"
    is_authenticated
}

# tickets.cancel: Anular ticket (solo admin)
allow if {
    input.resource == "tickets.cancel"
    has_role("admin")
}

# tickets.update: Actualizar ticket (solo admin)
allow if {
    input.resource == "tickets.update"
    has_role("admin")
}

# tickets.delete: Eliminar ticket (solo admin)
allow if {
    input.resource == "tickets.delete"
    has_role("admin")
}
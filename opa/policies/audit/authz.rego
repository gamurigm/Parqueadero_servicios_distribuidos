package authz.audit

import rego.v1

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal
allow if {
    global_allow
}

# Cualquier usuario autenticado puede consultar auditoria
allow if {
    input.resource == "audit.read"
    input.user.id != ""
}

package authz.audit

import rego.v1

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Super user: acceso total
allow if {
    global_allow
}

# Admin puede leer logs de auditoria (incluye logs de login)
allow if {
    input.resource == "audit.read"
    has_role("admin")
}

allow if {
    input.resource == "audit.detail"
    has_role("admin")
}

# Auditor puede leer logs de auditoria
allow if {
    input.resource == "audit.read"
    has_role("auditor")
}

allow if {
    input.resource == "audit.detail"
    has_role("auditor")
}

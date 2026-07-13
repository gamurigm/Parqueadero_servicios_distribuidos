package authz.audit

import rego.v1

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Super user: acceso total
allow if {
    global_allow
}

# Solo auditor y super_user pueden leer logs de auditoria
allow if {
    input.resource == "audit.read"
    has_role("auditor")
}

allow if {
    input.resource == "audit.detail"
    has_role("auditor")
}

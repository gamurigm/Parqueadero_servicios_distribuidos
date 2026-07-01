package authz

import rego.v1

default allow = false

# Admin universal: un admin tiene acceso a todo
allow if {
    has_role("admin")
}

has_role(role_name) if {
    some i
    input.user.roles[i] == role_name
}

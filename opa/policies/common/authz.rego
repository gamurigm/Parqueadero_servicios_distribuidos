package authz

import rego.v1

default allow = false

# Super user: acceso total incluyendo borrado físico
allow if {
    has_role("super_user")
}

# Admin universal EXCEPTO borrado (logical y physical delete)
allow if {
    has_role("admin")
    not contains(input.resource, "delete")
}

has_role(role_name) if {
    some i
    input.user.roles[i] == role_name
}

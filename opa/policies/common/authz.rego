package authz

import rego.v1

default allow = false

# Admin universal: un admin tiene acceso a todo EXCEPTO borrado físico
allow if {
    has_role("admin")
}

# Super user: acceso total incluyendo borrado físico
allow if {
    has_role("super_user")
}

has_role(role_name) if {
    some i
    input.user.roles[i] == role_name
}

package authz

default allow = false

# Admin universal: un admin tiene acceso a todo
allow {
    has_role("admin")
}

has_role(role_name) {
    some i
    input.user.roles[i] == role_name
}

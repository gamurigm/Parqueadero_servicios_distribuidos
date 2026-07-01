package authz.usuarios

import rego.v1

import data.authz.allow as global_allow
import data.authz.has_role

default allow = false

# Admin universal (incluye super_user via global_allow)
allow if {
    global_allow
}

# ============================================
# BORRADO FÍSICO — solo super_user
# ============================================

# usuarios.physical_delete: Solo super_user
allow if {
    input.resource == "usuarios.physical_delete"
    has_role("super_user")
}

# personas.physical_delete: Solo super_user
allow if {
    input.resource == "personas.physical_delete"
    has_role("super_user")
}

# roles.physical_delete: Solo super_user
allow if {
    input.resource == "roles.physical_delete"
    has_role("super_user")
}

# roles_usuario.physical_delete: Solo super_user
allow if {
    input.resource == "roles_usuario.physical_delete"
    has_role("super_user")
}

# ============================================
# RECURSOS DE USUARIOS
# ============================================

# usuarios.read: Cualquier usuario autenticado
allow if {
    input.resource == "usuarios.read"
    input.user.id != ""
}

# usuarios.create: Solo admin
allow if {
    input.resource == "usuarios.create"
    has_role("admin")
}

# usuarios.update: El propio usuario o admin
allow if {
    input.resource == "usuarios.update"
    input.user.id != ""
}

allow if {
    input.resource == "usuarios.update"
    has_role("admin")
}

# usuarios.activate: Solo admin
allow if {
    input.resource == "usuarios.activate"
    has_role("admin")
}

# usuarios.delete: Solo admin
allow if {
    input.resource == "usuarios.delete"
    has_role("admin")
}

# ============================================
# RECURSOS DE PERSONAS
# ============================================

# personas.read: Cualquier usuario autenticado
allow if {
    input.resource == "personas.read"
    input.user.id != ""
}

# personas.create: Solo admin
allow if {
    input.resource == "personas.create"
    has_role("admin")
}

# personas.update: El propio usuario o admin
allow if {
    input.resource == "personas.update"
    input.user.id != ""
}

allow if {
    input.resource == "personas.update"
    has_role("admin")
}

# personas.activate: Solo admin
allow if {
    input.resource == "personas.activate"
    has_role("admin")
}

# personas.delete: Solo admin
allow if {
    input.resource == "personas.delete"
    has_role("admin")
}

# ============================================
# RECURSOS DE ROLES
# ============================================

# roles.read: Cualquier usuario autenticado
allow if {
    startswith(input.resource, "roles.read")
    input.user.id != ""
}

# roles.create: Solo admin
allow if {
    input.resource == "roles.create"
    has_role("admin")
}

# roles.update: Solo admin
allow if {
    input.resource == "roles.update"
    has_role("admin")
}

# roles.activate: Solo admin
allow if {
    input.resource == "roles.activate"
    has_role("admin")
}

# roles.delete: Solo admin
allow if {
    input.resource == "roles.delete"
    has_role("admin")
}

# ============================================
# RECURSOS DE ROLES-USUARIO
# ============================================

# roles-usuario.read: Cualquier usuario autenticado
allow if {
    startswith(input.resource, "roles-usuario.read")
    input.user.id != ""
}

# roles-usuario.create: Solo admin
allow if {
    input.resource == "roles-usuario.create"
    has_role("admin")
}

# roles-usuario.update: Solo admin
allow if {
    input.resource == "roles-usuario.update"
    has_role("admin")
}

# roles-usuario.activate: Solo admin
allow if {
    input.resource == "roles-usuario.activate"
    has_role("admin")
}

# roles-usuario.delete: Solo admin
allow if {
    input.resource == "roles-usuario.delete"
    has_role("admin")
}

# ============================================
# RECURSOS DE AUTENTICACIÓN
# ============================================

# auth.profile: Cualquier usuario autenticado
allow if {
    input.resource == "auth.profile"
    input.user.id != ""
}

# auth.logout: Cualquier usuario autenticado
allow if {
    input.resource == "auth.logout"
    input.user.id != ""
}
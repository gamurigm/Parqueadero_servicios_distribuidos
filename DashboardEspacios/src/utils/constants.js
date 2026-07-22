export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const ENDPOINTS = {
  LOGIN: '/usuarios/auth/login',
  PROFILE: '/usuarios/auth/profile',
  ESPACIOS: '/zonas/api/v1/espacios/',
  USUARIOS: '/usuarios/usuario',
  PERSONA: '/usuarios/persona',
  ROLES: '/usuarios/roles',
  ROLES_USUARIO: '/usuarios/roles-Usuario',
  REGISTER: '/usuarios/auth/register',
  ZONAS: '/zonas/api/v1/zonas/',
  TICKETS: '/tickets',
  VEHICULOS: '/vehiculos/vehiculos',
  AUDITORIA: '/audit/api/v1/audit',
  SSE_ESPACIOS: '/tickets/sse/espacios',
}

export const ROLES = {
  SUPER_USER: 'super_user',
  ADMIN: 'admin',
  ENCARGADO_ZONA: 'encargado_zona',
  EMPLEADO: 'empleado',
  PROPIETARIO: 'propietario',
  AUDITOR: 'auditor',
}

export const ROLE_LABELS = {
  super_user: 'Super Usuario',
  admin: 'Administrador',
  encargado_zona: 'Encargado de Zona',
  empleado: 'Empleado',
  propietario: 'Propietario',
  auditor: 'Auditor',
}

export const MENU_ITEMS = [
  { label: 'Dashboard Espacios', icon: 'grid', route: '/', roles: null },
  { label: 'Usuarios', icon: 'users', route: '/usuarios', roles: ['super_user', 'admin'] },
  { label: 'Roles', icon: 'shield', route: '/roles', roles: ['super_user', 'admin'] },
  { label: 'Zonas', icon: 'map', route: '/zonas', roles: ['super_user', 'admin', 'encargado_zona'] },
  { label: 'Tickets', icon: 'ticket', route: '/tickets', roles: ['super_user', 'admin', 'empleado'] },
  { label: 'Vehículos', icon: 'truck', route: '/vehiculos', roles: ['super_user', 'admin', 'propietario'] },
  { label: 'Auditoría', icon: 'clipboard', route: '/auditoria', roles: ['super_user', 'admin', 'auditor'] },
  { label: 'Perfil', icon: 'user', route: '/perfil', roles: null },
]

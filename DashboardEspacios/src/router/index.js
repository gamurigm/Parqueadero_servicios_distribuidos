import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/LoginView.vue'),
  },
  {
    path: '/',
    name: 'DashboardEspacios',
    component: () => import('@/views/DashboardEspaciosView.vue'),
    meta: { title: 'Dashboard Espacios' },
  },
  {
    path: '/usuarios',
    name: 'Usuarios',
    component: () => import('@/views/UsuariosView.vue'),
    meta: { title: 'Usuarios', roles: ['super_user', 'admin'] },
  },
  {
    path: '/roles',
    name: 'Roles',
    component: () => import('@/views/RolesView.vue'),
    meta: { title: 'Roles', roles: ['super_user', 'admin'] },
  },
  {
    path: '/zonas',
    name: 'Zonas',
    component: () => import('@/views/ZonasView.vue'),
    meta: { title: 'Zonas', roles: ['super_user', 'admin', 'encargado_zona'] },
  },
  {
    path: '/tickets',
    name: 'Tickets',
    component: () => import('@/views/TicketsView.vue'),
    meta: { title: 'Tickets', roles: ['super_user', 'admin', 'empleado'] },
  },
  {
    path: '/vehiculos',
    name: 'Vehiculos',
    component: () => import('@/views/VehiculosView.vue'),
    meta: { title: 'Vehículos', roles: ['super_user', 'admin', 'propietario'] },
  },
  {
    path: '/auditoria',
    name: 'Auditoria',
    component: () => import('@/views/AuditoriaView.vue'),
    meta: { title: 'Auditoría', roles: ['super_user', 'admin', 'auditor'] },
  },
  {
    path: '/perfil',
    name: 'Perfil',
    component: () => import('@/views/PerfilView.vue'),
    meta: { title: 'Perfil' },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFoundView.vue'),
    meta: { title: 'No encontrado' },
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  document.title = to.meta.title ? `${to.meta.title} | Dashboard Roles` : 'Dashboard Roles'

  if (to.name === 'Login') {
    if (auth.isAuthenticated) return next('/')
    return next()
  }

  if (!auth.isAuthenticated) return next('/login')

  if (to.meta.roles && !auth.hasAnyRole(to.meta.roles)) {
    return next('/')
  }

  next()
})

export default router

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import { ROLE_LABELS } from '@/utils/constants'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('dashboard_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('dashboard_user') || 'null'))

  const allRoles = computed(() => {
    const raw = user.value?.roles || []
    return raw.map(r => typeof r === 'string' ? r : (r.nombre || r.name || ''))
  })

  const activeRole = ref('')

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const roles = computed(() => {
    if (activeRole.value) return [activeRole.value]
    return []
  })
  const username = computed(() => user.value?.username || '')
  const userId = computed(() => user.value?.id || user.value?.sub || '')
  const activeRoleLabel = computed(() => ROLE_LABELS[activeRole.value] || activeRole.value || '')

  function hasRole(role) {
    if (activeRole.value) return activeRole.value === role
    return allRoles.value.includes(role)
  }

  function hasAnyRole(allowedRoles) {
    if (!allowedRoles || allowedRoles.length === 0) return true
    return allowedRoles.some(r => hasRole(r))
  }

  function setActiveRole(role) {
    activeRole.value = role
    localStorage.setItem('dashboard_active_role', role)
  }

  async function login(username, password) {
    const data = await authService.login(username, password)
    token.value = data.access_token
    user.value = data.user
    localStorage.setItem('dashboard_token', data.access_token)
    localStorage.setItem('dashboard_user', JSON.stringify(data.user))
    return data
  }

  function logout() {
    token.value = null
    user.value = null
    activeRole.value = ''
    localStorage.removeItem('dashboard_token')
    localStorage.removeItem('dashboard_user')
    localStorage.removeItem('dashboard_active_role')
    router.push('/login')
  }

  function initialize() {
    if (token.value && user.value) {
      const stored = localStorage.getItem('dashboard_active_role')
      if (stored && allRoles.value.includes(stored)) {
        activeRole.value = stored
      } else if (allRoles.value.length >= 1) {
        activeRole.value = allRoles.value[0]
      }
      return
    }
    token.value = null
    user.value = null
  }

  initialize()

  return {
    token, user, isAuthenticated, allRoles, roles, activeRole,
    username, userId, activeRoleLabel,
    hasRole, hasAnyRole, setActiveRole, login, logout,
  }
})

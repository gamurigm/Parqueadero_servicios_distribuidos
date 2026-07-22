import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/auth.service'
import router from '@/router'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('dashboard_token') || null)
  const user = ref(JSON.parse(localStorage.getItem('dashboard_user') || 'null'))

  const isAuthenticated = computed(() => !!token.value && !!user.value)
  const roles = computed(() => {
    const raw = user.value?.roles || []
    return raw.map(r => typeof r === 'string' ? r : (r.nombre || r.name || ''))
  })
  const username = computed(() => user.value?.username || '')
  const userId = computed(() => user.value?.id || user.value?.sub || '')

  function hasRole(role) {
    return roles.value.includes(role)
  }

  function hasAnyRole(allowedRoles) {
    if (!allowedRoles || allowedRoles.length === 0) return true
    return allowedRoles.some(r => roles.value.includes(r))
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
    localStorage.removeItem('dashboard_token')
    localStorage.removeItem('dashboard_user')
    router.push('/login')
  }

  function initialize() {
    if (token.value && user.value) {
      return
    }
    token.value = null
    user.value = null
  }

  initialize()

  return {
    token, user, isAuthenticated, roles, username, userId,
    hasRole, hasAnyRole, login, logout,
  }
})

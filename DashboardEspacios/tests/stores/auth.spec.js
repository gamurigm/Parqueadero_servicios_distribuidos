import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
}))

vi.mock('@/services/auth.service', () => ({
  authService: {
    login: vi.fn(),
  },
}))

import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('inicia no autenticado sin token en localStorage', () => {
    const auth = useAuthStore()
    expect(auth.isAuthenticated).toBe(false)
    expect(auth.roles).toEqual([])
  })

  it('verifica roles correctamente con hasRole y hasAnyRole', () => {
    const auth = useAuthStore()
    auth.user = { id: 1, username: 'admin_test', roles: ['admin', 'empleado'] }

    expect(auth.hasRole('admin')).toBe(true)
    expect(auth.hasRole('super_user')).toBe(false)
    expect(auth.hasAnyRole(['super_user', 'admin'])).toBe(true)
    expect(auth.hasAnyRole(['propietario'])).toBe(false)
  })

  it('login reemplaza el rol activo con el primer rol del usuario autenticado', async () => {
    localStorage.setItem('dashboard_active_role', 'encargado_zona')
    authService.login.mockResolvedValue({
      access_token: 'fake_token',
      user: { id: 1, username: 'admin_test', roles: ['admin'] },
    })

    const auth = useAuthStore()
    await auth.login('admin_test', 'Admin123!')

    expect(auth.activeRole).toBe('admin')
    expect(auth.roles).toEqual(['admin'])
    expect(localStorage.getItem('dashboard_active_role')).toBe('admin')
  })

  it('logout resetea el estado y remueve localStorage', () => {
    const auth = useAuthStore()
    auth.token = 'fake_token'
    auth.user = { id: 1, username: 'admin_test', roles: ['admin'] }

    auth.logout()

    expect(auth.token).toBeNull()
    expect(auth.user).toBeNull()
    expect(auth.isAuthenticated).toBe(false)
  })
})

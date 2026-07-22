import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

vi.mock('@/router', () => ({
  default: {
    push: vi.fn(),
  },
}))

import { useAuthStore } from '@/stores/auth'

describe('useAuthStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
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

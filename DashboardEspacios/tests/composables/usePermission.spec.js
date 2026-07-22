import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'

describe('usePermission', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('isAdmin retorna true para admin o super_user', () => {
    const auth = useAuthStore()
    const perm = usePermission()

    auth.user = { roles: ['admin'] }
    expect(perm.isAdmin()).toBe(true)

    auth.user = { roles: ['super_user'] }
    expect(perm.isAdmin()).toBe(true)

    auth.user = { roles: ['empleado'] }
    expect(perm.isAdmin()).toBe(false)
  })

  it('can evalua si el usuario posee alguno de los roles requeridos', () => {
    const auth = useAuthStore()
    const perm = usePermission()

    auth.user = { roles: ['encargado_zona'] }

    expect(perm.can(['admin', 'encargado_zona'])).toBe(true)
    expect(perm.can(['super_user'])).toBe(false)
    expect(perm.can([])).toBe(true)
  })
})

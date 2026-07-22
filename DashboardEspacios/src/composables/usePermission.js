import { useAuthStore } from '@/stores/auth'

export function usePermission() {
  const auth = useAuthStore()

  function can(requiredRoles) {
    if (!requiredRoles || requiredRoles.length === 0) return true
    return auth.hasAnyRole(requiredRoles)
  }

  function isAdmin() {
    return auth.hasRole('admin') || auth.hasRole('super_user')
  }

  function isSuperUser() {
    return auth.hasRole('super_user')
  }

  function canChangeStatus() {
    return auth.hasAnyRole(['super_user', 'admin', 'encargado_zona'])
  }

  return { can, isAdmin, isSuperUser, canChangeStatus }
}

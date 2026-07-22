import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const asignacionesService = {
  async listarRolesUsuario() {
    const { data } = await api.get(ENDPOINTS.ROLES_USUARIO)
    return data
  },

  async asignarRol(usuarioId, rolId) {
    const { data } = await api.post(ENDPOINTS.ROLES_USUARIO, { id_user: usuarioId, id_rol: rolId })
    return data
  },

  async desactivarRol(usuarioId, rolId) {
    const { data } = await api.patch(`${ENDPOINTS.ROLES_USUARIO}/activar-desactivar`, { id_user: usuarioId, id_rol: rolId })
    return data
  },

  async eliminarRol(usuarioId, rolId) {
    const { data } = await api.delete(ENDPOINTS.ROLES_USUARIO, { data: { id_user: usuarioId, id_rol: rolId } })
    return data
  },

  async obtenerRolesPorUsuario(userId) {
    const { data } = await api.get(`${ENDPOINTS.ROLES_USUARIO}/usuarios/${userId}`)
    return data
  },

  async listarAsignacionesVehiculos() {
    const { data } = await api.get(ENDPOINTS.ASIGNACIONES)
    return data
  },

  async crearAsignacion(payload) {
    const { data } = await api.post(ENDPOINTS.ASIGNACIONES, payload)
    return data
  },

  async actualizarAsignacion(userId, vehicleId, payload) {
    const { data } = await api.put(`${ENDPOINTS.ASIGNACIONES}/${userId}/${vehicleId}`, payload)
    return data
  },

  async eliminarAsignacion(userId, vehicleId) {
    const { data } = await api.delete(`${ENDPOINTS.ASIGNACIONES}/${userId}/${vehicleId}`)
    return data
  },

  async obtenerFlotaPropietario(userId) {
    const { data } = await api.get(`${ENDPOINTS.ASIGNACIONES}/propietario/${userId}`)
    return data
  },
}

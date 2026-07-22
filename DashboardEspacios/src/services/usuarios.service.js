import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const usuariosService = {
  async listar() {
    const { data } = await api.get(ENDPOINTS.USUARIOS)
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`${ENDPOINTS.USUARIOS}/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post(ENDPOINTS.REGISTER, payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`${ENDPOINTS.USUARIOS}/${id}`, payload)
    return data
  },

  async eliminar(id) {
    const { data } = await api.delete(`${ENDPOINTS.USUARIOS}/${id}`)
    return data
  },

  async desactivar(id) {
    const { data } = await api.patch(`${ENDPOINTS.USUARIOS}/${id}/activar-desactivar`)
    return data
  },

  async activar(id) {
    const { data } = await api.patch(`${ENDPOINTS.USUARIOS}/${id}/activar-desactivar`)
    return data
  },

  async actualizarPersona(id, payload) {
    const { data } = await api.put(`${ENDPOINTS.PERSONA}/${id}`, payload)
    return data
  },

  async asignarRol(usuarioId, rolId) {
    const { data } = await api.post(ENDPOINTS.ROLES_USUARIO, { id_user: usuarioId, id_rol: rolId })
    return data
  },

  async eliminarRol(usuarioId, rolId) {
    const { data } = await api.delete(ENDPOINTS.ROLES_USUARIO, { data: { id_user: usuarioId, id_rol: rolId } })
    return data
  },
}

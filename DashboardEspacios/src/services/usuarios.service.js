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
    const { data } = await api.post(ENDPOINTS.USUARIOS, payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.patch(`${ENDPOINTS.USUARIOS}/${id}`, payload)
    return data
  },

  async desactivar(id) {
    const { data } = await api.patch(`${ENDPOINTS.USUARIOS}/${id}/desactivar`)
    return data
  },

  async activar(id) {
    const { data } = await api.patch(`${ENDPOINTS.USUARIOS}/${id}/activar`)
    return data
  },

  async rolesDeUsuario(id) {
    const { data } = await api.get(`${ENDPOINTS.ROLES_USUARIO}/${id}`)
    return data
  },
}

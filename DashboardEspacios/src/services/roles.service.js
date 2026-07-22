import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const rolesService = {
  async listar() {
    const { data } = await api.get(ENDPOINTS.ROLES)
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`${ENDPOINTS.ROLES}/${id}`)
    return data
  },

  async crear(payload) {
    const { data } = await api.post(ENDPOINTS.ROLES, payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.put(`${ENDPOINTS.ROLES}/${id}`, payload)
    return data
  },

  async eliminar(id) {
    const { data } = await api.delete(`${ENDPOINTS.ROLES}/${id}`)
    return data
  },
}

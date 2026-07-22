import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const vehiculosService = {
  async listar() {
    const { data } = await api.get(ENDPOINTS.VEHICULOS)
    return data
  },

  async crear(payload) {
    const { data } = await api.post(ENDPOINTS.VEHICULOS, payload)
    return data
  },

  async actualizar(id, payload) {
    const { data } = await api.patch(`${ENDPOINTS.VEHICULOS}/${id}`, payload)
    return data
  },

  async eliminar(id) {
    const { data } = await api.delete(`${ENDPOINTS.VEHICULOS}/${id}`)
    return data
  },
}

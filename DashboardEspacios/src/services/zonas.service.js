import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const zonasService = {
  async listarZonas() {
    const { data } = await api.get(ENDPOINTS.ZONAS)
    return data
  },

  async crearZona(payload) {
    const { data } = await api.post(ENDPOINTS.ZONAS, payload)
    return data
  },

  async listarEspacios() {
    const { data } = await api.get(ENDPOINTS.ESPACIOS)
    return data
  },

  async crearEspacio(payload) {
    const { data } = await api.post(ENDPOINTS.ESPACIOS, payload)
    return data
  },

  async actualizarEspacio(id, payload) {
    const { data } = await api.patch(`${ENDPOINTS.ESPACIOS}${id}`, payload)
    return data
  },
}

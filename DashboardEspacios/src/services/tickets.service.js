import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const ticketsService = {
  async listar() {
    const { data } = await api.get(ENDPOINTS.TICKETS)
    return data
  },

  async emitir(payload) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/emitir`, payload)
    return data
  },

  async pagar(id) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/${id}/pagar`)
    return data
  },

  async anular(id) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/${id}/anular`)
    return data
  },

  async eliminar(id) {
    const { data } = await api.delete(`${ENDPOINTS.TICKETS}/${id}`)
    return data
  },
}

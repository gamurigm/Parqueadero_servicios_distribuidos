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

  async pagar(idTicket, codigoTicket) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/pagar`, { idTicket, codigoTicket })
    return data
  },

  async anular(idTicket, codigoTicket, motivo) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/anular`, { idTicket, codigoTicket, motivo })
    return data
  },
}

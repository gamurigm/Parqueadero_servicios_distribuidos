import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const ticketsService = {
  async listar() {
    const { data } = await api.get(ENDPOINTS.TICKETS)
    return data
  },

  async emitir(payload) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/emitir`, { idEspacio: payload.id_espacio, placa: payload.placa })
    return data
  },

  async pagar(id) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/pagar`, { idTicket: id })
    return data
  },

  async anular(id, motivo) {
    const { data } = await api.post(`${ENDPOINTS.TICKETS}/anular`, { idTicket: id, motivo })
    return data
  },

  async eliminar(id) {
    const { data } = await api.delete(`${ENDPOINTS.TICKETS}/${id}`)
    return data
  },
}

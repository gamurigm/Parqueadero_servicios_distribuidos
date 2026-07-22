import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const auditService = {
  async listar(params = {}) {
    const { data } = await api.get(ENDPOINTS.AUDITORIA, { params })
    return data
  },

  async obtener(id) {
    const { data } = await api.get(`${ENDPOINTS.AUDITORIA}/${id}`)
    return data
  },
}

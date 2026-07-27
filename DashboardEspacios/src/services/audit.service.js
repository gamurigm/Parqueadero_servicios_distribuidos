import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export function normalizarEventoAuditoria(evento = {}) {
  return {
    ...evento,
    usuario: evento.usuario ?? evento.username ?? '',
    ip: evento.ip ?? evento.ip1 ?? '',
    created_at: evento.created_at ?? evento.timestamp ?? null,
  }
}

export const auditService = {
  async listar(params = {}) {
    const { data } = await api.get(ENDPOINTS.AUDITORIA, { params })
    const eventos = Array.isArray(data) ? data : data?.data || []
    return eventos.map(normalizarEventoAuditoria)
  },

  async obtener(id) {
    const { data } = await api.get(`${ENDPOINTS.AUDITORIA}/${id}`)
    return normalizarEventoAuditoria(data)
  },
}

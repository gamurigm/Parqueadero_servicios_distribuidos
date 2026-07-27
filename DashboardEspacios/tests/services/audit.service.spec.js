import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/services/api', () => ({
  default: {
    get: vi.fn(),
  },
}))

import api from '@/services/api'
import { auditService, normalizarEventoAuditoria } from '@/services/audit.service'

describe('auditService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('normaliza campos del backend para la tabla de auditoria', () => {
    const evento = normalizarEventoAuditoria({
      username: 'testadmin',
      ip1: '172.25.209.128',
      timestamp: '2026-07-27T08:38:51.496Z',
    })

    expect(evento.usuario).toBe('testadmin')
    expect(evento.ip).toBe('172.25.209.128')
    expect(evento.created_at).toBe('2026-07-27T08:38:51.496Z')
  })

  it('listar devuelve eventos normalizados', async () => {
    api.get.mockResolvedValue({
      data: [
        {
          accion: 'LOGIN',
          username: 'testadmin',
          ip1: '172.25.209.128',
          timestamp: '2026-07-27T08:38:51.496Z',
        },
      ],
    })

    const eventos = await auditService.listar()

    expect(eventos[0]).toMatchObject({
      accion: 'LOGIN',
      usuario: 'testadmin',
      ip: '172.25.209.128',
      created_at: '2026-07-27T08:38:51.496Z',
    })
  })
})

import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const zonasService = {
  async listarZonas() {
    const { data } = await api.get(ENDPOINTS.ZONAS)
    const list = Array.isArray(data) ? data : (data?.content || [])
    return list.map(z => ({
      ...z,
      id: z.idZona || z.id,
      nombre: z.nombre,
      ubicacion: z.descripcion || z.ubicacion || z.codigo || '',
      activo: z.estado === 1 || z.estado === 'ACTIVO' || z.activo === true,
      created_at: z.fechaCreacion || z.created_at
    }))
  },

  async crearZona(payload) {
    const body = {
      nombre: payload.nombre,
      descripcion: payload.ubicacion || payload.descripcion || 'Zona creada desde Dashboard',
      tipoZona: payload.tipoZona || 'REGULAR',
      capacidad: Number(payload.capacidad) || 10
    }
    const { data } = await api.post(ENDPOINTS.ZONAS, body)
    return data
  },

  async actualizarZona(id, payload) {
    const body = {
      nombre: payload.nombre,
      descripcion: payload.ubicacion || payload.descripcion || 'Zona actualizada desde Dashboard',
      tipoZona: payload.tipoZona || 'REGULAR',
      capacidad: Number(payload.capacidad) || 10
    }
    const { data } = await api.put(`${ENDPOINTS.ZONAS}${id}`, body)
    return data
  },

  async eliminarZona(id) {
    const { data } = await api.delete(`${ENDPOINTS.ZONAS}${id}`)
    return data
  },

  async listarEspacios() {
    const { data } = await api.get(ENDPOINTS.ESPACIOS)
    return data
  },

  async crearEspacio(payload) {
    const body = {
      idZona: payload.idZona || payload.zona_id || payload.zonaId,
      descripcion: payload.descripcion || 'Espacio creado desde Dashboard',
      tipoEspacio: payload.tipoEspacio || payload.tipo || 'AUTO'
    }
    const { data } = await api.post(ENDPOINTS.ESPACIOS, body)
    return data
  },

  async actualizarEspacio(id, payload) {
    const body = {
      idZona: payload.idZona || payload.zona_id || payload.zonaId,
      descripcion: payload.descripcion || 'Espacio actualizado desde Dashboard',
      tipoEspacio: payload.tipoEspacio || payload.tipo || 'AUTO'
    }
    const { data } = await api.put(`${ENDPOINTS.ESPACIOS}${id}`, body)
    return data
  },

  async eliminarEspacio(id) {
    const { data } = await api.delete(`${ENDPOINTS.ESPACIOS}${id}`)
    return data
  },
}

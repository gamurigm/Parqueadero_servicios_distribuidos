import axios from 'axios'
import { API_BASE } from '@/utils/constants'
import { useToastStore } from '@/stores/toast'
import { useAuthStore } from '@/stores/auth'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dashboard_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const toast = useToastStore()
    const auth = useAuthStore()

    if (error.response) {
      const status = error.response.status
      const msg = error.response.data?.detail || error.response.data?.message || 'Error en la solicitud'

      if (status === 401) {
        toast.error('Sesión expirada o no autorizada. Redirigiendo...')
        auth.logout()
      } else if (status === 403) {
        toast.error(`Acceso denegado: ${msg}`)
      } else if (status >= 500) {
        toast.error(`Error del servidor: ${msg}`)
      } else {
        toast.error(msg)
      }
    } else if (error.request) {
      toast.error('No se pudo conectar con el servidor.')
    } else {
      toast.error(error.message || 'Error inesperado')
    }

    return Promise.reject(error)
  }
)

export default api


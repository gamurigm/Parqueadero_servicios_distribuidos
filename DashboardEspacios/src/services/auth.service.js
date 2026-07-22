import api from './api'
import { ENDPOINTS } from '@/utils/constants'

export const authService = {
  async login(username, password) {
    const { data } = await api.post(ENDPOINTS.LOGIN, { username, password })
    return data
  },

  async profile() {
    const { data } = await api.get(ENDPOINTS.PROFILE)
    return data
  },
}

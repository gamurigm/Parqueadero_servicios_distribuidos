import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { ENDPOINTS } from '@/utils/constants'
import { useSSE } from '@/composables/useSSE'

export const useEspaciosStore = defineStore('espacios', () => {
  const espacios = ref([])
  const loading = ref(false)
  const error = ref(null)
  const lastUpdate = ref(null)
  let pollInterval = null

  const sse = useSSE(() => {
    fetchEspacios()
  })

  async function fetchEspacios() {
    loading.value = true
    try {
      const { data } = await api.get(ENDPOINTS.ESPACIOS)
      espacios.value = Array.isArray(data) ? data : []
      lastUpdate.value = new Date()
      error.value = null
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function conectarSSE() {
    sse.conectar()
  }

  function desconectarSSE() {
    sse.desconectar()
  }

  function iniciarPolling() {
    detenerPolling()
    pollInterval = setInterval(fetchEspacios, 30000)
  }

  function detenerPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  async function iniciar() {
    await fetchEspacios()
    conectarSSE()
    iniciarPolling()
  }

  function detener() {
    desconectarSSE()
    detenerPolling()
  }

  return {
    espacios,
    loading,
    error,
    connected: sse.connected,
    lastUpdate,
    fetchEspacios,
    conectarSSE,
    desconectarSSE,
    iniciar,
    detener,
  }
})

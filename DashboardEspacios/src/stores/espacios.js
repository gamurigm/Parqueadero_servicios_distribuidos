import { defineStore } from 'pinia'
import { ref } from 'vue'
import api from '@/services/api'
import { ENDPOINTS, API_BASE } from '@/utils/constants'

export const useEspaciosStore = defineStore('espacios', () => {
  const espacios = ref([])
  const loading = ref(false)
  const error = ref(null)
  const connected = ref(false)
  const lastUpdate = ref(null)

  let eventSource = null
  let pollInterval = null

  async function fetchEspacios() {
    loading.value = true
    try {
      const { data } = await api.get(ENDPOINTS.ESPACIOS)
      espacios.value = Array.isArray(data) ? data : []
      lastUpdate.value = new Date()
      connected.value = true
      error.value = null
    } catch (err) {
      error.value = err.message
      connected.value = false
    } finally {
      loading.value = false
    }
  }

  function conectarSSE() {
    desconectarSSE()

    eventSource = new EventSource(`${API_BASE}${ENDPOINTS.SSE_ESPACIOS}`)

    eventSource.onopen = () => {
      connected.value = true
    }

    eventSource.onmessage = () => {
      fetchEspacios()
    }

    eventSource.onerror = () => {
      connected.value = false
      eventSource?.close()
      setTimeout(conectarSSE, 5000)
    }
  }

  function desconectarSSE() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
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
    espacios, loading, error, connected, lastUpdate,
    fetchEspacios, conectarSSE, iniciar, detener,
  }
})

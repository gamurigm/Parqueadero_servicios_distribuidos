import { ref, onUnmounted } from 'vue'
import { API_BASE, ENDPOINTS } from '@/utils/constants'

export function useSSE(onMessage) {
  const connected = ref(false)
  let eventSource = null
  let retryTimeout = null

  function conectar() {
    desconectar()

    eventSource = new EventSource(`${API_BASE}${ENDPOINTS.SSE_ESPACIOS}`)

    eventSource.onopen = () => {
      connected.value = true
    }

    eventSource.onmessage = (event) => {
      if (onMessage) onMessage(event)
    }

    eventSource.onerror = () => {
      connected.value = false
      eventSource?.close()
      retryTimeout = setTimeout(conectar, 5000)
    }
  }

  function desconectar() {
    if (eventSource) {
      eventSource.close()
      eventSource = null
    }
    if (retryTimeout) {
      clearTimeout(retryTimeout)
      retryTimeout = null
    }
  }

  onUnmounted(desconectar)

  return { connected, conectar, desconectar }
}

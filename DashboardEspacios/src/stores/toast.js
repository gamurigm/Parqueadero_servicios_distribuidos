import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToastStore = defineStore('toast', () => {
  const toasts = ref([])

  function addToast({ message, type = 'info', timeout = 4000 }) {
    const id = Date.now() + Math.random().toString(36).substr(2, 9)
    toasts.value.push({ id, message, type })

    if (timeout > 0) {
      setTimeout(() => {
        removeToast(id)
      }, timeout)
    }
  }

  function success(message, timeout = 4000) {
    addToast({ message, type: 'success', timeout })
  }

  function error(message, timeout = 5000) {
    addToast({ message, type: 'error', timeout })
  }

  function info(message, timeout = 4000) {
    addToast({ message, type: 'info', timeout })
  }

  function warning(message, timeout = 4000) {
    addToast({ message, type: 'warning', timeout })
  }

  function removeToast(id) {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }

  return {
    toasts,
    addToast,
    success,
    error,
    info,
    warning,
    removeToast,
  }
})

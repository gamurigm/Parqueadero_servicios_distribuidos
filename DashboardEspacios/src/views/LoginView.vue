<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
      <template v-if="!mostrandoSelector">
        <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Iniciar Sesión</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              v-model="username"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin1"
              required
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              v-model="password"
              type="password"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Admin123!"
              required
            />
          </div>
          <p v-if="error" class="text-red-500 text-sm mb-4 text-center">{{ error }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {{ loading ? 'Entrando...' : 'Entrar' }}
          </button>
        </form>
      </template>

      <template v-else>
        <h2 class="text-xl font-bold text-gray-800 text-center mb-2">Seleccione su rol</h2>
        <p class="text-sm text-gray-500 text-center mb-6">
          Usuario <strong>{{ auth.username }}</strong> tiene múltiples roles
        </p>
        <div class="space-y-3">
          <button
            v-for="rol in auth.allRoles"
            :key="rol"
            @click="seleccionarRol(rol)"
            class="w-full flex items-center gap-4 p-4 rounded-lg border-2 transition text-left"
            :class="rolSeleccionado === rol
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'"
          >
            <span class="text-2xl">{{ iconoRol(rol) }}</span>
            <div>
              <span class="block font-medium text-gray-800">{{ labelRol(rol) }}</span>
              <span class="block text-xs text-gray-400">{{ rol }}</span>
            </div>
          </button>
        </div>
        <div class="mt-6 text-center">
          <button
            @click="volverLogin"
            class="text-sm text-gray-500 hover:text-gray-700"
          >
            &larr; Volver al inicio de sesión
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const router = useRouter()
const auth = useAuthStore()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const mostrandoSelector = ref(false)
const rolSeleccionado = ref('')

function labelRol(rol) {
  return ROLE_LABELS[rol] || rol
}

function iconoRol(rol) {
  const icons = {
    super_user: '🛡',
    admin: '⚙️',
    encargado_zona: '🗺',
    empleado: '👤',
    propietario: '🚗',
    auditor: '📋',
  }
  return icons[rol] || '🔑'
}

function volverLogin() {
  mostrandoSelector.value = false
  auth.logout()
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await auth.login(username.value, password.value)
    if (auth.allRoles.length === 1) {
      auth.setActiveRole(auth.allRoles[0])
      router.push('/')
    } else {
      mostrandoSelector.value = true
      loading.value = false
    }
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error al iniciar sesión'
    loading.value = false
  }
}

function seleccionarRol(rol) {
  rolSeleccionado.value = rol
  auth.setActiveRole(rol)
  router.push('/')
}
</script>

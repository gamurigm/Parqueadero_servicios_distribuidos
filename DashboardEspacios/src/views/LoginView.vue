<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div class="bg-white rounded-lg shadow-lg p-8 w-full" :class="modo === 'registro' ? 'max-w-2xl' : 'max-w-md'">
      <template v-if="!mostrandoSelector">
        <div class="grid grid-cols-2 gap-2 p-1 mb-6 bg-gray-100 rounded-lg">
          <button
            type="button"
            class="py-2 text-sm font-medium rounded-md transition"
            :class="modo === 'login' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'"
            @click="cambiarModo('login')"
          >
            Iniciar sesion
          </button>
          <button
            type="button"
            class="py-2 text-sm font-medium rounded-md transition"
            :class="modo === 'registro' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-800'"
            @click="cambiarModo('registro')"
          >
            Registrarse
          </button>
        </div>

        <form v-if="modo === 'login'" @submit.prevent="handleLogin">
          <h2 class="text-2xl font-bold text-gray-800 text-center mb-6">Iniciar sesion</h2>
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              v-model.trim="username"
              type="text"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="admin1"
              required
            />
          </div>
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
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

        <form v-else @submit.prevent="handleRegister">
          <div class="flex items-center justify-between gap-3 mb-6">
            <h2 class="text-2xl font-bold text-gray-800">Crear cuenta</h2>
            <span class="text-xs font-semibold text-blue-700 bg-blue-50 px-3 py-1 rounded-full">
              Propietario
            </span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Primer nombre</label>
              <input v-model.trim="registro.firstName" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Segundo nombre</label>
              <input v-model.trim="registro.middleName" type="text" class="input" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
              <input v-model.trim="registro.lastName" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Cedula</label>
              <input v-model.trim="registro.cedula" type="text" maxlength="10" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Correo</label>
              <input v-model.trim="registro.email" type="email" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
              <input v-model.trim="registro.phone" type="text" maxlength="10" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nacionalidad</label>
              <input v-model.trim="registro.nationality" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Direccion</label>
              <input v-model.trim="registro.address" type="text" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Contrasena</label>
              <input v-model="registro.password" type="password" minlength="6" class="input" required />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Confirmar contrasena</label>
              <input v-model="confirmPassword" type="password" minlength="6" class="input" required />
            </div>
          </div>

          <p v-if="error" class="text-red-500 text-sm mt-4 text-center">{{ error }}</p>
          <button
            type="submit"
            :disabled="loading"
            class="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition disabled:opacity-50"
          >
            {{ loading ? 'Registrando...' : 'Crear cuenta' }}
          </button>
        </form>
      </template>

      <template v-else>
        <h2 class="text-xl font-bold text-gray-800 text-center mb-2">Seleccione su rol</h2>
        <p class="text-sm text-gray-500 text-center mb-6">
          Usuario <strong>{{ auth.username }}</strong> tiene multiples roles
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
            <span class="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">
              {{ inicialRol(rol) }}
            </span>
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
            Volver al inicio de sesion
          </button>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const router = useRouter()
const auth = useAuthStore()

const modo = ref('login')
const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)
const mostrandoSelector = ref(false)
const rolSeleccionado = ref('')
const confirmPassword = ref('')
const registro = ref(nuevoRegistro())

function nuevoRegistro() {
  return {
    cedula: '',
    firstName: '',
    middleName: '',
    lastName: '',
    email: '',
    nationality: 'Ecuatoriana',
    phone: '',
    address: '',
    password: '',
  }
}

function cambiarModo(nuevoModo) {
  modo.value = nuevoModo
  error.value = ''
  loading.value = false
}

function labelRol(rol) {
  return ROLE_LABELS[rol] || rol
}

function inicialRol(rol) {
  return (labelRol(rol) || rol || '?').slice(0, 1).toUpperCase()
}

function volverLogin() {
  mostrandoSelector.value = false
  auth.logout()
}

function validarRegistro() {
  if (!/^\d{10}$/.test(registro.value.cedula)) return 'La cedula debe tener 10 digitos'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registro.value.email)) return 'Ingrese un correo valido'
  if (!/^\d{10}$/.test(registro.value.phone)) return 'El telefono debe tener 10 digitos'
  if (registro.value.password.length < 6) return 'La contrasena debe tener minimo 6 caracteres'
  if (registro.value.password !== confirmPassword.value) return 'Las contrasenas no coinciden'
  return ''
}

async function entrarConUsuario(usuario, contrasena) {
  await auth.login(usuario, contrasena)
  if (auth.allRoles.length === 1) {
    auth.setActiveRole(auth.allRoles[0])
    router.push('/')
  } else {
    mostrandoSelector.value = true
    loading.value = false
  }
}

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await entrarConUsuario(username.value, password.value)
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error al iniciar sesion'
    loading.value = false
  }
}

async function handleRegister() {
  error.value = validarRegistro()
  if (error.value) return

  loading.value = true
  try {
    const payload = {
      cedula: registro.value.cedula,
      firstName: registro.value.firstName,
      middleName: registro.value.middleName || undefined,
      lastName: registro.value.lastName,
      email: registro.value.email,
      nationality: registro.value.nationality,
      phone: registro.value.phone,
      address: registro.value.address,
      password: registro.value.password,
    }
    const creado = await authService.register(payload)
    await entrarConUsuario(creado.username, registro.value.password)
    registro.value = nuevoRegistro()
    confirmPassword.value = ''
  } catch (err) {
    error.value = err.response?.data?.message || err.message || 'Error al registrar usuario'
    loading.value = false
  }
}

function seleccionarRol(rol) {
  rolSeleccionado.value = rol
  auth.setActiveRole(rol)
  router.push('/')
}
</script>

<style scoped>
.input {
  width: 100%;
  border: 1px solid rgb(209 213 219);
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
}

.input:focus {
  outline: none;
  border-color: rgb(59 130 246);
  box-shadow: 0 0 0 2px rgb(59 130 246 / 0.35);
}
</style>

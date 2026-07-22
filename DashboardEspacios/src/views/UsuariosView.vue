<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Usuarios</h2>
      <button
        @click="abrirModalCrear"
        v-if="can(['super_user', 'admin'])"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        + Nuevo Usuario
      </button>
    </div>

    <DataTable
      :items="usuarios"
      :columns="columnsUsuarios"
      :loading="loading"
      empty-text="No hay usuarios registrados"
    >
      <template #cell-active="{ item }">
        <StatusBadge :estado="item.active ? 'Activo' : 'Inactivo'" />
      </template>

      <template #cell-nombreCompleto="{ item }">
        <span class="text-gray-700">{{ item.nombreCompleto || '—' }}</span>
      </template>

      <template #cell-email="{ item }">
        <span class="text-gray-700">{{ item.persona?.email || '—' }}</span>
      </template>

      <template #cell-telefono="{ item }">
        <span class="text-gray-700">{{ item.persona?.phone || '—' }}</span>
      </template>

      <template #cell-roles="{ item }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="r in (item.roles || [])"
            :key="r.id || r.nombre"
            class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium"
          >
            {{ ROLE_LABELS[r.nombre] || r.nombre }}
          </span>
        </div>
      </template>

      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <button
            @click="abrirModalEditar(item)"
            class="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
          >Editar</button>
          <button
            @click="toggleEstado(item)"
            class="text-xs px-2.5 py-1 rounded font-medium"
            :class="item.active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'"
          >
            {{ item.active ? 'Desactivar' : 'Activar' }}
          </button>
          <button
            v-if="perm.isSuperUser()"
            @click="solicitarEliminar(item)"
            class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
          >
            Eliminar
          </button>
        </div>
      </template>
    </DataTable>

    <div v-if="mostrarModalCrear" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Nuevo Usuario</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Nombre Completo (mínimo 3 nombres)</label>
            <input
              v-model="formCrear.nombreCompleto"
              type="text"
              placeholder="Ej: Juan Carlos Pérez"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.nombreCompleto ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.nombreCompleto" class="text-xs text-red-600 mt-1">{{ val.errors.value.nombreCompleto }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Cédula</label>
            <input
              v-model="formCrear.cedula"
              type="text"
              maxlength="10"
              placeholder="10 dígitos"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.cedula ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.cedula" class="text-xs text-red-600 mt-1">{{ val.errors.value.cedula }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              v-model="formCrear.email"
              type="email"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.email ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.email" class="text-xs text-red-600 mt-1">{{ val.errors.value.email }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              v-model="formCrear.phone"
              type="text"
              maxlength="10"
              placeholder="10 dígitos"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.phone ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.phone" class="text-xs text-red-600 mt-1">{{ val.errors.value.phone }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Nacionalidad</label>
            <input
              v-model="formCrear.nationality"
              type="text"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.nationality ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.nationality" class="text-xs text-red-600 mt-1">{{ val.errors.value.nationality }}</p>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
            <input
              v-model="formCrear.address"
              type="text"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.address ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.address" class="text-xs text-red-600 mt-1">{{ val.errors.value.address }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Rol Inicial</label>
            <select
              v-model="formCrear.rolId"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.rolId ? 'border-red-500' : 'border-gray-300'"
            >
              <option value="" disabled>Seleccionar rol</option>
              <option v-for="rol in rolesDisponibles" :key="rol.id" :value="rol.id">
                {{ ROLE_LABELS[rol.nombre] || rol.nombre }}
              </option>
            </select>
            <p v-if="val.errors.value.rolId" class="text-xs text-red-600 mt-1">{{ val.errors.value.rolId }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Roles Adicionales</label>
            <select
              v-model="formCrear.rolesAdicionales"
              multiple
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 h-[120px]"
            >
              <option v-for="rol in rolesAdicionalesDisponibles" :key="rol.id" :value="rol.id">
                {{ ROLE_LABELS[rol.nombre] || rol.nombre }}
              </option>
            </select>
            <p class="text-[10px] text-gray-400 mt-1">Mantén Ctrl/Cmd para seleccionar varios</p>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Contraseña Generada</label>
            <input
              :value="passwordPreview"
              type="text"
              readonly
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-600 font-mono"
            />
            <p class="text-[10px] text-gray-400 mt-1">Se generará automáticamente con el formato: nombres + fecha (DDMMYYYY)</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cerrarModalCrear"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            @click="guardarCrear"
            :disabled="guardando"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ guardando ? 'Creando...' : 'Crear Usuario' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarModalEditar" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">Editar Usuario</h3>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Nombre de Usuario</label>
            <input
              :value="formEditar.username"
              type="text"
              disabled
              class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm bg-gray-100 text-gray-500"
            />
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
            <input
              v-model="formEditar.nombreCompleto"
              type="text"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.nombreCompleto ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.nombreCompleto" class="text-xs text-red-600 mt-1">{{ val.errors.value.nombreCompleto }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Cédula</label>
            <input
              v-model="formEditar.dni"
              type="text"
              maxlength="10"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.dni ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.dni" class="text-xs text-red-600 mt-1">{{ val.errors.value.dni }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              v-model="formEditar.email"
              type="email"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.email ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.email" class="text-xs text-red-600 mt-1">{{ val.errors.value.email }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
            <input
              v-model="formEditar.phone"
              type="text"
              maxlength="10"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.phone ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.phone" class="text-xs text-red-600 mt-1">{{ val.errors.value.phone }}</p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-700 mb-1">Nacionalidad</label>
            <input
              v-model="formEditar.nationality"
              type="text"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.nationality ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.nationality" class="text-xs text-red-600 mt-1">{{ val.errors.value.nationality }}</p>
          </div>

          <div class="sm:col-span-2">
            <label class="block text-xs font-medium text-gray-700 mb-1">Dirección</label>
            <input
              v-model="formEditar.address"
              type="text"
              class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              :class="val.errors.value.address ? 'border-red-500' : 'border-gray-300'"
            />
            <p v-if="val.errors.value.address" class="text-xs text-red-600 mt-1">{{ val.errors.value.address }}</p>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button
            @click="cerrarModalEditar"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            @click="guardarEditar"
            :disabled="guardando"
            class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="mostrarPasswordGenerada" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4 text-center">
        <div class="text-green-600 text-4xl mb-3">&#10003;</div>
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Usuario Creado</h3>
        <p class="text-sm text-gray-600 mb-4">Contraseña generada para <strong>{{ usernameGenerado }}</strong>:</p>
        <div class="bg-gray-100 border border-gray-300 rounded-lg px-4 py-3 mb-4">
          <code class="text-sm font-mono text-gray-800 select-all">{{ passwordGenerada }}</code>
        </div>
        <p class="text-xs text-red-600 mb-4">Guarda esta contraseña, no se volverá a mostrar.</p>
        <button
          @click="mostrarPasswordGenerada = false"
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
        >
          Cerrar
        </button>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirmState.visible"
      :titulo="confirmState.action === 'eliminar' ? 'Eliminar Usuario' : confirmState.action === 'desactivar' ? 'Desactivar Usuario' : 'Activar Usuario'"
      :mensaje="confirmState.action === 'eliminar'
        ? `¿Estás seguro de que deseas eliminar al usuario '${confirmState.item?.username}'? Esta acción no se puede deshacer.`
        : `¿Estás seguro de que deseas ${confirmState.action} al usuario '${confirmState.item?.username}'?`"
      :confirmText="confirmState.action === 'eliminar' ? 'Eliminar' : confirmState.action === 'desactivar' ? 'Desactivar' : 'Activar'"
      :danger="confirmState.action !== 'activar'"
      @confirm="ejecutarAccionConfirmada"
      @cancel="confirmState.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { usuariosService } from '@/services/usuarios.service'
import { rolesService } from '@/services/roles.service'
import { useAuthStore } from '@/stores/auth'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import { useFormValidation } from '@/composables/useFormValidation'
import { ROLE_LABELS } from '@/utils/constants'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const auth = useAuthStore()
const { can } = usePermission()
const perm = usePermission()
const toast = useToastStore()
const val = useFormValidation()

const usuarios = ref([])
const rolesDisponibles = ref([])
const loading = ref(true)
const guardando = ref(false)

const mostrarModalCrear = ref(false)
const mostrarModalEditar = ref(false)
const mostrarPasswordGenerada = ref(false)
const passwordGenerada = ref('')
const usernameGenerado = ref('')

const formCrear = ref({
  nombreCompleto: '',
  cedula: '',
  email: '',
  phone: '',
  nationality: '',
  address: '',
  rolId: '',
  rolesAdicionales: [],
})

const formEditar = ref({
  userId: '',
  personaId: '',
  username: '',
  nombreCompleto: '',
  dni: '',
  email: '',
  phone: '',
  nationality: '',
  address: '',
})

const confirmState = ref({ visible: false, item: null, action: '' })

const columnsUsuarios = [
  { key: 'username', label: 'Usuario' },
  { key: 'nombreCompleto', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Teléfono' },
  { key: 'active', label: 'Estado' },
  { key: 'roles', label: 'Roles' },
]

const rolesAdicionalesDisponibles = computed(() => {
  return rolesDisponibles.value.filter(r => r.id !== formCrear.value.rolId)
})

const passwordPreview = computed(() => {
  const nc = formCrear.value.nombreCompleto.trim()
  if (!nc) return ''
  const parts = nc.split(/\s+/)
  const firstName = (parts[0] || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const middleName = parts.slice(1, -1).join('').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const lastName = (parts[parts.length - 1] || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  const names = (firstName + middleName + lastName).replace(/\s/g, '')
  if (!names) return ''
  const hoy = new Date()
  const dd = String(hoy.getDate()).padStart(2, '0')
  const mm = String(hoy.getMonth() + 1).padStart(2, '0')
  const yyyy = hoy.getFullYear()
  let pw = `${names}${dd}${mm}${yyyy}`
  if (pw.length < 8) pw += '#!'
  return pw
})

function parseNombreCompleto(fullName) {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length >= 3) {
    return {
      firstName: parts[0],
      middleName: parts.slice(1, -1).join(' '),
      lastName: parts[parts.length - 1],
    }
  } else if (parts.length === 2) {
    return {
      firstName: parts[0],
      middleName: '',
      lastName: parts[1],
    }
  }
  return { firstName: parts[0] || '', middleName: '', lastName: '' }
}

onMounted(() => { cargar() })

async function cargar() {
  loading.value = true
  try {
    const raw = await usuariosService.listar()
    usuarios.value = raw.filter(u => u.id !== auth.userId)
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function cargarRoles() {
  try {
    rolesDisponibles.value = await rolesService.listar()
  } catch (err) {
    console.error(err)
  }
}

function abrirModalCrear() {
  val.clearErrors()
  formCrear.value = {
    nombreCompleto: '',
    cedula: '',
    email: '',
    phone: '',
    nationality: '',
    address: '',
    rolId: '',
    rolesAdicionales: [],
  }
  mostrarModalCrear.value = true
  cargarRoles()
}

function cerrarModalCrear() {
  mostrarModalCrear.value = false
}

function abrirModalEditar(item) {
  val.clearErrors()
  formEditar.value = {
    userId: item.id,
    personaId: item.persona?.id || item.id,
    username: item.username,
    nombreCompleto: item.nombreCompleto || '',
    dni: item.persona?.dni || '',
    email: item.persona?.email || '',
    phone: item.persona?.phone || '',
    nationality: item.persona?.nationality || '',
    address: item.persona?.address || '',
  }
  mostrarModalEditar.value = true
}

function cerrarModalEditar() {
  mostrarModalEditar.value = false
}

async function guardarCrear() {
  val.clearErrors()
  let valid = true

  const nc = formCrear.value.nombreCompleto.trim()
  const parts = nc.split(/\s+/)
  if (!nc) { val.setError('nombreCompleto', 'El nombre completo es requerido'); valid = false }
  else if (parts.length < 3) { val.setError('nombreCompleto', 'Debe ingresar al menos 3 nombres separados por espacio'); valid = false }

  if (!formCrear.value.cedula || formCrear.value.cedula.length !== 10) { val.setError('cedula', 'La cédula debe tener 10 dígitos'); valid = false }
  if (!formCrear.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formCrear.value.email)) { val.setError('email', 'Ingrese un correo válido'); valid = false }
  if (!formCrear.value.phone || formCrear.value.phone.length !== 10) { val.setError('phone', 'El teléfono debe tener 10 dígitos'); valid = false }
  if (!formCrear.value.nationality) { val.setError('nationality', 'La nacionalidad es requerida'); valid = false }
  if (!formCrear.value.address) { val.setError('address', 'La dirección es requerida'); valid = false }
  if (!formCrear.value.rolId) { val.setError('rolId', 'Seleccione un rol inicial'); valid = false }
  if (!valid) return

  guardando.value = true
  try {
    const { firstName, middleName, lastName } = parseNombreCompleto(formCrear.value.nombreCompleto)
    const payload = {
      cedula: formCrear.value.cedula,
      firstName, middleName, lastName,
      email: formCrear.value.email,
      nationality: formCrear.value.nationality,
      phone: formCrear.value.phone,
      address: formCrear.value.address,
      rolId: formCrear.value.rolId,
      password: passwordPreview.value,
    }
    const nuevoUsuario = await usuariosService.crear(payload)

    if (formCrear.value.rolesAdicionales.length > 0) {
      for (const rolId of formCrear.value.rolesAdicionales) {
        try { await usuariosService.asignarRol(nuevoUsuario.id, rolId) }
        catch (err) { console.error('Error al asignar rol adicional:', err) }
      }
    }

    mostrarModalCrear.value = false
    toast.success('Usuario creado exitosamente')
    passwordGenerada.value = nuevoUsuario.password
    usernameGenerado.value = nuevoUsuario.username
    mostrarPasswordGenerada.value = true
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    guardando.value = false
  }
}

async function guardarEditar() {
  val.clearErrors()
  let valid = true

  const nc = formEditar.value.nombreCompleto.trim()
  const parts = nc.split(/\s+/)
  if (!nc) { val.setError('nombreCompleto', 'El nombre completo es requerido'); valid = false }
  else if (parts.length < 3) { val.setError('nombreCompleto', 'Debe ingresar al menos 3 nombres'); valid = false }

  if (!formEditar.value.dni || formEditar.value.dni.length !== 10) { val.setError('dni', 'La cédula debe tener 10 dígitos'); valid = false }
  if (!formEditar.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEditar.value.email)) { val.setError('email', 'Ingrese un correo válido'); valid = false }
  if (!formEditar.value.phone || formEditar.value.phone.length !== 10) { val.setError('phone', 'El teléfono debe tener 10 dígitos'); valid = false }
  if (!formEditar.value.nationality) { val.setError('nationality', 'La nacionalidad es requerida'); valid = false }
  if (!formEditar.value.address) { val.setError('address', 'La dirección es requerida'); valid = false }
  if (!valid) return

  guardando.value = true
  try {
    const { firstName, middleName, lastName } = parseNombreCompleto(formEditar.value.nombreCompleto)
    await usuariosService.actualizarPersona(formEditar.value.personaId, {
      firstName, middleName, lastName,
      dni: formEditar.value.dni,
      email: formEditar.value.email,
      phone: formEditar.value.phone,
      nationality: formEditar.value.nationality,
      address: formEditar.value.address,
      tipo: 'natural',
    })
    mostrarModalEditar.value = false
    toast.success('Usuario actualizado exitosamente')
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    guardando.value = false
  }
}

function solicitarEliminar(item) {
  confirmState.value = { visible: true, item, action: 'eliminar' }
}

async function ejecutarAccionConfirmada() {
  const item = confirmState.value.item
  const action = confirmState.value.action
  confirmState.value.visible = false
  if (!item) return
  guardando.value = true
  try {
    if (action === 'eliminar') {
      await usuariosService.eliminar(item.id)
      toast.success(`Usuario '${item.username}' eliminado`)
    }
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    guardando.value = false
  }
}

async function toggleEstado(item) {
  guardando.value = true
  try {
    if (item.active) {
      await usuariosService.desactivar(item.id)
      toast.success(`Usuario '${item.username}' desactivado`)
    } else {
      await usuariosService.activar(item.id)
      toast.success(`Usuario '${item.username}' activado`)
    }
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    guardando.value = false
  }
}
</script>

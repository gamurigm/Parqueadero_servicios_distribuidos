<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Usuarios</h2>
      <button
        @click="showForm = true"
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
      <template #cell-activo="{ item }">
        <StatusBadge :estado="item.activo ? 'Activo' : 'Inactivo'" />
      </template>
<<<<<<< HEAD

      <template #cell-nombreCompleto="{ value }">
        <span class="text-gray-700">{{ value || '—' }}</span>
      </template>

      <template #cell-email="{ item }">
        <span class="text-gray-700">{{ item.persona?.email || '—' }}</span>
      </template>

      <template #cell-telefono="{ item }">
        <span class="text-gray-700">{{ item.persona?.phone || '—' }}</span>
      </template>

=======
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
      <template #cell-roles="{ item }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="r in (item.roles || [])"
<<<<<<< HEAD
            :key="r.id || r.nombre"
            class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium"
=======
            :key="r"
            class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
          >
            {{ ROLE_LABELS[r.nombre] || r.nombre }}
          </span>
        </div>
      </template>
      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <button
            @click="editar(item)"
            class="text-blue-600 hover:text-blue-800 text-sm"
          >Editar</button>
          <button
            @click="toggleEstado(item)"
            class="text-sm"
            :class="item.activo ? 'text-red-600 hover:text-red-800' : 'text-green-600 hover:text-green-800'"
          >
            {{ item.activo ? 'Desactivar' : 'Activar' }}
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

<<<<<<< HEAD
    <!-- Modal Crear Usuario -->
    <Teleport to="body">
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
=======
    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm = false">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold mb-4">{{ editando ? 'Editar Usuario' : 'Nuevo Usuario' }}</h3>
        <form @submit.prevent="guardar" class="space-y-3">
          <input v-model="form.username" placeholder="Usuario" class="w-full px-3 py-2 border rounded text-sm" required />
          <input v-model="form.email" type="email" placeholder="Email" class="w-full px-3 py-2 border rounded text-sm" required />
          <input v-model="form.nombre" placeholder="Nombre completo" class="w-full px-3 py-2 border rounded text-sm" />
          <select v-model="form.rol" class="w-full px-3 py-2 border rounded text-sm">
            <option value="">Seleccionar rol...</option>
            <option v-for="(label, val) in ROLE_LABELS" :key="val" :value="val">{{ label }}</option>
          </select>
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" @click="showForm = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700" :disabled="saving">
              {{ saving ? 'Guardando...' : 'Guardar' }}
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
            </button>
          </div>
        </form>
      </div>
<<<<<<< HEAD
    </Teleport>

    <!-- Modal Editar Usuario -->
    <Teleport to="body">
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
    </Teleport>

    <!-- Modal Contraseña Generada -->
    <Teleport to="body">
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
    </Teleport>

    <!-- ConfirmDialog Toggle Activo -->
    <ConfirmDialog
      :visible="confirmState.visible"
      :titulo="confirmState.action === 'desactivar' ? 'Desactivar Usuario' : confirmState.action === 'activar' ? 'Activar Usuario' : 'Eliminar Usuario'"
      :mensaje="confirmState.action === 'eliminar'
        ? `¿Estás seguro de que deseas eliminar al usuario '${confirmState.item?.username}'? Esta acción no se puede deshacer.`
        : `¿Estás seguro de que deseas ${confirmState.action} al usuario '${confirmState.item?.username}'?`"
      :confirmText="confirmState.action === 'desactivar' ? 'Desactivar' : confirmState.action === 'activar' ? 'Activar' : 'Eliminar'"
      :danger="confirmState.action === 'desactivar' || confirmState.action === 'eliminar'"
      @confirm="ejecutarAccionConfirmada"
      @cancel="confirmState.visible = false"
    />
=======
    </div>
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
  </div>
</template>

<script setup>
<<<<<<< HEAD
import { ref, computed, onMounted } from 'vue'
import { usuariosService } from '@/services/usuarios.service'
import { rolesService } from '@/services/roles.service'
import { useAuthStore } from '@/stores/auth'
=======
import { ref, onMounted } from 'vue'
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
import { usePermission } from '@/composables/usePermission'
import { usuariosService } from '@/services/usuarios.service'
import { ROLE_LABELS } from '@/utils/constants'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

<<<<<<< HEAD
const auth = useAuthStore()
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
=======
const { can } = usePermission()

const usuarios = ref([])
const loading = ref(false)
const showForm = ref(false)
const saving = ref(false)
const editando = ref(null)

const form = ref({ username: '', email: '', nombre: '', rol: '' })
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a

const columnsUsuarios = [
  { key: 'username', label: 'Usuario' },
<<<<<<< HEAD
  { key: 'nombreCompleto', label: 'Nombre' },
  { key: 'email', label: 'Email' },
  { key: 'telefono', label: 'Teléfono' },
=======
  { key: 'email', label: 'Email' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'activo', label: 'Estado' },
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
  { key: 'roles', label: 'Roles' },
]

<<<<<<< HEAD
const rolesAdicionalesDisponibles = computed(() => {
  return rolesDisponibles.value.filter(r => r.id !== formCrear.value.rolId)
})

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('es-ES') : '—'
}
=======
onMounted(() => {
  cargar()
})
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a

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
  } else {
    return {
      firstName: parts[0] || '',
      middleName: '',
      lastName: '',
    }
  }
}

async function cargar() {
  loading.value = true
  try {
<<<<<<< HEAD
    const raw = await usuariosService.listar()
    usuarios.value = raw.filter(u => u.id !== auth.userId)
  } catch (err) {
    console.error(err)
=======
    usuarios.value = await usuariosService.listar()
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
  } finally {
    loading.value = false
  }
}

<<<<<<< HEAD
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
  if (!nc) {
    val.setError('nombreCompleto', 'El nombre completo es requerido')
    valid = false
  } else if (parts.length < 3) {
    val.setError('nombreCompleto', 'Debe ingresar al menos 3 nombres separados por espacio')
    valid = false
  }
  if (!formCrear.value.cedula || formCrear.value.cedula.length !== 10) {
    val.setError('cedula', 'La cédula debe tener 10 dígitos')
    valid = false
  }
  if (!formCrear.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formCrear.value.email)) {
    val.setError('email', 'Ingrese un correo válido')
    valid = false
  }
  if (!formCrear.value.phone || formCrear.value.phone.length !== 10) {
    val.setError('phone', 'El teléfono debe tener 10 dígitos')
    valid = false
  }
  if (!formCrear.value.nationality) {
    val.setError('nationality', 'La nacionalidad es requerida')
    valid = false
  }
  if (!formCrear.value.address) {
    val.setError('address', 'La dirección es requerida')
    valid = false
  }
  if (!formCrear.value.rolId) {
    val.setError('rolId', 'Seleccione un rol inicial')
    valid = false
  }

  if (!valid) return

  guardando.value = true
  try {
    const { firstName, middleName, lastName } = parseNombreCompleto(formCrear.value.nombreCompleto)

    const payload = {
      cedula: formCrear.value.cedula,
      firstName,
      middleName,
      lastName,
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
        try {
          await usuariosService.asignarRol(nuevoUsuario.id, rolId)
        } catch (err) {
          console.error('Error al asignar rol adicional:', err)
        }
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
  if (!nc) {
    val.setError('nombreCompleto', 'El nombre completo es requerido')
    valid = false
  } else if (parts.length < 3) {
    val.setError('nombreCompleto', 'Debe ingresar al menos 3 nombres separados por espacio')
    valid = false
  }
  if (!formEditar.value.dni || formEditar.value.dni.length !== 10) {
    val.setError('dni', 'La cédula debe tener 10 dígitos')
    valid = false
  }
  if (!formEditar.value.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEditar.value.email)) {
    val.setError('email', 'Ingrese un correo válido')
    valid = false
  }
  if (!formEditar.value.phone || formEditar.value.phone.length !== 10) {
    val.setError('phone', 'El teléfono debe tener 10 dígitos')
    valid = false
  }
  if (!formEditar.value.nationality) {
    val.setError('nationality', 'La nacionalidad es requerida')
    valid = false
  }
  if (!formEditar.value.address) {
    val.setError('address', 'La dirección es requerida')
    valid = false
  }

  if (!valid) return

  guardando.value = true
  try {
    const { firstName, middleName, lastName } = parseNombreCompleto(formEditar.value.nombreCompleto)

    await usuariosService.actualizarPersona(formEditar.value.personaId, {
      firstName,
      middleName,
      lastName,
      dni: formEditar.value.dni,
      email: formEditar.value.email,
      phone: formEditar.value.phone,
      nationality: formEditar.value.nationality,
      address: formEditar.value.address,
      tipo: 'natural',
    })

    mostrarModalEditar.value = false
    toast.success('Usuario actualizado exitosamente')
=======
function editar(item) {
  editando.value = item
  form.value = { username: item.username, email: item.email, nombre: item.nombre || '', rol: '' }
  showForm.value = true
}

async function guardar() {
  saving.value = true
  try {
    if (editando.value) {
      await usuariosService.actualizar(editando.value.id, form.value)
    } else {
      await usuariosService.crear(form.value)
    }
    showForm.value = false
    editando.value = null
    form.value = { username: '', email: '', nombre: '', rol: '' }
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
    await cargar()
  } finally {
    saving.value = false
  }
}

<<<<<<< HEAD
function solicitarToggleActivo(item) {
  confirmState.value = {
    visible: true,
    item,
    action: item.active ? 'desactivar' : 'activar',
  }
}

function solicitarEliminar(item) {
  confirmState.value = {
    visible: true,
    item,
    action: 'eliminar',
  }
}

async function ejecutarAccionConfirmada() {
  const item = confirmState.value.item
  const action = confirmState.value.action
  confirmState.value.visible = false
  if (!item) return

=======
async function toggleEstado(item) {
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
  try {
    if (item.activo) {
      await usuariosService.desactivar(item.id)
<<<<<<< HEAD
      toast.success(`Usuario '${item.username}' desactivado`)
    } else if (action === 'activar') {
      await usuariosService.activar(item.id)
      toast.success(`Usuario '${item.username}' activado`)
    } else if (action === 'eliminar') {
      await usuariosService.eliminar(item.id)
      toast.success(`Usuario '${item.username}' eliminado`)
=======
    } else {
      await usuariosService.activar(item.id)
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
    }
    await cargar()
  } catch (e) {
    console.error(e)
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800">Usuarios</h3>
      <button
        v-if="perm.isAdmin()"
        @click="abrirModalCrear"
        class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span>+ Nuevo Usuario</span>
      </button>
    </div>

    <DataTable
      :items="usuarios"
      :columns="columns"
      :loading="loading"
      empty-text="No hay usuarios registrados"
      search-placeholder="Buscar usuario por nombre, email o username..."
    >
      <template #cell-username="{ value }">
        <span class="font-medium text-gray-900">{{ value }}</span>
      </template>

      <template #cell-roles="{ item }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="r in (item.roles || [])"
            :key="r"
            class="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium"
          >
            {{ ROLE_LABELS[r] || r }}
          </span>
          <span v-if="!item.roles || item.roles.length === 0" class="text-xs text-gray-400">—</span>
        </div>
      </template>

      <template #cell-active="{ value }">
        <StatusBadge :estado="value ? 'ACTIVO' : 'INACTIVO'" />
      </template>

      <template #cell-created_at="{ value }">
        <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
      </template>

      <template v-if="perm.isAdmin()" #actions="{ item }">
        <div class="flex gap-2 justify-end items-center">
          <button
            @click="abrirModalEditar(item)"
            class="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
          >
            Editar
          </button>
          <button
            @click="solicitarToggleActivo(item)"
            class="text-xs px-2.5 py-1 rounded font-medium transition"
            :class="item.active
              ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
              : 'bg-green-50 text-green-700 hover:bg-green-100'"
          >
            {{ item.active ? 'Desactivar' : 'Activar' }}
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modal Form (Crear / Editar Usuario) -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4 overflow-y-auto max-h-[90vh]">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ editandoId ? 'Editar Usuario' : 'Nuevo Usuario' }}
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Nombre de Usuario</label>
              <input
                v-model="form.username"
                type="text"
                :disabled="!!editandoId"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:bg-gray-100"
                :class="val.errors.value.username ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="val.errors.value.username" class="text-xs text-red-600 mt-1">{{ val.errors.value.username }}</p>
            </div>

            <div v-if="!editandoId">
              <label class="block text-xs font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                v-model="form.password"
                type="password"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="val.errors.value.password ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="val.errors.value.password" class="text-xs text-red-600 mt-1">{{ val.errors.value.password }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                v-model="form.persona_nombre"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="val.errors.value.persona_nombre ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="val.errors.value.persona_nombre" class="text-xs text-red-600 mt-1">{{ val.errors.value.persona_nombre }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Correo Electrónico</label>
              <input
                v-model="form.persona_email"
                type="email"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="val.errors.value.persona_email ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="val.errors.value.persona_email" class="text-xs text-red-600 mt-1">{{ val.errors.value.persona_email }}</p>
            </div>
          </div>

          <!-- Selección de Roles -->
          <div class="mt-4">
            <label class="block text-xs font-medium text-gray-700 mb-2">Asignar Roles</label>
            <div class="grid grid-cols-2 gap-2 border border-gray-200 rounded-lg p-3 bg-gray-50">
              <label v-for="(label, key) in ROLE_LABELS" :key="key" class="flex items-center gap-2 text-xs text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  :value="key"
                  v-model="form.roles"
                  class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>{{ label }}</span>
              </label>
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="cerrarModal"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              @click="guardar"
              :disabled="guardando"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ConfirmDialog -->
    <ConfirmDialog
      :visible="confirmState.visible"
      :titulo="confirmState.action === 'desactivar' ? 'Desactivar Usuario' : 'Activar Usuario'"
      :mensaje="`¿Estás seguro de que deseas ${confirmState.action} al usuario '${confirmState.item?.username}'?`"
      :confirmText="confirmState.action === 'desactivar' ? 'Desactivar' : 'Activar'"
      :danger="confirmState.action === 'desactivar'"
      @confirm="ejecutarToggleActivo"
      @cancel="confirmState.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usuariosService } from '@/services/usuarios.service'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import { useFormValidation } from '@/composables/useFormValidation'
import { ROLE_LABELS } from '@/utils/constants'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const perm = usePermission()
const toast = useToastStore()
const val = useFormValidation()

const usuarios = ref([])
const loading = ref(true)
const guardando = ref(false)
const mostrarModal = ref(false)
const editandoId = ref(null)

const form = ref({
  username: '',
  password: '',
  persona_nombre: '',
  persona_email: '',
  roles: [],
})

const confirmState = ref({ visible: false, item: null, action: '' })

const columns = [
  { key: 'username', label: 'Usuario' },
  { key: 'persona_nombre', label: 'Nombre' },
  { key: 'persona_email', label: 'Email' },
  { key: 'roles', label: 'Roles' },
  { key: 'active', label: 'Estado' },
  { key: 'created_at', label: 'Creado' },
]

function formatDate(date) {
  return date ? new Date(date).toLocaleDateString('es-ES') : '—'
}

async function cargar() {
  loading.value = true
  try {
    usuarios.value = await usuariosService.listar()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function abrirModalCrear() {
  val.clearErrors()
  editandoId.value = null
  form.value = { username: '', password: '', persona_nombre: '', persona_email: '', roles: [] }
  mostrarModal.value = true
}

function abrirModalEditar(item) {
  val.clearErrors()
  editandoId.value = item.id
  form.value = {
    username: item.username,
    password: '',
    persona_nombre: item.persona_nombre || '',
    persona_email: item.persona_email || '',
    roles: Array.isArray(item.roles) ? [...item.roles] : [],
  }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
}

async function guardar() {
  val.clearErrors()
  let valid = true

  if (!editandoId.value) {
    if (!val.validateRequired('username', form.value.username, 'Nombre de usuario')) valid = false
    if (!val.validateMinLength('password', form.value.password, 4, 'La contraseña')) valid = false
  }
  if (!val.validateRequired('persona_nombre', form.value.persona_nombre, 'Nombre completo')) valid = false
  if (!val.validateEmail('persona_email', form.value.persona_email)) valid = false

  if (!valid) return

  guardando.value = true
  try {
    if (editandoId.value) {
      await usuariosService.actualizar(editandoId.value, {
        persona_nombre: form.value.persona_nombre,
        persona_email: form.value.persona_email,
        roles: form.value.roles,
      })
      toast.success('Usuario actualizado exitosamente')
    } else {
      await usuariosService.crear(form.value)
      toast.success('Usuario creado exitosamente')
    }
    cerrarModal()
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    guardando.value = false
  }
}

function solicitarToggleActivo(item) {
  confirmState.value = {
    visible: true,
    item,
    action: item.active ? 'desactivar' : 'activar',
  }
}

async function ejecutarToggleActivo() {
  const item = confirmState.value.item
  const action = confirmState.value.action
  confirmState.value.visible = false
  if (!item) return

  try {
    if (action === 'desactivar') {
      await usuariosService.desactivar(item.id)
      toast.success(`Usuario '${item.username}' desactivado`)
    } else {
      await usuariosService.activar(item.id)
      toast.success(`Usuario '${item.username}' activado`)
    }
    await cargar()
  } catch (err) {
    console.error(err)
  }
}

onMounted(cargar)
</script>

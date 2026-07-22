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
      <template #cell-roles="{ item }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="r in (item.roles || [])"
            :key="r"
            class="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700"
          >
            {{ ROLE_LABELS[r] || r }}
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
        </div>
      </template>
    </DataTable>

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
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { usePermission } from '@/composables/usePermission'
import { usuariosService } from '@/services/usuarios.service'
import { ROLE_LABELS } from '@/utils/constants'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const { can } = usePermission()

const usuarios = ref([])
const loading = ref(false)
const showForm = ref(false)
const saving = ref(false)
const editando = ref(null)

const form = ref({ username: '', email: '', nombre: '', rol: '' })

const columnsUsuarios = [
  { key: 'username', label: 'Usuario' },
  { key: 'email', label: 'Email' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'activo', label: 'Estado' },
  { key: 'roles', label: 'Roles' },
]

onMounted(() => {
  cargar()
})

async function cargar() {
  loading.value = true
  try {
    usuarios.value = await usuariosService.listar()
  } finally {
    loading.value = false
  }
}

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
    await cargar()
  } finally {
    saving.value = false
  }
}

async function toggleEstado(item) {
  try {
    if (item.activo) {
      await usuariosService.desactivar(item.id)
    } else {
      await usuariosService.activar(item.id)
    }
    await cargar()
  } catch (e) {
    console.error(e)
  }
}
</script>

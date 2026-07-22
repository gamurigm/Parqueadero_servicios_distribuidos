<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800">Roles</h3>
      <button
        v-if="perm.isAdmin()"
        @click="abrirModalCrear"
        class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span>+ Nuevo Rol</span>
      </button>
    </div>

    <DataTable
      :items="roles"
      :columns="columns"
      :loading="loading"
      empty-text="No hay roles registrados"
      search-placeholder="Buscar roles..."
    >
      <template #cell-activo="{ value }">
        <StatusBadge :estado="value ? 'ACTIVO' : 'INACTIVO'" />
      </template>
      <template #cell-descripcion="{ value }">
        <span class="text-xs text-gray-500">{{ value || '—' }}</span>
      </template>
      <template v-if="perm.isAdmin()" #actions="{ item }">
        <div class="flex gap-2 justify-end">
          <button
            @click="abrirModalEditar(item)"
            class="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
          >
            Editar
          </button>
          <button
            @click="solicitarEliminacion(item)"
            class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
          >
            Eliminar
          </button>
        </div>
      </template>
    </DataTable>

    <!-- Modal Form (Crear / Editar) -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">
            {{ editandoId ? 'Editar Rol' : 'Nuevo Rol' }}
          </h3>
          
          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input
                v-model="form.nombre"
                type="text"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="val.errors.value.nombre ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="val.errors.value.nombre" class="text-xs text-red-600 mt-1">{{ val.errors.value.nombre }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                v-model="form.descripcion"
                rows="3"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              ></textarea>
            </div>

            <div v-if="editandoId" class="flex items-center gap-2">
              <input
                v-model="form.activo"
                type="checkbox"
                id="rolActivo"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label for="rolActivo" class="text-sm text-gray-700">Rol Activo</label>
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
      titulo="Eliminar Rol"
      :mensaje="`¿Estás seguro de eliminar el rol '${confirmState.item?.nombre}'?`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminacion"
      @cancel="confirmState.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { rolesService } from '@/services/roles.service'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import { useFormValidation } from '@/composables/useFormValidation'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const perm = usePermission()
const toast = useToastStore()
const val = useFormValidation()

const roles = ref([])
const loading = ref(true)
const guardando = ref(false)
const mostrarModal = ref(false)
const editandoId = ref(null)

const form = ref({ nombre: '', descripcion: '', activo: true })

const confirmState = ref({ visible: false, item: null })

const columns = [
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'activo', label: 'Estado' },
]

async function cargar() {
  loading.value = true
  try {
    roles.value = await rolesService.listar()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function abrirModalCrear() {
  val.clearErrors()
  editandoId.value = null
  form.value = { nombre: '', descripcion: '', activo: true }
  mostrarModal.value = true
}

function abrirModalEditar(item) {
  val.clearErrors()
  editandoId.value = item.id
  form.value = { nombre: item.nombre, descripcion: item.descripcion || '', activo: item.activo }
  mostrarModal.value = true
}

function cerrarModal() {
  mostrarModal.value = false
}

async function guardar() {
  val.clearErrors()
  if (!val.validateRequired('nombre', form.value.nombre, 'Nombre del rol')) return

  guardando.value = true
  try {
    if (editandoId.value) {
      await rolesService.actualizar(editandoId.value, form.value)
      toast.success('Rol actualizado correctamente')
    } else {
      await rolesService.crear(form.value)
      toast.success('Rol creado correctamente')
    }
    cerrarModal()
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    guardando.value = false
  }
}

function solicitarEliminacion(item) {
  confirmState.value = { visible: true, item }
}

async function ejecutarEliminacion() {
  const item = confirmState.value.item
  confirmState.value.visible = false
  if (!item) return

  try {
    await rolesService.eliminar(item.id)
    toast.success(`Rol '${item.nombre}' eliminado`)
    await cargar()
  } catch (err) {
    console.error(err)
  }
}

onMounted(cargar)
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800">Vehículos</h3>
      <button
        v-if="perm.isAdmin()"
        @click="mostrarForm = !mostrarForm"
        class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        {{ mostrarForm ? 'Cancelar' : '+ Nuevo Vehículo' }}
      </button>
    </div>

    <div v-if="mostrarForm" class="bg-white rounded-lg shadow p-5 mb-6 border border-gray-100">
      <h4 class="font-medium text-gray-800 mb-4">Registrar Vehículo</h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Placa</label>
          <input
            v-model="form.placa"
            type="text"
            placeholder="ej. ABC-1234"
            class="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            :class="val.errors.value.placa ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="val.errors.value.placa" class="text-xs text-red-600 mt-1">{{ val.errors.value.placa }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Marca</label>
          <input
            v-model="form.marca"
            type="text"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            :class="val.errors.value.marca ? 'border-red-500' : 'border-gray-300'"
          />
          <p v-if="val.errors.value.marca" class="text-xs text-red-600 mt-1">{{ val.errors.value.marca }}</p>
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Modelo</label>
          <input
            v-model="form.modelo"
            type="text"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-gray-300"
          />
        </div>

        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">Tipo</label>
          <select
            v-model="form.tipo"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="AUTO">Auto</option>
            <option value="MOTOCICLETA">Motocicleta</option>
            <option value="CAMIONETA">Camioneta</option>
          </select>
        </div>
      </div>

      <div class="mt-4 flex justify-end">
        <button
          @click="crear"
          :disabled="guardando"
          class="text-sm bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {{ guardando ? 'Guardando...' : 'Guardar Vehículo' }}
        </button>
      </div>
    </div>

    <DataTable
      :items="vehiculos"
      :columns="columns"
      :loading="loading"
      empty-text="No hay vehículos registrados"
      search-placeholder="Buscar por placa, marca, modelo..."
    >
      <template #cell-activo="{ value }">
        <StatusBadge :estado="value ? 'ACTIVO' : 'INACTIVO'" />
      </template>

      <template v-if="perm.isSuperUser() || perm.isAdmin()" #actions="{ item }">
        <button
          @click="solicitarEliminacion(item)"
          class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
        >
          Eliminar
        </button>
      </template>
    </DataTable>

    <!-- ConfirmDialog -->
    <ConfirmDialog
      :visible="confirmState.visible"
      titulo="Eliminar Vehículo"
      :mensaje="`¿Estás seguro de eliminar el vehículo con placa '${confirmState.item?.placa}'?`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminacion"
      @cancel="confirmState.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vehiculosService } from '@/services/vehiculos.service'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import { useFormValidation } from '@/composables/useFormValidation'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const perm = usePermission()
const toast = useToastStore()
const val = useFormValidation()

const vehiculos = ref([])
const loading = ref(true)
const guardando = ref(false)
const mostrarForm = ref(false)
const form = ref({ placa: '', marca: '', modelo: '', tipo: 'AUTO' })

const confirmState = ref({ visible: false, item: null })

const columns = [
  { key: 'placa', label: 'Placa' },
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'activo', label: 'Estado' },
]

async function cargar() {
  loading.value = true
  try {
    vehiculos.value = await vehiculosService.listar()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function crear() {
  val.clearErrors()
  let valid = true
  if (!val.validatePlate('placa', form.value.placa)) valid = false
  if (!val.validateRequired('marca', form.value.marca, 'La marca')) valid = false

  if (!valid) return

  guardando.value = true
  try {
    await vehiculosService.crear(form.value)
    toast.success(`Vehículo con placa ${form.value.placa.toUpperCase()} registrado`)
    form.value = { placa: '', marca: '', modelo: '', tipo: 'AUTO' }
    mostrarForm.value = false
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
    await vehiculosService.eliminar(item.id)
    toast.success(`Vehículo ${item.placa} eliminado`)
    await cargar()
  } catch (err) {
    console.error(err)
  }
}

onMounted(cargar)
</script>

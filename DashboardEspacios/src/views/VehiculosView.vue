<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Vehículos</h2>
      <button
        @click="showForm = true"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        + Nuevo Vehículo
      </button>
    </div>

    <DataTable
      :items="vehiculos"
      :columns="columnsVehiculos"
      :loading="loading"
      empty-text="No hay vehículos registrados"
    >
      <template #cell-activo="{ item }">
        <StatusBadge :estado="item.activo ? 'Activo' : 'Inactivo'" />
      </template>
      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <button @click="editar(item)" class="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
          <button @click="eliminar(item.id)" class="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
        </div>
      </template>
    </DataTable>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm = false">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold mb-4">{{ editando ? 'Editar Vehículo' : 'Nuevo Vehículo' }}</h3>
        <form @submit.prevent="guardar" class="space-y-3">
          <input v-model="form.placa" placeholder="Placa" class="w-full px-3 py-2 border rounded text-sm" required />
          <input v-model="form.marca" placeholder="Marca" class="w-full px-3 py-2 border rounded text-sm" />
          <input v-model="form.modelo" placeholder="Modelo" class="w-full px-3 py-2 border rounded text-sm" />
          <input v-model="form.color" placeholder="Color" class="w-full px-3 py-2 border rounded text-sm" />
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" @click="showForm = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">{{ saving ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { vehiculosService } from '@/services/vehiculos.service'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const vehiculos = ref([])
const loading = ref(false)
const showForm = ref(false)
const saving = ref(false)
const editando = ref(null)
const form = ref({ placa: '', marca: '', modelo: '', color: '' })

const columnsVehiculos = [
  { key: 'placa', label: 'Placa' },
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'color', label: 'Color' },
  { key: 'activo', label: 'Estado' },
]

onMounted(() => { cargar() })

async function cargar() {
  loading.value = true
  try {
    vehiculos.value = await vehiculosService.listar()
  } finally {
    loading.value = false
  }
}

function editar(item) {
  editando.value = item
  form.value = { placa: item.placa, marca: item.marca || '', modelo: item.modelo || '', color: item.color || '' }
  showForm.value = true
}

async function guardar() {
  saving.value = true
  try {
    if (editando.value) {
      await vehiculosService.actualizar(editando.value.id, form.value)
    } else {
      await vehiculosService.crear(form.value)
    }
    showForm.value = false
    editando.value = null
    form.value = { placa: '', marca: '', modelo: '', color: '' }
    await cargar()
  } finally {
    saving.value = false
  }
}

async function eliminar(id) {
  try {
    await vehiculosService.eliminar(id)
    await cargar()
  } catch (e) {
    console.error(e)
  }
}
</script>

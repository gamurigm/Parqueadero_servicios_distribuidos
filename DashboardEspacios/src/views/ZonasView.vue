<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Zonas</h2>
      <button
        @click="showForm = true"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        + Nueva Zona
      </button>
    </div>

    <DataTable
      :items="zonas"
      :columns="columnsZonas"
      :loading="loading"
      empty-text="No hay zonas registradas"
    >
      <template #cell-activo="{ item }">
        <StatusBadge :estado="item.activo ? 'Activo' : 'Inactivo'" />
      </template>
    </DataTable>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm = false">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold mb-4">Nueva Zona</h3>
        <form @submit.prevent="guardarZona" class="space-y-3">
          <input v-model="zonaForm.nombre" placeholder="Nombre de la zona" class="w-full px-3 py-2 border rounded text-sm" required />
          <textarea v-model="zonaForm.descripcion" placeholder="Descripción" class="w-full px-3 py-2 border rounded text-sm"></textarea>
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" @click="showForm = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">{{ savingZona ? 'Guardando...' : 'Guardar' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { zonasService } from '@/services/zonas.service'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const zonas = ref([])
const loading = ref(false)
const showForm = ref(false)
const savingZona = ref(false)
const zonaForm = ref({ nombre: '', descripcion: '' })

const columnsZonas = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'activo', label: 'Estado' },
]

onMounted(() => { cargar() })

async function cargar() {
  loading.value = true
  try {
    zonas.value = await zonasService.listarZonas()
  } finally {
    loading.value = false
  }
}

async function guardarZona() {
  savingZona.value = true
  try {
    await zonasService.crearZona(zonaForm.value)
    showForm.value = false
    zonaForm.value = { nombre: '', descripcion: '' }
    await cargar()
  } finally {
    savingZona.value = false
  }
}
</script>

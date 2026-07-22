<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Auditoría</h2>
    </div>

    <div class="mb-4 flex flex-wrap gap-4">
      <div>
        <label class="block text-xs text-gray-500 mb-1">Desde</label>
        <input v-model="filtros.fecha_desde" type="date" class="px-3 py-2 border rounded text-sm" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">Hasta</label>
        <input v-model="filtros.fecha_hasta" type="date" class="px-3 py-2 border rounded text-sm" />
      </div>
      <div>
        <label class="block text-xs text-gray-500 mb-1">Tipo</label>
        <input v-model="filtros.tipo" placeholder="evento, usuario..." class="px-3 py-2 border rounded text-sm" />
      </div>
      <div class="flex items-end">
        <button @click="cargar" class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
          Filtrar
        </button>
      </div>
    </div>

    <DataTable
      :items="eventos"
      :columns="columnsAuditoria"
      :loading="loading"
      empty-text="No hay eventos de auditoría"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auditService } from '@/services/audit.service'
import DataTable from '@/components/common/DataTable.vue'

const eventos = ref([])
const loading = ref(false)
const filtros = ref({ fecha_desde: '', fecha_hasta: '', tipo: '' })

const columnsAuditoria = [
  { key: 'id', label: 'ID' },
  { key: 'tipo', label: 'Tipo' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'fecha', label: 'Fecha' },
  { key: 'ip_origen', label: 'IP' },
]

onMounted(() => { cargar() })

async function cargar() {
  loading.value = true
  try {
    const params = {}
    if (filtros.value.fecha_desde) params.fecha_desde = filtros.value.fecha_desde
    if (filtros.value.fecha_hasta) params.fecha_hasta = filtros.value.fecha_hasta
    if (filtros.value.tipo) params.tipo = filtros.value.tipo
    eventos.value = await auditService.listar(params)
  } finally {
    loading.value = false
  }
}
</script>

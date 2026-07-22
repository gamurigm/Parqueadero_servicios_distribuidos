<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800">Auditoría</h3>
    </div>

    <DataTable
      :items="eventos"
      :columns="columns"
      :loading="loading"
      empty-text="No hay eventos de auditoría"
      search-placeholder="Buscar evento por servicio, acción, usuario..."
    >
      <template #cell-datos="{ value }">
        <span class="text-xs text-gray-500 truncate max-w-[200px] inline-block">
          {{ value ? JSON.stringify(value).slice(0, 60) + '...' : '—' }}
        </span>
      </template>
      <template #cell-created_at="{ value }">
        <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
      </template>
      <template #cell-usuario="{ value }">
        <span class="text-xs font-medium">{{ value || '—' }}</span>
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { auditService } from '@/services/audit.service'
import DataTable from '@/components/common/DataTable.vue'

const eventos = ref([])
const loading = ref(true)

const columns = [
  { key: 'servicio', label: 'Servicio' },
  { key: 'accion', label: 'Acción' },
  { key: 'entidad', label: 'Entidad' },
  { key: 'usuario', label: 'Usuario' },
  { key: 'ip', label: 'IP' },
  { key: 'datos', label: 'Detalle' },
  { key: 'created_at', label: 'Fecha' },
]

function formatDate(date) {
  return date ? new Date(date).toLocaleString('es-ES', { hour12: false }) : '—'
}

async function cargar() {
  loading.value = true
  try {
    eventos.value = await auditService.listar()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

onMounted(cargar)
</script>

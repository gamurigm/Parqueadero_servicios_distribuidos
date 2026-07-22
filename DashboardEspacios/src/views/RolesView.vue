<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Roles</h2>
    </div>

    <DataTable
      :items="roles"
      :columns="columnsRoles"
      :loading="loading"
      empty-text="No hay roles registrados"
    >
      <template #cell-activo="{ item }">
        <StatusBadge :estado="item.activo ? 'Activo' : 'Inactivo'" />
      </template>
    </DataTable>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { zonasService } from '@/services/zonas.service'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const roles = ref([])
const loading = ref(false)

const columnsRoles = [
  { key: 'id', label: 'ID' },
  { key: 'nombre', label: 'Nombre' },
  { key: 'descripcion', label: 'Descripción' },
  { key: 'activo', label: 'Estado' },
]

onMounted(() => {
  cargar()
})

async function cargar() {
  loading.value = true
  try {
    const { data } = await import('@/services/api').then(m => m.default.get('/usuarios/api/v1/roles'))
    roles.value = Array.isArray(data) ? data : (data.results || [])
  } finally {
    loading.value = false
  }
}
</script>

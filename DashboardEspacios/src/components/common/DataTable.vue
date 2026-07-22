<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div v-if="searchable || $slots.filters" class="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-center bg-gray-50/50">
      <div v-if="searchable" class="relative w-full sm:w-72">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchPlaceholder"
          class="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
        />
        <span class="absolute left-3 top-2 text-gray-400 text-sm">🔍</span>
      </div>
      <div v-if="$slots.filters" class="flex gap-2 w-full sm:w-auto">
        <slot name="filters" />
      </div>
    </div>

    <div v-if="loading" class="p-8">
      <LoadingSpinner />
    </div>
    <div v-else-if="!filteredItems || filteredItems.length === 0" class="text-center py-12 text-gray-500">
      <p>{{ emptyText }}</p>
    </div>
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              {{ col.label }}
            </th>
            <th v-if="$slots.actions" class="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(item, idx) in displayedItems" :key="item.id || idx" class="hover:bg-gray-50">
            <td v-for="col in columns" :key="col.key" class="px-4 py-3 text-sm text-gray-700">
              <slot :name="`cell-${col.key}`" :item="item" :value="item[col.key]">
                {{ item[col.key] }}
              </slot>
            </td>
            <td v-if="$slots.actions" class="px-4 py-3 text-sm text-right">
              <slot name="actions" :item="item" />
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="paginated && filteredItems.length > 0" class="px-4 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 text-sm text-gray-600">
      <div>
        Mostrando <span class="font-medium">{{ startIndex + 1 }}</span> a
        <span class="font-medium">{{ endIndex }}</span> de
        <span class="font-medium">{{ filteredItems.length }}</span> resultados
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="currentPage--"
          :disabled="currentPage === 1"
          class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Anterior
        </button>
        <span class="text-xs">Página {{ currentPage }} de {{ totalPages }}</span>
        <button
          @click="currentPage++"
          :disabled="currentPage >= totalPages"
          class="px-3 py-1 border rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
        >
          Siguiente
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import LoadingSpinner from './LoadingSpinner.vue'

const props = defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No hay registros' },
  searchable: { type: Boolean, default: true },
  searchPlaceholder: { type: String, default: 'Buscar...' },
  paginated: { type: Boolean, default: true },
  pageSize: { type: Number, default: 8 },
})

const searchQuery = ref('')
const currentPage = ref(1)

const filteredItems = computed(() => {
  if (!props.items) return []
  if (!props.searchable || !searchQuery.value.trim()) return props.items
  const q = searchQuery.value.toLowerCase().trim()
  return props.items.filter(item => {
    return props.columns.some(col => {
      const val = item[col.key]
      if (val === null || val === undefined) return false
      return String(val).toLowerCase().includes(q)
    })
  })
})

const totalPages = computed(() => {
  if (!props.paginated) return 1
  return Math.ceil(filteredItems.value.length / props.pageSize) || 1
})

const startIndex = computed(() => (currentPage.value - 1) * props.pageSize)
const endIndex = computed(() => Math.min(startIndex.value + props.pageSize, filteredItems.value.length))

const displayedItems = computed(() => {
  if (!props.paginated) return filteredItems.value
  return filteredItems.value.slice(startIndex.value, endIndex.value)
})

watch([searchQuery, () => props.items], () => {
  currentPage.value = 1
})
</script>

<template>
  <div class="bg-white rounded-lg shadow overflow-hidden">
    <div v-if="loading" class="p-8">
      <LoadingSpinner />
    </div>
    <div v-else-if="!items || items.length === 0" class="text-center py-12 text-gray-500">
      <p>{{ emptyText }}</p>
    </div>
    <table v-else class="min-w-full divide-y divide-gray-200">
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
        <tr v-for="(item, idx) in items" :key="item.id || idx" class="hover:bg-gray-50">
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
</template>

<script setup>
import LoadingSpinner from './LoadingSpinner.vue'

defineProps({
  items: { type: Array, default: () => [] },
  columns: { type: Array, required: true },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: 'No hay registros' },
})
</script>

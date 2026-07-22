<template>
  <span
    class="px-2 py-1 text-xs font-semibold rounded-full"
    :class="colorClass"
  >
    {{ label }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  estado: { type: String, required: true },
})

const colorClass = computed(() => {
  const e = props.estado?.toUpperCase()
  if (e === 'DISPONIBLE' || e === 'ACTIVO') return 'bg-green-100 text-green-800'
  if (e === 'OCUPADO') return 'bg-red-100 text-red-800'
  if (e === 'RESERVADO' || e === 'PENDIENTE') return 'bg-yellow-100 text-yellow-800'
  if (e === 'ANULADO' || e === 'INACTIVO') return 'bg-gray-100 text-gray-800'
  return 'bg-blue-100 text-blue-800'
})

const label = computed(() => props.estado?.charAt(0).toUpperCase() + props.estado?.slice(1).toLowerCase())
</script>

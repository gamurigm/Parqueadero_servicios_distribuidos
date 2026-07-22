<template>
  <div class="flex items-center justify-center py-12">
    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    <span v-if="text" class="ml-3 text-gray-500 text-sm">{{ text }}</span>
  </div>
</template>

<script setup>
defineProps({
  text: { type: String, default: 'Cargando...' },
})
</script>

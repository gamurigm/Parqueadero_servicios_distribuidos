<template>
  <div>
    <div class="flex items-center gap-2 mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Estado de Espacios</h2>
      <span v-if="loading" class="text-sm text-gray-500">(actualizando...)</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <div
        v-for="esp in listaEspacios"
        :key="esp.id || esps.id_zona + (esps.numero || esps.codigo)"
        class="espacio-card bg-white rounded-lg shadow p-4"
        :class="claseEstado(esp.estado)"
      >
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-semibold text-gray-700">
            {{ esp.zona_nombre || esp.id_zona }} - #{{ esp.numero || esp.codigo }}
          </span>
        </div>
        <p class="text-xs text-gray-500 capitalize">{{ esp.tipo || 'General' }}</p>
        <p class="text-sm mt-2 font-medium" :class="colorEstado(esp.estado)">
          {{ esp.estado }}
        </p>
        <p v-if="esp.placa" class="text-xs text-gray-500 mt-1">{{ esp.placa }}</p>
      </div>
    </div>

    <div v-if="listaEspacios.length === 0 && !loading" class="text-center py-12 text-gray-500">
      No hay espacios disponibles
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import { useEspaciosStore } from '@/stores/espacios'

const espaciosStore = useEspaciosStore()
const loading = computed(() => espaciosStore.loading)
const listaEspacios = computed(() => espaciosStore.espacios)

function claseEstado(estado) {
  const e = (estado || '').toUpperCase()
  if (e === 'DISPONIBLE') return 'bg-disponible'
  if (e === 'OCUPADO') return 'bg-ocupado'
  if (e === 'RESERVADO') return 'bg-reservado'
  return ''
}

function colorEstado(estado) {
  const e = (estado || '').toUpperCase()
  if (e === 'DISPONIBLE') return 'text-green-600'
  if (e === 'OCUPADO') return 'text-red-600'
  if (e === 'RESERVADO') return 'text-yellow-600'
  return 'text-gray-600'
}

onMounted(() => {
  espaciosStore.iniciar()
})

onUnmounted(() => {
  espaciosStore.detener()
})
</script>

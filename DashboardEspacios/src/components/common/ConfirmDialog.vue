<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="fixed inset-0 bg-black/40" @click="cancelar"></div>
      <div class="relative bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">{{ titulo }}</h3>
        <p class="text-sm text-gray-600 mb-6">{{ mensaje }}</p>
        <div class="flex justify-end gap-3">
          <button
            @click="cancelar"
            class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Cancelar
          </button>
          <button
            @click="confirmar"
            class="px-4 py-2 text-sm font-medium text-white rounded-lg"
            :class="danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'"
          >
            {{ confirmText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
const props = withDefaults(defineProps({
  visible: { type: Boolean, default: false },
  titulo: { type: String, default: 'Confirmar' },
  mensaje: { type: String, default: '¿Estás seguro?' },
  confirmText: { type: String, default: 'Confirmar' },
  danger: { type: Boolean, default: false },
}), {
  visible: false,
  titulo: 'Confirmar',
  mensaje: '¿Estás seguro?',
  confirmText: 'Confirmar',
  danger: false,
})

const emit = defineEmits(['confirm', 'cancel'])

function confirmar() { emit('confirm') }
function cancelar() { emit('cancel') }
</script>

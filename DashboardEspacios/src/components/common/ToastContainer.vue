<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4">
      <TransitionGroup
        enter-active-class="transform transition duration-300 ease-out"
        enter-from-class="translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2"
        enter-to-class="translate-y-0 opacity-100 sm:translate-x-0"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-for="toast in toastStore.toasts"
          :key="toast.id"
          class="pointer-events-auto flex items-center justify-between p-4 rounded-lg shadow-lg text-sm text-white font-medium border"
          :class="badgeStyle(toast.type)"
        >
          <div class="flex items-center gap-3">
            <span class="text-base">{{ iconMap(toast.type) }}</span>
            <span>{{ toast.message }}</span>
          </div>
          <button
            @click="toastStore.removeToast(toast.id)"
            class="ml-4 text-white/80 hover:text-white font-bold text-lg leading-none"
          >
            &times;
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToastStore } from '@/stores/toast'

const toastStore = useToastStore()

function badgeStyle(type) {
  switch (type) {
    case 'success':
      return 'bg-green-600 border-green-700'
    case 'error':
      return 'bg-red-600 border-red-700'
    case 'warning':
      return 'bg-amber-600 border-amber-700'
    case 'info':
    default:
      return 'bg-blue-600 border-blue-700'
  }
}

function iconMap(type) {
  switch (type) {
    case 'success': return '✓'
    case 'error': return '✕'
    case 'warning': return '⚠️'
    case 'info': default: return 'ℹ️'
  }
}
</script>

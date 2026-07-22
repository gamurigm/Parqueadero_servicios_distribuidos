<template>
  <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
    <div class="p-4 border-b border-gray-200">
      <h1 class="text-xl font-bold text-gray-800">Dashboard Roles</h1>
      <p class="text-xs text-gray-500">Parqueadero</p>
    </div>
    <nav class="flex-1 overflow-y-auto p-2 space-y-1">
      <RouterLink
        v-for="item in menuFiltrado"
        :key="item.route"
        :to="item.route"
        class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
        :class="$route.path === item.route
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-100'"
      >
        <span class="w-5 h-5 flex items-center justify-center">{{ iconMap[item.icon] }}</span>
        {{ item.label }}
      </RouterLink>
    </nav>
    <div class="p-3 border-t border-gray-200">
      <div class="flex items-center gap-2 px-3 py-2 text-xs text-gray-400">
        <span class="w-2 h-2 rounded-full"
          :class="conectado ? 'bg-green-500' : 'bg-red-500'">
        </span>
        {{ conectado ? 'Conectado' : 'Desconectado' }}
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { MENU_ITEMS } from '@/utils/constants'
import { useEspaciosStore } from '@/stores/espacios'

const auth = useAuthStore()
const espaciosStore = useEspaciosStore()
const conectado = computed(() => espaciosStore.connected)

const menuFiltrado = computed(() =>
  MENU_ITEMS.filter(item => !item.roles || auth.hasAnyRole(item.roles))
)

const iconMap = {
  grid: '▦',
  users: '👥',
  shield: '🛡',
  map: '🗺',
  ticket: '🎫',
  truck: '🚗',
  clipboard: '📋',
  user: '👤',
}
</script>

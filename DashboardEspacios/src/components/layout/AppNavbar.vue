<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <div>
      <h2 class="text-lg font-semibold text-gray-800">{{ titulo }}</h2>
    </div>
    <div class="flex items-center gap-4">
      <span class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
        {{ auth.username }}
      </span>
      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
        {{ rolesLabels }}
      </span>
      <button
        @click="auth.logout()"
        class="text-sm bg-red-50 text-red-600 px-3 py-1 rounded-full hover:bg-red-100 transition"
      >
        Salir
      </button>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const route = useRoute()
const auth = useAuthStore()

const titulo = computed(() => route.meta?.title || 'Dashboard Roles')
const rolesLabels = computed(() =>
  auth.roles.map(r => ROLE_LABELS[r] || r).join(', ')
)
</script>

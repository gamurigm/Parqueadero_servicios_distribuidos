<template>
  <div>
    <h2 class="text-xl font-semibold text-gray-800 mb-6">Mi Perfil</h2>

    <div class="bg-white rounded-lg shadow p-6 max-w-md">
      <div class="space-y-4">
        <div>
          <label class="block text-xs text-gray-500 uppercase">Usuario</label>
          <p class="text-sm font-medium text-gray-800">{{ auth.username }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 uppercase">Roles</label>
          <div class="flex flex-wrap gap-2 mt-1">
            <span
              v-for="r in auth.roles"
              :key="r"
              class="px-3 py-1 text-xs rounded-full bg-blue-100 text-blue-800"
            >
              {{ ROLE_LABELS[r] || r }}
            </span>
          </div>
        </div>
        <div>
          <label class="block text-xs text-gray-500 uppercase">ID de usuario</label>
          <p class="text-sm text-gray-700">{{ auth.userId }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const auth = useAuthStore()
</script>

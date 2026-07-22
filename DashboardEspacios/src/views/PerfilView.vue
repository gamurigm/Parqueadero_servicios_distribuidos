<template>
  <div class="max-w-2xl mx-auto">
    <h3 class="text-lg font-semibold text-gray-800 mb-4">Mi Perfil</h3>
    <div class="bg-white rounded-lg shadow p-6 space-y-4">
      <div class="grid grid-cols-2 gap-4">
        <div>
          <label class="block text-xs text-gray-500 uppercase">Usuario</label>
          <p class="text-gray-800 font-medium">{{ auth.username }}</p>
        </div>
        <div>
          <label class="block text-xs text-gray-500 uppercase">ID</label>
          <p class="text-gray-800 text-sm">{{ auth.userId || auth.user?.id || '—' }}</p>
        </div>
        <div class="col-span-2">
          <label class="block text-xs text-gray-500 uppercase">Roles</label>
          <div class="flex flex-wrap gap-2 mt-1">
            <span
              v-for="rol in auth.roles"
              :key="rol"
              class="px-3 py-1 text-xs font-medium rounded-full"
              :class="rol === 'super_user' ? 'bg-purple-100 text-purple-800' :
                      rol === 'admin' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'"
            >
              {{ roleLabel(rol) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const auth = useAuthStore()

function roleLabel(rol) {
  return ROLE_LABELS[rol] || rol
}
</script>

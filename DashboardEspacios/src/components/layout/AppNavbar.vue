<template>
  <header class="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
    <div>
      <h2 class="text-lg font-semibold text-gray-800">{{ titulo }}</h2>
    </div>
    <div class="flex items-center gap-4">
      <span class="text-sm bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
        {{ auth.username }}
      </span>
      <select
        v-if="auth.allRoles.length > 0"
        v-model="rolLocal"
        @change="cambiarRol"
        class="text-xs border border-gray-300 rounded-full px-3 py-1 bg-blue-50 text-blue-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer"
      >
        <option
          v-for="r in auth.allRoles"
          :key="r"
          :value="r"
        >{{ ROLE_LABELS[r] || r }}</option>
      </select>
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
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ROLE_LABELS } from '@/utils/constants'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

const rolLocal = ref(auth.activeRole)
watch(() => auth.activeRole, (val) => { rolLocal.value = val })

function cambiarRol() {
  auth.setActiveRole(rolLocal.value)
  if (route.meta?.roles && !auth.hasAnyRole(route.meta.roles)) {
    router.push('/')
  }
}
</script>

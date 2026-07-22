<template>
  <ToastContainer />
  <RouterView v-if="route.name === 'Login'" />
  <div v-else-if="!auth.isAuthenticated" class="min-h-screen bg-gray-100">
    <RouterView />
  </div>
  <div v-else class="flex h-screen bg-gray-50">
    <AppSidebar />
    <div class="flex-1 flex flex-col overflow-hidden">
      <AppNavbar />
      <main class="flex-1 overflow-y-auto p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppNavbar from '@/components/layout/AppNavbar.vue'
import ToastContainer from '@/components/common/ToastContainer.vue'

const route = useRoute()
const auth = useAuthStore()
</script>

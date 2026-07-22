<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-xl font-semibold text-gray-800">Tickets</h2>
      <button
        @click="showForm = true"
        class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
      >
        + Emitir Ticket
      </button>
    </div>

    <DataTable
      :items="tickets"
      :columns="columnsTickets"
      :loading="loading"
      empty-text="No hay tickets registrados"
    >
      <template #cell-estado="{ item }">
        <StatusBadge :estado="item.estado" />
      </template>
      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <button
            v-if="item.estado === 'PENDIENTE'"
            @click="pagar(item.id)"
            class="text-green-600 hover:text-green-800 text-sm"
          >Pagar</button>
          <button
            v-if="item.estado === 'PENDIENTE'"
            @click="anular(item.id)"
            class="text-red-600 hover:text-red-800 text-sm"
          >Anular</button>
        </div>
      </template>
    </DataTable>

    <div v-if="showForm" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40" @click.self="showForm = false">
      <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg mx-4">
        <h3 class="text-lg font-semibold mb-4">Emitir Ticket</h3>
        <form @submit.prevent="emitir" class="space-y-3">
          <input v-model="ticketForm.placa" placeholder="Placa del vehículo" class="w-full px-3 py-2 border rounded text-sm" required />
          <select v-model="ticketForm.id_espacio" class="w-full px-3 py-2 border rounded text-sm" required>
            <option value="">Seleccionar espacio...</option>
            <option v-for="esp in espacios" :key="esp.id" :value="esp.id">
              {{ esp.zona_nombre }} - #{{ esp.numero || esp.codigo }} ({{ esp.estado }})
            </option>
          </select>
          <div class="flex justify-end gap-3 mt-4">
            <button type="button" @click="showForm = false" class="px-4 py-2 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200">Cancelar</button>
            <button type="submit" class="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700">{{ saving ? 'Emitiendo...' : 'Emitir' }}</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ticketsService } from '@/services/tickets.service'
import { zonasService } from '@/services/zonas.service'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'

const tickets = ref([])
const espacios = ref([])
const loading = ref(false)
const showForm = ref(false)
const saving = ref(false)
const ticketForm = ref({ placa: '', id_espacio: '' })

const columnsTickets = [
  { key: 'id', label: 'ID' },
  { key: 'placa', label: 'Placa' },
  { key: 'id_espacio', label: 'Espacio' },
  { key: 'fecha_ingreso', label: 'Ingreso' },
  { key: 'estado', label: 'Estado' },
]

onMounted(() => {
  cargar()
  cargarEspacios()
})

async function cargar() {
  loading.value = true
  try {
    tickets.value = await ticketsService.listar()
  } finally {
    loading.value = false
  }
}

async function cargarEspacios() {
  try {
    espacios.value = await zonasService.listarEspacios()
  } catch (e) {
    console.error(e)
  }
}

async function emitir() {
  saving.value = true
  try {
    await ticketsService.emitir(ticketForm.value)
    showForm.value = false
    ticketForm.value = { placa: '', id_espacio: '' }
    await cargar()
  } finally {
    saving.value = false
  }
}

async function pagar(id) {
  try {
    await ticketsService.pagar(id)
    await cargar()
  } catch (e) {
    console.error(e)
  }
}

async function anular(id) {
  try {
    await ticketsService.anular(id)
    await cargar()
  } catch (e) {
    console.error(e)
  }
}
</script>

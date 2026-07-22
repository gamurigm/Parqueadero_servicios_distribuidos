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
<<<<<<< HEAD

      <template #cell-valorRecaudado="{ value }">
        <span class="font-mono font-medium">${{ (value || 0).toFixed(2) }}</span>
      </template>

      <template #cell-created_at="{ value }">
        <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
      </template>

=======
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <button
<<<<<<< HEAD
            v-if="item.estado === 'ACTIVO'"
            @click="solicitarPagar(item)"
            class="text-xs px-2.5 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium"
          >
            Pagar
          </button>
          <button
            v-if="item.estado === 'ACTIVO'"
            @click="solicitarAnular(item)"
            class="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium"
          >
            Anular
          </button>
          <button
            v-if="perm.isSuperUser()"
            @click="solicitarEliminar(item)"
            class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
          >
            Eliminar
          </button>
=======
            v-if="item.estado === 'PENDIENTE'"
            @click="pagar(item.id)"
            class="text-green-600 hover:text-green-800 text-sm"
          >Pagar</button>
          <button
            v-if="item.estado === 'PENDIENTE'"
            @click="anular(item.id)"
            class="text-red-600 hover:text-red-800 text-sm"
          >Anular</button>
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
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
<<<<<<< HEAD
    </Teleport>

    <!-- Modal Motivo Anulación -->
    <Teleport to="body">
      <div v-if="mostrarModalMotivo" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-2">Anular Ticket</h3>
          <p class="text-sm text-gray-600 mb-4">
            Motivo de anulación para el ticket <strong>{{ itemAnular?.codigo || itemAnular?.placa }}</strong>:
          </p>
          <textarea
            v-model="motivoAnulacion"
            rows="3"
            placeholder="Ingrese el motivo (mínimo 5 caracteres)"
            class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-gray-300"
          ></textarea>
          <p v-if="motivoError" class="text-xs text-red-600 mt-1">{{ motivoError }}</p>
          <div class="flex justify-end gap-3 mt-4">
            <button
              @click="mostrarModalMotivo = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              @click="confirmarAnulacion"
              class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700"
            >
              Anular
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ConfirmDialog Pagar -->
    <ConfirmDialog
      :visible="confirmPagar.visible"
      titulo="Pagar Ticket"
      :mensaje="`¿Estás seguro de pagar el ticket '${confirmPagar.item?.codigo || confirmPagar.item?.placa}'?`"
      confirmText="Pagar"
      :danger="false"
      @confirm="ejecutarPagar"
      @cancel="confirmPagar.visible = false"
    />

    <!-- ConfirmDialog Eliminar -->
    <ConfirmDialog
      :visible="confirmEliminar.visible"
      titulo="Eliminar Ticket"
      :mensaje="`¿Estás seguro de eliminar el ticket '${confirmEliminar.item?.codigo || confirmEliminar.item?.placa}'? Esta acción no se puede deshacer.`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminar"
      @cancel="confirmEliminar.visible = false"
    />
=======
    </div>
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
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
<<<<<<< HEAD
const loading = ref(true)
const guardando = ref(false)
const mostrarModal = ref(false)
const mostrarModalMotivo = ref(false)
const motivoAnulacion = ref('')
const motivoError = ref('')
const itemAnular = ref(null)

const form = ref({ placa: '', espacio_id: '', monto: 2.00 })

const confirmPagar = ref({ visible: false, item: null })
const confirmEliminar = ref({ visible: false, item: null })

const columns = [
  { key: 'codigo', label: 'Código' },
  { key: 'placa', label: 'Vehículo' },
  { key: 'espacio_codigo', label: 'Espacio' },
  { key: 'valorRecaudado', label: 'Monto' },
=======
const loading = ref(false)
const showForm = ref(false)
const saving = ref(false)
const ticketForm = ref({ placa: '', id_espacio: '' })

const columnsTickets = [
  { key: 'id', label: 'ID' },
  { key: 'placa', label: 'Placa' },
  { key: 'id_espacio', label: 'Espacio' },
  { key: 'fecha_ingreso', label: 'Ingreso' },
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
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

<<<<<<< HEAD
function solicitarPagar(item) {
  confirmPagar.value = { visible: true, item }
}

function solicitarAnular(item) {
  itemAnular.value = item
  motivoAnulacion.value = ''
  motivoError.value = ''
  mostrarModalMotivo.value = true
}

function solicitarEliminar(item) {
  confirmEliminar.value = { visible: true, item }
}

async function ejecutarPagar() {
  const item = confirmPagar.value.item
  confirmPagar.value.visible = false
  if (!item) return

  try {
    await ticketsService.pagar(item.id, item.codigoTicket)
    toast.success(`Ticket ${item.codigo || item.placa} pagado`)
    await cargar()
  } catch (err) {
    console.error(err)
  }
}

function confirmarAnulacion() {
  motivoError.value = ''
  if (!motivoAnulacion.value || motivoAnulacion.value.trim().length < 5) {
    motivoError.value = 'El motivo debe tener al menos 5 caracteres'
    return
  }
  mostrarModalMotivo.value = false
  ejecutarAnulacion()
}

async function ejecutarAnulacion() {
  const item = itemAnular.value
  if (!item) return

  try {
    await ticketsService.anular(item.id, item.codigoTicket, motivoAnulacion.value.trim())
    toast.success(`Ticket ${item.codigo || item.placa} anulado`)
    await cargar()
  } catch (err) {
    console.error(err)
  }
}

async function ejecutarEliminar() {
  const item = confirmEliminar.value.item
  confirmEliminar.value.visible = false
  if (!item) return

  try {
    await ticketsService.eliminar(item.id)
    toast.success(`Ticket ${item.codigo || item.placa} eliminado`)
=======
async function pagar(id) {
  try {
    await ticketsService.pagar(id)
>>>>>>> 03eb51b93feb545ed552db28366500bfb571277a
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

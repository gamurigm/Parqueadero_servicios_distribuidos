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
      :items="filteredList"
      :columns="columns"
      :loading="loading"
      empty-text="No hay tickets registrados"
    >
      <template #filters>
        <div class="flex flex-wrap gap-3 mb-4">
          <input
            v-model="filtroPlaca"
            type="text"
            placeholder="Filtrar por placa..."
            class="border border-gray-300 rounded px-3 py-1.5 text-sm w-40"
          />
          <input
            v-model="filtroCedula"
            type="text"
            placeholder="Filtrar por cédula..."
            class="border border-gray-300 rounded px-3 py-1.5 text-sm w-40"
          />
          <select v-model="filtroEstado" class="border border-gray-300 rounded px-3 py-1.5 text-sm">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="PAGADO">Pagado</option>
            <option value="ANULADO">Anulado</option>
          </select>
          <input
            v-model="filtroFechaInicio"
            type="date"
            class="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <span class="text-sm text-gray-500 self-center">→</span>
          <input
            v-model="filtroFechaFin"
            type="date"
            class="border border-gray-300 rounded px-3 py-1.5 text-sm"
          />
          <button @click="limpiarFiltros" class="text-gray-500 hover:text-gray-700 text-sm px-2">
            Limpiar
          </button>
        </div>
      </template>

      <template #cell-estado="{ item }">
        <StatusBadge :estado="item.estado" />
      </template>

      <template #cell-valorRecaudado="{ item }">
        <span class="font-mono font-medium">${{ (item.valorRecaudado || 0).toFixed(2) }}</span>
      </template>

      <template #cell-fechaIngreso="{ item }">
        <span class="text-xs text-gray-500">{{ formatFecha(item.fechaIngreso) }}</span>
      </template>

      <template #cell-fechaSalida="{ item }">
        <span class="text-xs text-gray-500">{{ item.fechaSalida ? formatFecha(item.fechaSalida) : '—' }}</span>
      </template>

      <template #actions="{ item }">
        <div class="flex justify-end gap-2">
          <button
            v-if="item.estado === 'ACTIVO'"
            @click="confirmPagar.item = item; confirmPagar.visible = true"
            class="text-xs px-2.5 py-1 rounded bg-green-50 text-green-700 hover:bg-green-100 font-medium"
          >
            Pagar
          </button>
          <button
            v-if="item.estado === 'ACTIVO'"
            @click="abrirModalAnular(item)"
            class="text-xs px-2.5 py-1 rounded bg-amber-50 text-amber-700 hover:bg-amber-100 font-medium"
          >
            Anular
          </button>
          <button
            v-if="perm.isSuperUser()"
            @click="confirmEliminar.item = item; confirmEliminar.visible = true"
            class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
          >
            Eliminar
          </button>
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

    <div v-if="mostrarModalMotivo" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
        <h3 class="text-lg font-semibold text-gray-800 mb-2">Anular Ticket</h3>
        <p class="text-sm text-gray-600 mb-4">
          Motivo de anulación para el ticket <strong>{{ itemAnular?.codigoTicket || itemAnular?.placa }}</strong>:
        </p>
        <textarea
          v-model="motivoAnulacion"
          rows="3"
          placeholder="Ingrese el motivo (mínimo 5 caracteres)"
          class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-gray-300"
        ></textarea>
        <p v-if="motivoError" class="text-xs text-red-600 mt-1">{{ motivoError }}</p>
        <div class="flex justify-end gap-3 mt-4">
          <button @click="cerrarModalAnular" class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
            Cancelar
          </button>
          <button @click="confirmarAnulacion" class="px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700">
            Anular
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirmPagar.visible"
      titulo="Pagar Ticket"
      :mensaje="`¿Estás seguro de pagar el ticket '${confirmPagar.item?.codigoTicket || confirmPagar.item?.placa}'?`"
      confirmText="Pagar"
      :danger="false"
      @confirm="ejecutarPagar"
      @cancel="confirmPagar.visible = false"
    />

    <ConfirmDialog
      :visible="confirmEliminar.visible"
      titulo="Eliminar Ticket"
      :mensaje="`¿Estás seguro de eliminar el ticket '${confirmEliminar.item?.codigoTicket || confirmEliminar.item?.placa}'? Esta acción no se puede deshacer.`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminar"
      @cancel="confirmEliminar.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ticketsService } from '@/services/tickets.service'
import { zonasService } from '@/services/zonas.service'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()

const tickets = ref([])
const espacios = ref([])
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const mostrarModalMotivo = ref(false)
const motivoAnulacion = ref('')
const motivoError = ref('')
const itemAnular = ref(null)

const ticketForm = ref({ placa: '', id_espacio: '' })

const filtroPlaca = ref('')
const filtroCedula = ref('')
const filtroEstado = ref('')
const filtroFechaInicio = ref('')
const filtroFechaFin = ref('')

const confirmPagar = ref({ visible: false, item: null })
const confirmEliminar = ref({ visible: false, item: null })

const columns = [
  { key: 'codigoTicket', label: 'Código' },
  { key: 'placa', label: 'Vehículo' },
  { key: 'idEspacio', label: 'Espacio' },
  { key: 'cedula', label: 'Cédula' },
  { key: 'valorRecaudado', label: 'Monto' },
  { key: 'estado', label: 'Estado' },
  { key: 'fechaIngreso', label: 'Ingreso' },
  { key: 'fechaSalida', label: 'Salida' },
]

const filteredList = computed(() => {
  let list = tickets.value
  if (filtroPlaca.value) {
    const q = filtroPlaca.value.toLowerCase()
    list = list.filter((t) => (t.placa || '').toLowerCase().includes(q))
  }
  if (filtroCedula.value) {
    const q = filtroCedula.value.toLowerCase()
    list = list.filter((t) => (t.cedula || '').toLowerCase().includes(q))
  }
  if (filtroEstado.value) {
    list = list.filter((t) => t.estado === filtroEstado.value)
  }
  if (filtroFechaInicio.value) {
    const inicio = new Date(filtroFechaInicio.value)
    list = list.filter((t) => t.fechaIngreso && new Date(t.fechaIngreso) >= inicio)
  }
  if (filtroFechaFin.value) {
    const fin = new Date(filtroFechaFin.value + 'T23:59:59')
    list = list.filter((t) => t.fechaIngreso && new Date(t.fechaIngreso) <= fin)
  }
  return list
})

function formatFecha(dateStr) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-EC', {
    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function limpiarFiltros() {
  filtroPlaca.value = ''
  filtroCedula.value = ''
  filtroEstado.value = ''
  filtroFechaInicio.value = ''
  filtroFechaFin.value = ''
}

const perm = {
  isSuperUser: () => auth.roles.includes('super_user'),
}

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

function abrirModalAnular(item) {
  itemAnular.value = item
  motivoAnulacion.value = ''
  motivoError.value = ''
  mostrarModalMotivo.value = true
}

function cerrarModalAnular() {
  mostrarModalMotivo.value = false
  itemAnular.value = null
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

async function ejecutarPagar() {
  const item = confirmPagar.value.item
  confirmPagar.value.visible = false
  if (!item) return
  saving.value = true
  try {
    await ticketsService.pagar(item.id)
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function ejecutarAnulacion() {
  const item = itemAnular.value
  if (!item) return
  saving.value = true
  try {
    await ticketsService.anular(item.id, motivoAnulacion.value.trim())
    itemAnular.value = null
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}

async function ejecutarEliminar() {
  const item = confirmEliminar.value.item
  confirmEliminar.value.visible = false
  if (!item) return
  saving.value = true
  try {
    await ticketsService.eliminar(item.id)
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    saving.value = false
  }
}
</script>

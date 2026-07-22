<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800">Gestion de Tickets</h3>
      <button
        v-if="perm.can(['super_user', 'admin', 'empleado'])"
        @click="abrirModalEmitir"
        class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
      >
        <span>+ Emitir Ticket</span>
      </button>
    </div>

    <DataTable
      :items="tickets"
      :columns="columns"
      :loading="loading"
      empty-text="No hay tickets registrados"
      search-placeholder="Buscar ticket por código, placa, espacio..."
    >
      <template #cell-estado="{ value }">
        <StatusBadge :estado="value" />
      </template>

      <template #cell-valorRecaudado="{ value }">
        <span class="font-mono font-medium">${{ (value || 0).toFixed(2) }}</span>
      </template>

      <template #cell-created_at="{ value }">
        <span class="text-xs text-gray-500">{{ formatDate(value) }}</span>
      </template>

      <template #actions="{ item }">
        <div class="flex gap-2 justify-end">
          <button
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
        </div>
      </template>
    </DataTable>

    <!-- Modal Form (Emitir Ticket) -->
    <Teleport to="body">
      <div v-if="mostrarModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">Emitir Nuevo Ticket</h3>

          <div class="space-y-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Placa del Vehículo</label>
              <input
                v-model="form.placa"
                type="text"
                placeholder="ej. ABC-1234"
                class="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="val.errors.value.placa ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="val.errors.value.placa" class="text-xs text-red-600 mt-1">{{ val.errors.value.placa }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Espacio de Parqueadero</label>
              <select
                v-model="form.espacio_id"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="val.errors.value.espacio_id ? 'border-red-500' : 'border-gray-300'"
              >
                <option value="" disabled>Seleccione un espacio disponible</option>
                <option v-for="esp in espaciosDisponibles" :key="esp.id" :value="esp.id">
                  {{ esp.codigo }} ({{ esp.nombreZona || 'Zona' }})
                </option>
              </select>
              <p v-if="val.errors.value.espacio_id" class="text-xs text-red-600 mt-1">{{ val.errors.value.espacio_id }}</p>
            </div>

            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Monto Inicial ($)</label>
              <input
                v-model.number="form.monto"
                type="number"
                step="0.50"
                min="0"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-gray-300"
              />
            </div>
          </div>

          <div class="flex justify-end gap-3 mt-6">
            <button
              @click="mostrarModal = false"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancelar
            </button>
            <button
              @click="guardarTicket"
              :disabled="guardando"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {{ guardando ? 'Emitiendo...' : 'Emitir Ticket' }}
            </button>
          </div>
        </div>
      </div>
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
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { ticketsService } from '@/services/tickets.service'
import { zonasService } from '@/services/zonas.service'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import { useFormValidation } from '@/composables/useFormValidation'
import DataTable from '@/components/common/DataTable.vue'
import StatusBadge from '@/components/common/StatusBadge.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const perm = usePermission()
const toast = useToastStore()
const val = useFormValidation()

const tickets = ref([])
const espacios = ref([])
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
  { key: 'estado', label: 'Estado' },
  { key: 'created_at', label: 'Creado' },
]

const espaciosDisponibles = computed(() => {
  return espacios.value.filter(e => e.estado === 'DISPONIBLE')
})

function formatDate(date) {
  return date ? new Date(date).toLocaleString('es-ES', { hour12: false }) : '—'
}

async function cargar() {
  loading.value = true
  try {
    tickets.value = await ticketsService.listar()
    espacios.value = await zonasService.listarEspacios()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function abrirModalEmitir() {
  val.clearErrors()
  form.value = {
    placa: '',
    espacio_id: espaciosDisponibles.value[0]?.id || '',
    monto: 2.00,
  }
  mostrarModal.value = true
}

async function guardarTicket() {
  val.clearErrors()
  let valid = true
  if (!val.validatePlate('placa', form.value.placa)) valid = false
  if (!val.validateRequired('espacio_id', form.value.espacio_id, 'Espacio')) valid = false

  if (!valid) return

  guardando.value = true
  try {
    await ticketsService.emitir(form.value)
    toast.success('Ticket emitido exitosamente')
    mostrarModal.value = false
    await cargar()
  } catch (err) {
    console.error(err)
  } finally {
    guardando.value = false
  }
}

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
    await cargar()
  } catch (err) {
    console.error(err)
  }
}

onMounted(cargar)
</script>

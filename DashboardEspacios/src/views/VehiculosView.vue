<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h3 class="text-lg font-semibold text-gray-800">Vehículos</h3>
      <button
        v-if="perm.isAdmin()"
        @click="abrirModal"
        class="text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
      >
        + Nuevo Vehículo
      </button>
    </div>

    <DataTable
      :items="vehiculos"
      :columns="columns"
      :loading="loading"
      empty-text="No hay vehículos registrados"
      search-placeholder="Buscar por placa, marca, modelo..."
    >
      <template #cell-tipo="{ item }">
        <span
          class="px-2 py-0.5 rounded text-xs font-medium"
          :class="item.tipo === 'auto' ? 'bg-blue-100 text-blue-800' :
                  item.tipo === 'motocicleta' ? 'bg-green-100 text-green-800' :
                  item.tipo === 'camioneta' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-600'"
        >
          {{ item.tipo || '—' }}
        </span>
      </template>

      <template v-if="perm.isAdmin()" #actions="{ item }">
        <button
          @click="solicitarEliminacion(item)"
          class="text-xs px-2.5 py-1 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
        >
          Eliminar
        </button>
      </template>
    </DataTable>

    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">

        <div class="flex justify-between items-center mb-5">
          <h4 class="text-lg font-semibold text-gray-800">
            <span v-if="step === 1">Seleccionar Tipo</span>
            <span v-else-if="step === 2">Datos del Vehículo</span>
            <span v-else-if="step === 3">Datos Específicos</span>
            <span v-else>Resumen</span>
          </h4>
          <button @click="cerrarModal" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div v-if="step === 1">
          <p class="text-sm text-gray-500 mb-4">Seleccione el tipo de vehículo a registrar</p>
          <div class="grid grid-cols-3 gap-3">
            <button
              @click="form.tipo = 'auto'"
              class="p-4 rounded-lg border-2 text-center transition"
              :class="form.tipo === 'auto' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <span class="block text-2xl mb-1">🚗</span>
              <span class="text-sm font-medium text-gray-700">Auto</span>
            </button>
            <button
              @click="form.tipo = 'motocicleta'"
              class="p-4 rounded-lg border-2 text-center transition"
              :class="form.tipo === 'motocicleta' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <span class="block text-2xl mb-1">🏍️</span>
              <span class="text-sm font-medium text-gray-700">Moto</span>
            </button>
            <button
              @click="form.tipo = 'camioneta'"
              class="p-4 rounded-lg border-2 text-center transition"
              :class="form.tipo === 'camioneta' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'"
            >
              <span class="block text-2xl mb-1">🚐</span>
              <span class="text-sm font-medium text-gray-700">Camioneta</span>
            </button>
          </div>
        </div>

        <div v-if="step === 2" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Placa</label>
              <input
                v-model="form.datos.placa"
                type="text"
                placeholder="ej. ABC-1234"
                class="w-full border rounded-lg px-3 py-2 text-sm uppercase focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="errors.placa ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.placa" class="text-xs text-red-600 mt-1">{{ errors.placa }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Marca</label>
              <input
                v-model="form.datos.marca"
                type="text"
                placeholder="ej. Toyota"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="errors.marca ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.marca" class="text-xs text-red-600 mt-1">{{ errors.marca }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Modelo</label>
              <input
                v-model="form.datos.modelo"
                type="text"
                placeholder="ej. Corolla"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-gray-300"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Color</label>
              <input
                v-model="form.datos.color"
                type="text"
                placeholder="ej. Blanco"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 border-gray-300"
              />
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Año</label>
              <input
                v-model.number="form.datos.anio"
                type="number"
                :min="1885"
                :max="new Date().getFullYear() + 1"
                class="w-full border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                :class="errors.anio ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.anio" class="text-xs text-red-600 mt-1">{{ errors.anio }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Clasificación</label>
              <select
                v-model="form.datos.clasificacion"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              >
                <option value="" disabled>Seleccione</option>
                <option v-for="c in clasificaciones" :key="c" :value="c">{{ c }}</option>
              </select>
            </div>
          </div>
        </div>

        <div v-if="step === 3" class="space-y-4">
          <p class="text-sm text-gray-500 mb-2">Campos específicos para <strong>{{ form.tipo }}</strong></p>

          <div v-if="form.tipo === 'auto'" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">N° Puertas (2-7)</label>
              <input
                v-model.number="form.datos.numeroPuertas"
                type="number"
                min="2" max="7"
                class="w-full border rounded-lg px-3 py-2 text-sm"
                :class="errors.numeroPuertas ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.numeroPuertas" class="text-xs text-red-600 mt-1">{{ errors.numeroPuertas }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Cap. Maletero (litros)</label>
              <input
                v-model.number="form.datos.capacidadMaletero"
                type="number"
                min="0" max="1000"
                class="w-full border rounded-lg px-3 py-2 text-sm"
                :class="errors.capacidadMaletero ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.capacidadMaletero" class="text-xs text-red-600 mt-1">{{ errors.capacidadMaletero }}</p>
            </div>
          </div>

          <div v-if="form.tipo === 'motocicleta'" class="grid grid-cols-1 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Tipo de Motocicleta</label>
              <select
                v-model="form.datos.tipo"
                class="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                :class="errors.tipo ? 'border-red-500' : ''"
              >
                <option value="" disabled>Seleccione</option>
                <option v-for="t in tiposMoto" :key="t" :value="t">{{ t }}</option>
              </select>
              <p v-if="errors.tipo" class="text-xs text-red-600 mt-1">{{ errors.tipo }}</p>
            </div>
          </div>

          <div v-if="form.tipo === 'camioneta'" class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Cabina</label>
              <input
                v-model="form.datos.cabina"
                type="text"
                placeholder="ej. Cabina Doble"
                class="w-full border rounded-lg px-3 py-2 text-sm"
                :class="errors.cabina ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.cabina" class="text-xs text-red-600 mt-1">{{ errors.cabina }}</p>
            </div>
            <div>
              <label class="block text-xs font-medium text-gray-700 mb-1">Cap. Carga (kg, máx 10000)</label>
              <input
                v-model.number="form.datos.capacidadCarga"
                type="number"
                min="0" max="10000"
                class="w-full border rounded-lg px-3 py-2 text-sm"
                :class="errors.capacidadCarga ? 'border-red-500' : 'border-gray-300'"
              />
              <p v-if="errors.capacidadCarga" class="text-xs text-red-600 mt-1">{{ errors.capacidadCarga }}</p>
            </div>
          </div>
        </div>

        <div v-if="step === 4" class="space-y-3">
          <p class="text-sm text-gray-500 mb-2">Revise los datos antes de guardar</p>
          <div class="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
            <div class="flex justify-between"><span class="text-gray-500">Tipo:</span><span class="font-medium">{{ form.tipo }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Placa:</span><span class="font-medium">{{ form.datos.placa }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Marca:</span><span class="font-medium">{{ form.datos.marca }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Modelo:</span><span class="font-medium">{{ form.datos.modelo || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Color:</span><span class="font-medium">{{ form.datos.color || '—' }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Año:</span><span class="font-medium">{{ form.datos.anio }}</span></div>
            <div class="flex justify-between"><span class="text-gray-500">Clasificación:</span><span class="font-medium">{{ form.datos.clasificacion }}</span></div>
            <div v-if="form.datos.numeroPuertas != null" class="flex justify-between">
              <span class="text-gray-500">Puertas:</span><span class="font-medium">{{ form.datos.numeroPuertas }}</span>
            </div>
            <div v-if="form.datos.capacidadMaletero != null" class="flex justify-between">
              <span class="text-gray-500">Maletero:</span><span class="font-medium">{{ form.datos.capacidadMaletero }} L</span>
            </div>
            <div v-if="form.datos.tipo && form.tipo === 'motocicleta'" class="flex justify-between">
              <span class="text-gray-500">Tipo Moto:</span><span class="font-medium">{{ form.datos.tipo }}</span>
            </div>
            <div v-if="form.datos.cabina" class="flex justify-between">
              <span class="text-gray-500">Cabina:</span><span class="font-medium">{{ form.datos.cabina }}</span>
            </div>
            <div v-if="form.datos.capacidadCarga != null" class="flex justify-between">
              <span class="text-gray-500">Cap. Carga:</span><span class="font-medium">{{ form.datos.capacidadCarga }} kg</span>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-6">
          <div>
            <button
              v-if="step > 1"
              @click="step--"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Anterior
            </button>
          </div>
          <div class="flex gap-3">
            <button
              @click="cerrarModal"
              class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              v-if="step < 4"
              @click="siguientePaso"
              class="px-5 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Siguiente
            </button>
            <button
              v-if="step === 4"
              @click="guardar"
              :disabled="guardando"
              class="px-5 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {{ guardando ? 'Guardando...' : 'Guardar Vehículo' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirmState.visible"
      titulo="Eliminar Vehículo"
      :mensaje="`¿Estás seguro de eliminar el vehículo con placa '${confirmState.item?.placa}'?`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminacion"
      @cancel="confirmState.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { vehiculosService } from '@/services/vehiculos.service'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import DataTable from '@/components/common/DataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const perm = usePermission()
const toast = useToastStore()

const vehiculos = ref([])
const loading = ref(true)
const guardando = ref(false)
const showModal = ref(false)
const step = ref(1)

const clasificaciones = ['Electrico', 'Hibrido', 'Gasolina', 'Diesel']
const tiposMoto = ['Deportiva', 'Scooter', 'Motocross']

const form = reactive({
  tipo: '',
  datos: {
    placa: '',
    marca: '',
    modelo: '',
    color: '',
    anio: new Date().getFullYear(),
    clasificacion: '',
    numeroPuertas: null,
    capacidadMaletero: null,
    tipo: '',
    cabina: '',
    capacidadCarga: null,
  },
})

const errors = reactive({
  placa: '', marca: '', anio: '', numeroPuertas: '', capacidadMaletero: '',
  tipo: '', cabina: '', capacidadCarga: '',
})

const confirmState = ref({ visible: false, item: null })

const columns = [
  { key: 'placa', label: 'Placa' },
  { key: 'marca', label: 'Marca' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'tipo', label: 'Tipo' },
]

function limpiarErrores() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
}

function abrirModal() {
  step.value = 1
  form.tipo = ''
  form.datos.placa = ''
  form.datos.marca = ''
  form.datos.modelo = ''
  form.datos.color = ''
  form.datos.anio = new Date().getFullYear()
  form.datos.clasificacion = ''
  form.datos.numeroPuertas = null
  form.datos.capacidadMaletero = null
  form.datos.tipo = ''
  form.datos.cabina = ''
  form.datos.capacidadCarga = null
  limpiarErrores()
  showModal.value = true
}

function cerrarModal() {
  showModal.value = false
}

function siguientePaso() {
  limpiarErrores()
  let ok = true

  if (step.value === 1) {
    if (!form.tipo) { toast.warning('Seleccione un tipo de vehículo'); return }
    step.value = 2
    return
  }

  if (step.value === 2) {
    if (!form.datos.placa.trim()) { errors.placa = 'La placa es requerida'; ok = false }
    else if (form.tipo === 'motocicleta') {
      if (!/^[A-Z]{2}-\d{3}[A-Z]$/.test(form.datos.placa.toUpperCase())) { errors.placa = 'Formato inválido (ej. GG-420A)'; ok = false }
    } else {
      if (!/^[A-Z]{3}-\d{3,4}$/.test(form.datos.placa.toUpperCase())) { errors.placa = 'Formato inválido (ej. ABC-1234)'; ok = false }
    }

    if (!form.datos.marca.trim()) { errors.marca = 'La marca es requerida'; ok = false }

    if (!form.datos.anio || form.datos.anio < 1885 || form.datos.anio > new Date().getFullYear() + 1) {
      errors.anio = 'Año inválido'; ok = false
    }

    if (!ok) return
    step.value = 3
    return
  }

  if (step.value === 3) {
    if (form.tipo === 'auto') {
      if (!form.datos.numeroPuertas || form.datos.numeroPuertas < 2 || form.datos.numeroPuertas > 7) {
        errors.numeroPuertas = 'Debe ser entre 2 y 7'; ok = false
      }
      if (form.datos.capacidadMaletero == null || form.datos.capacidadMaletero < 0 || form.datos.capacidadMaletero > 1000) {
        errors.capacidadMaletero = 'Debe ser entre 0 y 1000'; ok = false
      }
    } else if (form.tipo === 'motocicleta') {
      if (!form.datos.tipo) { errors.tipo = 'Seleccione un tipo'; ok = false }
    } else if (form.tipo === 'camioneta') {
      if (!form.datos.cabina || form.datos.cabina.trim().length < 5) {
        errors.cabina = 'Mínimo 5 caracteres'; ok = false
      }
      if (form.datos.capacidadCarga == null || form.datos.capacidadCarga < 0 || form.datos.capacidadCarga > 10000) {
        errors.capacidadCarga = 'Debe ser entre 0 y 10000'; ok = false
      }
    }

    if (!ok) return
    step.value = 4
  }
}

async function guardar() {
  guardando.value = true
  try {
    const payload = {
      tipo: form.tipo,
      datos: { ...form.datos },
    }
    if (payload.datos.tipo === '') delete payload.datos.tipo

    await vehiculosService.crear(payload)
    toast.success(`Vehículo ${form.datos.placa.toUpperCase()} registrado`)
    cerrarModal()
    await cargar()
  } catch (err) {
    const msg = err.response?.data?.message || err.message || 'Error al crear vehículo'
    toast.error(msg)
  } finally {
    guardando.value = false
  }
}

async function cargar() {
  loading.value = true
  try {
    const res = await vehiculosService.listar()
    vehiculos.value = Array.isArray(res) ? res : res.data || []
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function solicitarEliminacion(item) {
  confirmState.value = { visible: true, item }
}

async function ejecutarEliminacion() {
  const item = confirmState.value.item
  confirmState.value.visible = false
  if (!item) return
  try {
    await vehiculosService.eliminar(item.id)
    toast.success(`Vehículo ${item.placa} eliminado`)
    await cargar()
  } catch (err) {
    console.error(err)
  }
}

onMounted(cargar)
</script>

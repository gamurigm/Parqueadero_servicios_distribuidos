<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800">Asignaciones de Vehículos</h3>
    </div>

    <DataTable :items="filteredList" :columns="columns" :loading="loading">
      <template #filters>
        <div class="flex flex-wrap gap-3 mb-4">
          <input
            v-model="filtroPropietario"
            type="text"
            placeholder="Filtrar por propietario..."
            class="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
          />
          <input
            v-model="filtroPlaca"
            type="text"
            placeholder="Filtrar por placa..."
            class="border border-gray-300 rounded px-3 py-1.5 text-sm w-40"
          />
          <button @click="limpiarFiltros" class="text-gray-500 hover:text-gray-700 text-sm px-2">
            Limpiar
          </button>
        </div>
      </template>

      <template #cell-propietario="{ item }">
        <span class="font-medium text-gray-800">
          {{ item.propietario?.nombreCompleto || item.propietario?.username || '—' }}
        </span>
      </template>

      <template #cell-vehiculos="{ item }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="v in item.vehiculos"
            :key="v.vehicleId"
            class="px-2 py-0.5 rounded text-xs font-medium"
            :class="v.estado === 1 ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-500'"
          >
            {{ v.placa || v.vehicleId }}
            <span v-if="v.tipo" class="opacity-70">({{ v.tipo }})</span>
          </span>
        </div>
      </template>

      <template #cell-activas="{ item }">
        <span class="text-sm" :class="item.activos > 0 ? 'text-green-600' : 'text-gray-400'">
          {{ item.activos }} / {{ item.totalVehiculos }}
        </span>
      </template>

      <template #actions="{ item }">
        <button
          @click="abrirGestion(item)"
          class="text-xs px-2.5 py-1 rounded bg-blue-50 text-blue-700 hover:bg-blue-100 font-medium"
        >
          Gestionar
        </button>
      </template>
    </DataTable>

    <div v-if="gestion.show" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4 p-6 max-h-[80vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-4">
          <h4 class="text-lg font-semibold text-gray-800">
            Vehículos de {{ gestion.propietario?.nombreCompleto || gestion.propietario?.username }}
          </h4>
          <button @click="cerrarGestion" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div class="space-y-2 mb-4">
          <p v-if="gestion.vehiculos.length === 0" class="text-sm text-gray-500 text-center py-4">
            Sin vehículos asignados
          </p>
          <div
            v-for="v in gestion.vehiculos"
            :key="v.vehicleId"
            class="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium text-sm">{{ v.placa || v.vehicleId }}</span>
              <span v-if="v.marca" class="text-xs text-gray-500">{{ v.marca }}</span>
              <span
                class="px-1.5 py-0.5 rounded text-xs font-medium"
                :class="v.estado === 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-500'"
              >
                {{ v.estado === 1 ? 'Activo' : 'Inactivo' }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="can('admin') || can('empleado')"
                @click="toggleEstadoVehiculo(gestion.userId, v.vehicleId, v.estado)"
                class="text-xs px-2 py-0.5 rounded font-medium"
                :class="v.estado === 1
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'"
              >
                {{ v.estado === 1 ? 'Desactivar' : 'Activar' }}
              </button>
              <button
                v-if="can('admin')"
                @click="confirmarEliminarVehiculo(gestion.userId, v.vehicleId, v.placa)"
                class="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium"
              >
                X
              </button>
            </div>
          </div>
        </div>

        <div v-if="can('admin') || can('empleado')" class="border-t pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Agregar vehículo</label>
          <div class="flex gap-2 mb-2">
            <select v-model="nuevoVehiculoId" class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="" disabled>Seleccione un vehículo</option>
              <option v-for="v in vehiculosDisponibles" :key="v.id" :value="v.id">
                {{ v.placa }} — {{ v.marca }} {{ v.modelo || '' }} ({{ v.tipo || '—' }})
              </option>
            </select>
            <button
              @click="agregarVehiculo"
              :disabled="!nuevoVehiculoId || saving"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              Agregar
            </button>
          </div>
          <input
            v-model="nuevaDescripcion"
            type="text"
            maxlength="500"
            placeholder="Descripción (opcional)"
            class="w-full border border-gray-300 rounded px-3 py-2 text-sm"
          />
          <p v-if="gestion.error" class="text-red-500 text-xs mt-2">{{ gestion.error }}</p>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirm.visible"
      titulo="Eliminar Vehículo"
      :mensaje="`¿Eliminar la asignación del vehículo '${confirm.vehiculoPlaca}'?`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminarVehiculo"
      @cancel="confirm.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { asignacionesService } from '@/services/asignaciones.service'
import { vehiculosService } from '@/services/vehiculos.service'
import DataTable from '@/components/common/DataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const auth = useAuthStore()

const loading = ref(false)
const saving = ref(false)

const asignaciones = ref([])
const vehiculos = ref([])

const filtroPropietario = ref('')
const filtroPlaca = ref('')

const nuevoVehiculoId = ref('')
const nuevaDescripcion = ref('')

const gestion = ref({ show: false, userId: '', propietario: null, vehiculos: [], error: '' })
const confirm = ref({ visible: false, userId: '', vehicleId: '', vehiculoPlaca: '' })

const columns = [
  { key: 'propietario', label: 'Propietario' },
  { key: 'vehiculos', label: 'Vehículos' },
  { key: 'activas', label: 'Activas' },
]

const vehiculosDisponibles = computed(() => {
  if (!gestion.value.userId) return []
  const idsAsignados = new Set(gestion.value.vehiculos.map((v) => v.vehicleId))
  return vehiculos.value.filter((v) => !idsAsignados.has(v.id))
})

const filteredList = computed(() => {
  let list = groupByUsuario(asignaciones.value)
  if (filtroPropietario.value) {
    const q = filtroPropietario.value.toLowerCase()
    list = list.filter((g) => {
      const name = (g.propietario?.nombreCompleto || g.propietario?.username || '').toLowerCase()
      return name.includes(q)
    })
  }
  if (filtroPlaca.value) {
    const q = filtroPlaca.value.toLowerCase()
    list = list.filter((g) => g.vehiculos.some((v) => (v.placa || '').toLowerCase().includes(q)))
  }
  return list
})

function can(rol) {
  return auth.roles.includes('super_user') || auth.roles.includes(rol)
}

function groupByUsuario(flat) {
  const map = new Map()
  for (const a of flat) {
    const key = a.userId
    if (!map.has(key)) {
      map.set(key, {
        userId: key,
        propietario: a.propietario || { username: key },
        vehiculos: [],
        totalVehiculos: 0,
        activos: 0,
      })
    }
    const g = map.get(key)
    g.vehiculos.push({
      vehicleId: a.vehicleId,
      placa: a.vehiculo?.placa || null,
      marca: a.vehiculo?.marca || null,
      modelo: a.vehiculo?.modelo || null,
      tipo: a.vehiculo?.tipo || null,
      estado: a.estado,
      descripcion: a.descripcion,
      fechaAsignacion: a.fechaAsignacion,
    })
    g.totalVehiculos++
    if (a.estado === 1) g.activos++
  }
  return Array.from(map.values())
}

function limpiarFiltros() {
  filtroPropietario.value = ''
  filtroPlaca.value = ''
}

async function cargarDatos() {
  loading.value = true
  try {
    const [asignacionesRes, vehiculosRes] = await Promise.all([
      asignacionesService.listarAsignacionesVehiculos(),
      vehiculosService.listar(),
    ])
    asignaciones.value = Array.isArray(asignacionesRes) ? asignacionesRes : asignacionesRes.data || []
    vehiculos.value = Array.isArray(vehiculosRes) ? vehiculosRes : vehiculosRes.data || []
  } catch (err) {
    console.error('Error cargando datos:', err)
  } finally {
    loading.value = false
  }
}

function abrirGestion(item) {
  gestion.value = {
    show: true,
    userId: item.userId,
    propietario: item.propietario,
    vehiculos: [...item.vehiculos],
    error: '',
  }
  nuevoVehiculoId.value = ''
  nuevaDescripcion.value = ''
}

function cerrarGestion() {
  gestion.value.show = false
}

async function agregarVehiculo() {
  if (!nuevoVehiculoId.value || !gestion.value.userId) return
  saving.value = true
  gestion.value.error = ''
  try {
    const payload = { userId: gestion.value.userId, vehicleId: nuevoVehiculoId.value }
    if (nuevaDescripcion.value) payload.descripcion = nuevaDescripcion.value
    await asignacionesService.crearAsignacion(payload)
    nuevoVehiculoId.value = ''
    nuevaDescripcion.value = ''
    await cargarDatos()
    const updated = asignaciones.value.filter((a) => a.userId === gestion.value.userId)
    const grouped = groupByUsuario(updated)
    if (grouped.length > 0) {
      gestion.value.vehiculos = grouped[0].vehiculos
    }
  } catch (err) {
    gestion.value.error = err.response?.data?.message || err.message || 'Error al asignar vehículo'
  } finally {
    saving.value = false
  }
}

async function toggleEstadoVehiculo(userId, vehicleId, estado) {
  saving.value = true
  try {
    await asignacionesService.actualizarAsignacion(userId, vehicleId, {
      estado: estado === 1 ? 0 : 1,
    })
    await cargarDatos()
    const updated = asignaciones.value.filter((a) => a.userId === gestion.value.userId)
    const grouped = groupByUsuario(updated)
    if (grouped.length > 0) {
      gestion.value.vehiculos = grouped[0].vehiculos
    }
  } catch (err) {
    console.error('Error cambiando estado:', err)
  } finally {
    saving.value = false
  }
}

function confirmarEliminarVehiculo(userId, vehicleId, placa) {
  confirm.value = { visible: true, userId, vehicleId, vehiculoPlaca: placa || vehicleId }
}

async function ejecutarEliminarVehiculo() {
  confirm.value.visible = false
  saving.value = true
  try {
    await asignacionesService.eliminarAsignacion(confirm.value.userId, confirm.value.vehicleId)
    await cargarDatos()
    const updated = asignaciones.value.filter((a) => a.userId === gestion.value.userId)
    const grouped = groupByUsuario(updated)
    if (grouped.length > 0) {
      gestion.value.vehiculos = grouped[0].vehiculos
    } else {
      gestion.value.vehiculos = []
    }
  } catch (err) {
    console.error('Error eliminando asignación:', err)
  } finally {
    saving.value = false
  }
}

onMounted(cargarDatos)
</script>

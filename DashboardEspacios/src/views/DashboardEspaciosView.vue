<template>
  <div class="dashboard-espacios-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Dashboard de Espacios en Tiempo Real</h2>
        <p class="page-subtitle">Monitoreo continuo de estacionamientos y estado por zonas</p>
      </div>
      <div class="header-actions">
        <span class="connection-badge" :class="espaciosStore.connected ? 'connected' : 'disconnected'">
          <span class="status-dot"></span>
          {{ espaciosStore.connected ? 'SSE Conectado (Tiempo Real)' : 'SSE Desconectado' }}
        </span>
        <button @click="espaciosStore.fetchEspacios()" class="btn btn-refresh">
          Refrescar
        </button>
        <button v-if="puedeGestionarEspacios" @click="abrirModalCrearEspacio" class="btn btn-primary btn-sm">
          + Nuevo Espacio
        </button>
      </div>
    </div>

    <!-- STATS CARDS -->
    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon">🅿️</div>
        <div>
          <div class="stat-num">{{ espaciosStore.espacios.length }}</div>
          <div class="stat-lbl">Total Espacios</div>
        </div>
      </div>
      <div class="stat-card stat-disponible">
        <div class="stat-icon">✅</div>
        <div>
          <div class="stat-num">{{ countEstado('DISPONIBLE') }}</div>
          <div class="stat-lbl">Disponibles</div>
        </div>
      </div>
      <div class="stat-card stat-ocupado">
        <div class="stat-icon">🔴</div>
        <div>
          <div class="stat-num">{{ countEstado('OCUPADO') }}</div>
          <div class="stat-lbl">Ocupados</div>
        </div>
      </div>
      <div class="stat-card stat-reservado">
        <div class="stat-icon">🟡</div>
        <div>
          <div class="stat-num">{{ countEstado('RESERVADO') }}</div>
          <div class="stat-lbl">Reservados</div>
        </div>
      </div>
      <div class="stat-card stat-mant">
        <div class="stat-icon">🔧</div>
        <div>
          <div class="stat-num">{{ countEstado('MANTENIMIENTO') }}</div>
          <div class="stat-lbl">Mantenimiento</div>
        </div>
      </div>
    </div>

    <!-- ESPACIOS Y ZONAS -->
    <section class="section-card">
      <div class="section-header">
        <div class="flex-row gap-3 items-center">
          <h3 class="section-title">🏢 Estado por Zonas</h3>
          <div class="section-badge">{{ espaciosAgrupados.length }} zonas activas</div>
        </div>

        <div class="estado-filters">
          <button
            v-for="f in estadoFiltros"
            :key="f.val"
            :class="['filter-btn', filtroEstado === f.val ? 'filter-btn-active' : '']"
            @click="filtroEstado = filtroEstado === f.val ? null : f.val"
          >
            <span>{{ f.icon }}</span> {{ f.label }}
          </button>
        </div>
      </div>

      <LoadingSpinner v-if="espaciosStore.loading && espaciosStore.espacios.length === 0" />

      <div v-else-if="espaciosFiltrados.length === 0" class="empty-state">
        <div class="empty-icon">🅿️</div>
        <p>No hay espacios registrados o que coincidan con el filtro</p>
      </div>

      <div v-else class="zonas-container">
        <div v-for="grupo in espaciosAgrupados" :key="grupo.zonaId" class="zona-group">
          <div class="zona-group-header">
            <span class="zona-group-dot" :style="{ background: colorZona(grupo.zonaId) }"></span>
            <span class="zona-group-name">{{ grupo.nombreZona }}</span>
            <span class="zona-group-count">{{ grupo.espacios.length }} espacios</span>
          </div>

          <div class="espacios-grid">
            <div
              v-for="esp in grupo.espacios"
              :key="esp.id"
              :class="['espacio-card', `espacio-${(esp.estado || '').toLowerCase()}`]"
            >
              <div class="espacio-estado-bar"></div>
              <div class="espacio-body">
                <div class="espacio-codigo">{{ esp.codigo || 'S/C' }}</div>
                <div class="espacio-tipo">{{ tipoIcon(esp.tipo || esp.tipoEspacio) }} {{ esp.tipo || esp.tipoEspacio || 'AUTO' }}</div>
                <div :class="['espacio-badge', `badge-${(esp.estado || '').toLowerCase()}`]">
                  {{ esp.estado || 'DISPONIBLE' }}
                </div>
                <div v-if="puedeCambiarEstado" class="estado-actions" @click.stop>
                  <select
                    :value="esp.estado || 'DISPONIBLE'"
                    @change="cambiarEstadoEspacio(esp, ($event.target).value)"
                    class="estado-select"
                    title="Cambiar estado"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
                <div v-if="puedeGestionarEspacios" class="espacio-acciones" @click.stop>
                  <button @click="abrirModalEditarEspacio(esp)" class="btn-icon btn-icon-edit" title="Editar espacio">✏️</button>
                  <button @click="solicitarEliminarEspacio(esp)" class="btn-icon btn-icon-delete" title="Eliminar espacio">🗑️</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <footer class="dashboard-footer">
      <span>Última actualización SSE: </span>
      <span v-if="espaciosStore.lastUpdate" class="font-semibold">{{ formatDate(espaciosStore.lastUpdate) }}</span>
      <span v-else>--</span>
    </footer>

    <div v-if="modalEspacio.visible" class="modal-overlay" @click.self="modalEspacio.visible = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ modalEspacio.editando ? 'Editar Espacio' : 'Nuevo Espacio' }}</h3>
          <button @click="modalEspacio.visible = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Zona *</label>
            <select v-model="formEspacio.idZona" class="form-input" required>
              <option value="" disabled>Seleccione una zona</option>
              <option v-for="z in zonas" :key="z.id" :value="z.id">{{ z.nombre }} ({{ z.codigo }})</option>
            </select>
          </div>
          <div class="form-group">
            <label>Descripción</label>
            <input v-model="formEspacio.descripcion" type="text" placeholder="Espacio principal" class="form-input" />
          </div>
          <div class="form-group">
            <label>Tipo de Espacio</label>
            <select v-model="formEspacio.tipoEspacio" class="form-input">
              <option value="AUTO">Auto</option>
              <option value="MOTO">Moto</option>
              <option value="BUSETA">Buseta</option>
              <option value="DISCAPACITADOS">Discapacitados</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="modalEspacio.visible = false" class="btn btn-ghost">Cancelar</button>
          <button @click="guardarEspacio" :disabled="guardandoEspacio" class="btn btn-primary">
            {{ guardandoEspacio ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirmDelete.visible"
      titulo="Eliminar Espacio"
      :mensaje="`¿Estás seguro de eliminar el espacio '${confirmDelete.item?.codigo || confirmDelete.item?.id}'?`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminarEspacio"
      @cancel="confirmDelete.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEspaciosStore } from '@/stores/espacios'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { zonasService } from '@/services/zonas.service'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const espaciosStore = useEspaciosStore()
const authStore = useAuthStore()
const toast = useToastStore()
const filtroEstado = ref(null)

const estadoFiltros = [
  { val: 'DISPONIBLE', label: 'Disponible', icon: '✅' },
  { val: 'OCUPADO', label: 'Ocupado', icon: '🔴' },
  { val: 'RESERVADO', label: 'Reservado', icon: '🟡' },
  { val: 'MANTENIMIENTO', label: 'Mant.', icon: '🔧' },
]

const ZONA_COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316']

function colorZona(zonaId) {
  let hash = 0
  const str = String(zonaId || 'default')
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const idx = Math.abs(hash) % ZONA_COLORS.length
  return ZONA_COLORS[idx]
}

function tipoIcon(tipo) {
  const m = { AUTO: '🚗', MOTO: '🏍️', MOTOCICLETA: '🏍️', BUSETA: '🚌', DISCAPACITADOS: '♿', DISCAPACITADO: '♿' }
  return m[tipo?.toUpperCase()] || '🚗'
}

function countEstado(estado) {
  return espaciosStore.espacios.filter((e) => (e.estado || '').toUpperCase() === estado).length
}

const espaciosFiltrados = computed(() => {
  let list = espaciosStore.espacios
  if (filtroEstado.value) {
    list = list.filter((e) => (e.estado || '').toUpperCase() === filtroEstado.value)
  }
  return list
})

const espaciosAgrupados = computed(() => {
  const grupos = {}
  for (const esp of espaciosFiltrados.value) {
    const key = esp.idZona || esp.zona_id || esp.nombreZona || 'sin-zona'
    const nombre = esp.nombreZona || esp.zonaNombre || 'Zona Principal'
    if (!grupos[key]) {
      grupos[key] = {
        zonaId: key,
        nombreZona: nombre,
        espacios: [],
      }
    }
    grupos[key].espacios.push(esp)
  }
  return Object.values(grupos)
})

function formatDate(date) {
  return new Date(date).toLocaleString('es-ES', { hour12: false })
}

const puedeCambiarEstado = computed(() => {
  return authStore.roles.some((r) => ['super_user', 'admin', 'encargado_zona'].includes(r))
})

async function cambiarEstadoEspacio(esp, nuevoEstado) {
  if (esp.estado === nuevoEstado) return
  try {
    await zonasService.cambiarEstado(esp.id, nuevoEstado)
    await espaciosStore.fetchEspacios()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Error al cambiar estado del espacio')
  }
}

const puedeGestionarEspacios = computed(() => {
  return authStore.roles.some((r) => ['super_user', 'admin', 'encargado_zona'].includes(r))
})

const zonas = ref([])
const guardandoEspacio = ref(false)
const modalEspacio = ref({ visible: false, editando: false, espacioId: null })
const formEspacio = ref({ idZona: '', descripcion: '', tipoEspacio: 'AUTO' })
const confirmDelete = ref({ visible: false, item: null })

async function cargarZonas() {
  try {
    const data = await zonasService.listarZonas()
    zonas.value = Array.isArray(data) ? data : (data?.content || [])
  } catch (err) {
    console.error('Error cargando zonas:', err)
  }
}

function abrirModalCrearEspacio() {
  modalEspacio.value = { visible: true, editando: false, espacioId: null }
  formEspacio.value = { idZona: '', descripcion: '', tipoEspacio: 'AUTO' }
  cargarZonas()
}

function abrirModalEditarEspacio(esp) {
  modalEspacio.value = { visible: true, editando: true, espacioId: esp.id }
  formEspacio.value = {
    idZona: esp.idZona || esp.zona_id || '',
    descripcion: esp.descripcion || '',
    tipoEspacio: esp.tipoEspacio || esp.tipo || 'AUTO',
  }
  cargarZonas()
}

async function guardarEspacio() {
  if (!formEspacio.value.idZona) {
    toast.error('Debe seleccionar una zona')
    return
  }
  guardandoEspacio.value = true
  try {
    if (modalEspacio.value.editando) {
      await zonasService.actualizarEspacio(modalEspacio.value.espacioId, formEspacio.value)
      toast.success('Espacio actualizado correctamente')
    } else {
      await zonasService.crearEspacio(formEspacio.value)
      toast.success('Espacio creado correctamente')
    }
    modalEspacio.value.visible = false
    await espaciosStore.fetchEspacios()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Error al guardar el espacio')
  } finally {
    guardandoEspacio.value = false
  }
}

function solicitarEliminarEspacio(esp) {
  confirmDelete.value = { visible: true, item: esp }
}

async function ejecutarEliminarEspacio() {
  const esp = confirmDelete.value.item
  confirmDelete.value.visible = false
  if (!esp) return
  try {
    await zonasService.eliminarEspacio(esp.id)
    toast.success(`Espacio '${esp.codigo || esp.id}' eliminado`)
    await espaciosStore.fetchEspacios()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Error al eliminar el espacio')
  }
}

onMounted(() => {
  espaciosStore.iniciar()
})

onUnmounted(() => {
  espaciosStore.detener()
})
</script>

<style scoped>
.dashboard-espacios-page {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}
.page-title {
  font-size: 1.375rem;
  font-weight: 700;
  color: #111827;
  margin: 0;
}
.page-subtitle {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0.25rem 0 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.connection-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.4rem 0.875rem;
  border-radius: 99px;
  background: #f3f4f6;
  color: #374151;
}
.connection-badge.connected {
  background: #d1fae5;
  color: #065f46;
}
.connection-badge.disconnected {
  background: #fee2e2;
  color: #991b1b;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}
.connected .status-dot {
  background: #10b981;
  box-shadow: 0 0 0 2px #a7f3d0;
}
.disconnected .status-dot {
  background: #ef4444;
}

.btn-refresh {
  background: #f3f4f6;
  color: #374151;
  border: none;
  padding: 0.45rem 0.875rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.btn-refresh:hover {
  background: #e5e7eb;
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
}
.stat-card {
  display: flex;
  align-items: center;
  gap: 0.875rem;
  padding: 1rem 1.25rem;
  border-radius: 1rem;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border: 1px solid #f3f4f6;
  transition: transform 0.18s;
}
.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.stat-icon {
  font-size: 1.75rem;
}
.stat-num {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
}
.stat-lbl {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 2px;
}
.stat-total .stat-num {
  color: #6366f1;
}
.stat-disponible .stat-num {
  color: #10b981;
}
.stat-ocupado .stat-num {
  color: #ef4444;
}
.stat-reservado .stat-num {
  color: #f59e0b;
}
.stat-mant .stat-num {
  color: #64748b;
}

.section-card {
  background: #fff;
  border-radius: 1.125rem;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.07);
  border: 1px solid #f0f0f0;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 1.25rem;
}
.section-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
}
.section-badge {
  font-size: 0.75rem;
  background: #f3f4f6;
  color: #6b7280;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
  font-weight: 500;
}
.flex-row {
  display: flex;
}
.gap-3 {
  gap: 0.75rem;
}
.items-center {
  align-items: center;
}

.estado-filters {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.75rem;
  font-weight: 500;
  padding: 0.3rem 0.75rem;
  border-radius: 99px;
  border: 1px solid #e5e7eb;
  background: #fff;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.15s;
}
.filter-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}
.filter-btn-active {
  background: #6366f1;
  color: #fff;
  border-color: #6366f1;
}

.zona-group {
  margin-bottom: 1.5rem;
}
.zona-group-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f3f4f6;
}
.zona-group-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  flex-shrink: 0;
}
.zona-group-name {
  font-weight: 700;
  color: #1f2937;
  font-size: 0.95rem;
}
.zona-group-count {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-left: auto;
  background: #f3f4f6;
  padding: 0.15rem 0.6rem;
  border-radius: 99px;
}

.espacios-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(110px, 1fr));
  gap: 0.75rem;
}
.espacio-card {
  position: relative;
  border-radius: 0.875rem;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.07);
  transition: transform 0.18s, box-shadow 0.18s;
}
.espacio-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
}

.espacio-estado-bar {
  height: 4px;
}
.espacio-disponible .espacio-estado-bar {
  background: linear-gradient(90deg, #10b981, #34d399);
}
.espacio-ocupado .espacio-estado-bar {
  background: linear-gradient(90deg, #ef4444, #f87171);
}
.espacio-reservado .espacio-estado-bar {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}
.espacio-mantenimiento .espacio-estado-bar {
  background: linear-gradient(90deg, #64748b, #94a3b8);
}

.espacio-disponible {
  background: #f0fdf4;
  border-color: #bbf7d0;
}
.espacio-ocupado {
  background: #fff1f2;
  border-color: #fecaca;
}
.espacio-reservado {
  background: #fffbeb;
  border-color: #fde68a;
}
.espacio-mantenimiento {
  background: #f8fafc;
  border-color: #e2e8f0;
}

.espacio-body {
  padding: 0.625rem 0.5rem 0.75rem;
  text-align: center;
}
.espacio-codigo {
  font-size: 0.75rem;
  font-weight: 700;
  color: #111827;
  letter-spacing: 0.02em;
}
.espacio-tipo {
  font-size: 0.65rem;
  color: #6b7280;
  margin: 0.2rem 0 0.4rem;
}
.espacio-badge {
  display: inline-block;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 0.15rem 0.5rem;
  border-radius: 99px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.badge-disponible {
  background: #d1fae5;
  color: #065f46;
}
.badge-ocupado {
  background: #fee2e2;
  color: #991b1b;
}
.badge-reservado {
  background: #fef3c7;
  color: #92400e;
}
.badge-mantenimiento {
  background: #e2e8f0;
  color: #475569;
}

.empty-state {
  text-align: center;
  padding: 2.5rem 1rem;
  color: #9ca3af;
}
.empty-icon {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.dashboard-footer {
  font-size: 0.8rem;
  color: #6b7280;
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
}

.estado-actions {
  margin-top: 0.4rem;
}

.estado-select {
  width: 100%;
  font-size: 0.6rem;
  padding: 0.15rem 0.25rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
  background: white;
  cursor: pointer;
  color: #374151;
}

.estado-select:focus {
  outline: none;
  border-color: #6366f1;
  box-shadow: 0 0 0 1px #6366f1;
}

.btn-primary.btn-sm {
  padding: 0.4rem 0.75rem;
  font-size: 0.75rem;
  background: #6366f1;
  color: #fff;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  font-weight: 600;
}
.btn-primary.btn-sm:hover {
  background: #4f46e5;
}

.espacio-acciones {
  display: flex;
  gap: 0.2rem;
  justify-content: center;
  margin-top: 0.3rem;
}
.btn-icon {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 0.25rem;
  padding: 0.1rem 0.25rem;
  cursor: pointer;
  font-size: 0.65rem;
  line-height: 1;
}
.btn-icon-edit { color: #6366f1; }
.btn-icon-edit:hover { background: #eef2ff; border-color: #6366f1; }
.btn-icon-delete { color: #ef4444; }
.btn-icon-delete:hover { background: #fef2f2; border-color: #ef4444; }

.modal-overlay { position: fixed; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.25); padding: 1rem; }
.modal-box { background: #fff; border-radius: 0.75rem; width: 100%; max-width: 480px; max-height: 90vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #e2e8f0; }
.modal-header h3 { margin: 0; font-size: 1.1rem; font-weight: 600; }
.modal-close { border: none; background: none; font-size: 1.25rem; cursor: pointer; color: #94a3b8; }
.modal-body { padding: 1.5rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1rem 1.5rem; border-top: 1px solid #e2e8f0; }
.form-group { margin-bottom: 1rem; }
.form-group label { display: block; font-size: 0.8rem; font-weight: 500; color: #374151; margin-bottom: 0.35rem; }
.form-input { width: 100%; padding: 0.5rem 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.875rem; transition: border-color 0.15s; box-sizing: border-box; }
.form-input:focus { outline: none; border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99,102,241,0.15); }
.btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; border: none; }
.btn-ghost { background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }
</style>

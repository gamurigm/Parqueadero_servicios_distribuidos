<template>
  <div class="zonas-page">
    <div class="page-header">
      <div>
        <h2 class="page-title">Gestión de Zonas</h2>
        <p class="page-subtitle">Administra las zonas y configura la capacidad del parqueadero</p>
      </div>
      <div class="header-actions" v-if="perm.isAdmin()">
        <button @click="abrirModalZonaCrear" class="btn btn-primary">
          + Nueva Zona
        </button>
      </div>
    </div>

    <div class="stats-row">
      <div class="stat-card stat-total">
        <div class="stat-icon">🏢</div>
        <div>
          <div class="stat-num">{{ zonas.length }}</div>
          <div class="stat-lbl">Zonas Totales</div>
        </div>
      </div>
      <div class="stat-card stat-disponible">
        <div class="stat-icon">✅</div>
        <div>
          <div class="stat-num">{{ zonasActivas }}</div>
          <div class="stat-lbl">Zonas Activas</div>
        </div>
      </div>
      <div class="stat-card stat-ocupado">
        <div class="stat-icon">📊</div>
        <div>
          <div class="stat-num">{{ capacidadTotal }}</div>
          <div class="stat-lbl">Capacidad Total</div>
        </div>
      </div>
      <div class="stat-card stat-reservado">
        <div class="stat-icon">🟢</div>
        <div>
          <div class="stat-num">{{ espaciosLibres }}</div>
          <div class="stat-lbl">Espacios Libres</div>
        </div>
      </div>
    </div>

    <section class="section-card">
      <div class="section-header">
        <h3 class="section-title">Zonas Registradas</h3>
        <div class="section-badge">{{ zonas.length }} zonas</div>
      </div>

      <LoadingSpinner v-if="loading" />

      <div v-else-if="zonas.length === 0" class="empty-state">
        <div class="empty-icon">🏗️</div>
        <p>No hay zonas registradas</p>
      </div>

      <div v-else class="zonas-grid">
        <div v-for="zona in zonas" :key="zona.id" class="zona-card">
          <div class="zona-card-header">
            <span class="zona-dot" :style="{ background: colorZona(zona) }"></span>
            <div class="zona-card-title">
              <span class="zona-nombre">{{ zona.nombre }}</span>
              <span class="zona-ubicacion">{{ zona.ubicacion || zona.descripcion || '—' }}</span>
            </div>
            <span :class="['zona-estado-pill', zona.activo ? 'pill-activa' : 'pill-inactiva']">
              {{ zona.activo ? 'Activa' : 'Inactiva' }}
            </span>
          </div>

          <div class="zona-card-body">
            <div class="zona-metrics">
              <div class="metric">
                <span class="metric-label">Tipo</span>
                <span class="metric-value">{{ zona.tipoZona || 'REGULAR' }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Capacidad</span>
                <span class="metric-value">{{ zona.capacidad || '—' }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Espacios</span>
                <span class="metric-value">{{ espaciosPorZona(zona.id).length }}</span>
              </div>
              <div class="metric">
                <span class="metric-label">Ocupados</span>
                <span class="metric-value">{{ ocupadosPorZona(zona.id) }}</span>
              </div>
            </div>

            <div class="ocupacion-section">
              <div class="ocupacion-header">
                <span class="ocupacion-label">Ocupación</span>
                <span class="ocupacion-pct" :style="{ color: colorOcupacion(pctOcupacion(zona.id, zona.capacidad)) }">
                  {{ pctOcupacion(zona.id, zona.capacidad) }}%
                </span>
              </div>
              <div class="ocupacion-bar">
                <div class="ocupacion-fill"
                     :style="{ width: pctOcupacion(zona.id, zona.capacidad) + '%', background: colorOcupacion(pctOcupacion(zona.id, zona.capacidad)) }">
                </div>
              </div>
            </div>

            <div class="zona-espacios-preview">
              <span class="preview-label">Espacios ({{ espaciosPorZona(zona.id).length }})</span>
              <div class="preview-dots">
                <span v-for="esp in espaciosPorZona(zona.id).slice(0, 8)" :key="esp.id"
                      :class="['dot', `dot-${(esp.estado || '').toLowerCase()}`]"
                      :title="`${esp.codigo || 'S/C'}: ${esp.estado}`">
                </span>
                <span v-if="espaciosPorZona(zona.id).length > 8" class="dot-more">
                  +{{ espaciosPorZona(zona.id).length - 8 }}
                </span>
              </div>
            </div>
          </div>

          <div v-if="perm.isAdmin()" class="zona-card-footer">
            <button @click="abrirModalZonaEditar(zona)" class="btn-action btn-edit">✏️ Editar</button>
            <button @click="solicitarEliminarZona(zona)" class="btn-action btn-delete">🗑️ Eliminar</button>
          </div>
        </div>
      </div>
    </section>

    <div v-if="mostrarModalZona" class="modal-overlay" @click.self="mostrarModalZona = false">
      <div class="modal-box">
        <div class="modal-header">
          <h3>{{ editandoZonaId ? 'Editar Zona' : 'Nueva Zona' }}</h3>
          <button @click="mostrarModalZona = false" class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label>Nombre *</label>
            <input v-model="formZona.nombre" type="text" placeholder="Zona Norte"
                   :class="['form-input', val.errors.value.nombre ? 'input-error' : '']" />
            <p v-if="val.errors.value.nombre" class="form-err">{{ val.errors.value.nombre }}</p>
          </div>
          <div class="form-group">
            <label>Descripción / Ubicación *</label>
            <input v-model="formZona.ubicacion" type="text" placeholder="Sector norte del estacionamiento"
                   :class="['form-input', val.errors.value.ubicacion ? 'input-error' : '']" />
            <p v-if="val.errors.value.ubicacion" class="form-err">{{ val.errors.value.ubicacion }}</p>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Tipo</label>
              <select v-model="formZona.tipoZona" class="form-input">
                <option value="REGULAR">REGULAR</option>
                <option value="VIP">VIP</option>
                <option value="EXTERNO">EXTERNO</option>
                <option value="INTERNO">INTERNO</option>
                <option value="PREFERENCIAL">PREFERENCIAL</option>
              </select>
            </div>
            <div class="form-group">
              <label>Capacidad</label>
              <input v-model.number="formZona.capacidad" type="number" min="1" max="100"
                     class="form-input" placeholder="20" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="mostrarModalZona = false" class="btn btn-ghost">Cancelar</button>
          <button @click="guardarZona" :disabled="guardando" class="btn btn-primary">
            {{ guardando ? 'Guardando…' : 'Guardar' }}
          </button>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirmState.visible"
      titulo="Eliminar Zona"
      :mensaje="`¿Estás seguro de eliminar la zona '${confirmState.item?.nombre}'?`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminacion"
      @cancel="confirmState.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { zonasService } from '@/services/zonas.service'
import { usePermission } from '@/composables/usePermission'
import { useToastStore } from '@/stores/toast'
import { useFormValidation } from '@/composables/useFormValidation'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const perm = usePermission()
const toast = useToastStore()
const val = useFormValidation()

const zonas = ref([])
const espacios = ref([])
const loading = ref(true)
const guardando = ref(false)

const mostrarModalZona = ref(false)
const editandoZonaId = ref(null)
const formZona = ref({ nombre: '', ubicacion: '', tipoZona: 'REGULAR', capacidad: 10 })

const confirmState = ref({ visible: false, item: null })

const ZONA_COLORS = ['#6366f1','#0ea5e9','#10b981','#f59e0b','#ec4899','#8b5cf6','#14b8a6','#f97316']

function colorZona(zona) {
  const idx = zonas.value.findIndex(z => z.id === zona.id)
  return ZONA_COLORS[idx % ZONA_COLORS.length]
}

const zonasActivas = computed(() => zonas.value.filter(z => z.activo).length)
const capacidadTotal = computed(() => zonas.value.reduce((acc, z) => acc + (Number(z.capacidad) || 0), 0))
const espaciosLibres = computed(() => espacios.value.filter(e => e.estado === 'DISPONIBLE').length)

function espaciosPorZona(zonaId) {
  return espacios.value.filter(e => e.idZona === zonaId)
}

function ocupadosPorZona(zonaId) {
  return espaciosPorZona(zonaId).filter(e => e.estado === 'OCUPADO').length
}

function pctOcupacion(zonaId, capacidad) {
  if (!capacidad) return 0
  const ocupados = ocupadosPorZona(zonaId)
  return Math.round((ocupados / capacidad) * 100)
}

function colorOcupacion(pct) {
  if (pct < 50) return '#10b981'
  if (pct < 80) return '#f59e0b'
  return '#ef4444'
}

async function cargar() {
  loading.value = true
  try {
    zonas.value = await zonasService.listarZonas()
    espacios.value = await zonasService.listarEspacios()
  } catch (err) {
    console.error(err)
  } finally {
    loading.value = false
  }
}

function abrirModalZonaCrear() {
  val.clearErrors()
  editandoZonaId.value = null
  formZona.value = { nombre: '', ubicacion: '', tipoZona: 'REGULAR', capacidad: 10 }
  mostrarModalZona.value = true
}

function abrirModalZonaEditar(item) {
  val.clearErrors()
  editandoZonaId.value = item.id
  formZona.value = { nombre: item.nombre, ubicacion: item.ubicacion || item.descripcion || '', tipoZona: item.tipoZona || 'REGULAR', capacidad: item.capacidad || 10 }
  mostrarModalZona.value = true
}

async function guardarZona() {
  val.clearErrors()
  let valid = true
  if (!val.validateRequired('nombre', formZona.value.nombre, 'Nombre de la zona')) valid = false
  if (!val.validateRequired('ubicacion', formZona.value.ubicacion, 'Descripción/Ubicación')) valid = false
  if (!valid) return
  guardando.value = true
  try {
    if (editandoZonaId.value) {
      await zonasService.actualizarZona(editandoZonaId.value, formZona.value)
      toast.success('Zona actualizada correctamente')
    } else {
      await zonasService.crearZona(formZona.value)
      toast.success('Zona creada correctamente')
    }
    mostrarModalZona.value = false
    await cargar()
  } catch (err) { console.error(err) }
  finally { guardando.value = false }
}

function solicitarEliminarZona(item) { confirmState.value = { visible: true, item } }

async function ejecutarEliminacion() {
  const item = confirmState.value.item
  confirmState.value.visible = false
  if (!item) return
  try {
    await zonasService.eliminarZona(item.id)
    toast.success(`Zona '${item.nombre}' eliminada`)
    await cargar()
  } catch (err) { console.error(err) }
}

onMounted(cargar)
</script>

<style scoped>
.zonas-page { display: flex; flex-direction: column; gap: 1.5rem; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.page-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin: 0; }
.page-subtitle { font-size: 0.875rem; color: #64748b; margin-top: 0.25rem; }
.btn-primary { background: #6366f1; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; }
.btn-primary:hover { background: #4f46e5; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 1rem; }
.stat-card { display: flex; align-items: center; gap: 1rem; background: #fff; border-radius: 0.75rem; padding: 1rem 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
.stat-icon { font-size: 1.75rem; }
.stat-num { font-size: 1.5rem; font-weight: 700; color: #1e293b; line-height: 1; }
.stat-lbl { font-size: 0.75rem; color: #64748b; margin-top: 0.25rem; }
.stat-total { background: linear-gradient(135deg, #eef2ff, #e0e7ff); }
.stat-disponible { background: linear-gradient(135deg, #f0fdf4, #dcfce7); }
.stat-ocupado { background: linear-gradient(135deg, #fef2f2, #fee2e2); }
.stat-reservado { background: linear-gradient(135deg, #fefce8, #fef9c3); }

.section-card { background: #fff; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.08); padding: 1.5rem; }
.section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
.section-title { font-size: 1.125rem; font-weight: 600; color: #1e293b; margin: 0; }
.section-badge { font-size: 0.75rem; color: #6366f1; background: #eef2ff; padding: 0.25rem 0.75rem; border-radius: 9999px; }

.empty-state { text-align: center; padding: 3rem 1rem; color: #94a3b8; }
.empty-icon { font-size: 3rem; margin-bottom: 0.5rem; }

.zonas-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 1.25rem; }

.zona-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow: hidden; transition: box-shadow 0.2s; }
.zona-card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }

.zona-card-header { display: flex; align-items: center; gap: 0.75rem; padding: 1rem 1.25rem; background: #fff; border-bottom: 1px solid #e2e8f0; }
.zona-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.zona-card-title { flex: 1; min-width: 0; }
.zona-nombre { font-weight: 600; font-size: 0.95rem; color: #1e293b; display: block; }
.zona-ubicacion { font-size: 0.75rem; color: #94a3b8; }
.zona-estado-pill { font-size: 0.65rem; padding: 0.2rem 0.6rem; border-radius: 9999px; font-weight: 600; flex-shrink: 0; }
.pill-activa { background: #dcfce7; color: #16a34a; }
.pill-inactiva { background: #f1f5f9; color: #94a3b8; }

.zona-card-body { padding: 1rem 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

.zona-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5rem; }
.metric { text-align: center; }
.metric-label { display: block; font-size: 0.65rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; }
.metric-value { display: block; font-size: 1rem; font-weight: 700; color: #1e293b; margin-top: 0.15rem; }

.ocupacion-section { }
.ocupacion-header { display: flex; justify-content: space-between; margin-bottom: 0.35rem; }
.ocupacion-label { font-size: 0.75rem; color: #64748b; }
.ocupacion-pct { font-size: 0.75rem; font-weight: 600; }
.ocupacion-bar { height: 8px; background: #e2e8f0; border-radius: 9999px; overflow: hidden; }
.ocupacion-fill { height: 100%; border-radius: 9999px; transition: width 0.5s; }

.zona-espacios-preview { }
.preview-label { font-size: 0.7rem; color: #64748b; display: block; margin-bottom: 0.35rem; }
.preview-dots { display: flex; gap: 0.3rem; flex-wrap: wrap; }
.dot { width: 14px; height: 14px; border-radius: 50%; border: 1px solid #e2e8f0; cursor: help; }
.dot-disponible { background: #22c55e; }
.dot-ocupado { background: #ef4444; }
.dot-reservado { background: #eab308; }
.dot-mantenimiento { background: #f97316; }
.dot-inactivo { background: #94a3b8; }
.dot-more { font-size: 0.65rem; color: #94a3b8; display: flex; align-items: center; }

.zona-card-footer { display: flex; gap: 0.5rem; padding: 0.75rem 1.25rem; border-top: 1px solid #e2e8f0; background: #fff; }
.btn-action { flex: 1; padding: 0.35rem 0; border: 1px solid #e2e8f0; border-radius: 0.375rem; font-size: 0.75rem; cursor: pointer; background: #fff; transition: all 0.15s; }
.btn-edit { color: #6366f1; }
.btn-edit:hover { background: #eef2ff; border-color: #6366f1; }
.btn-delete { color: #ef4444; }
.btn-delete:hover { background: #fef2f2; border-color: #ef4444; }

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
.input-error { border-color: #ef4444; }
.form-err { font-size: 0.75rem; color: #ef4444; margin-top: 0.25rem; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
.btn { padding: 0.5rem 1rem; border-radius: 0.5rem; font-size: 0.875rem; cursor: pointer; border: none; }
.btn-ghost { background: #f1f5f9; color: #475569; }
.btn-ghost:hover { background: #e2e8f0; }
</style>

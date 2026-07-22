<template>
  <div class="zonas-page">

    <!-- ═══════════════════════════════ HEADER ═══════════════════════════════ -->
    <div class="page-header">
      <div>
        <h2 class="page-title">Gestión de Zonas</h2>
        <p class="page-subtitle">Administra las zonas y configuraciones de capacidad del parqueadero</p>
      </div>
      <div class="header-actions" v-if="perm.isAdmin()">
        <button @click="abrirModalZonaCrear" class="btn btn-primary">
          <span class="btn-icon">＋</span> Nueva Zona
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════ STATS CARDS ═══════════════════════════════ -->
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
          <div class="stat-lbl">Capacidad Total Espacios</div>
        </div>
      </div>
    </div>

    <!-- ═══════════════════════════ ZONAS TABLE ════════════════════════════════ -->
    <section class="section-card">
      <div class="section-header">
        <h3 class="section-title">🏢 Zonas Registradas</h3>
        <div class="section-badge">{{ zonas.length }} zonas</div>
      </div>

      <div v-if="loading" class="skeleton-rows">
        <div v-for="i in 4" :key="i" class="skeleton-row"></div>
      </div>

      <div v-else-if="zonas.length === 0" class="empty-state">
        <div class="empty-icon">🏗️</div>
        <p>No hay zonas registradas</p>
      </div>

      <div v-else class="zonas-table-wrap">
        <table class="zonas-table">
          <thead>
            <tr>
              <th>Zona</th>
              <th>Tipo</th>
              <th>Capacidad</th>
              <th>Espacios Asociados</th>
              <th>Ocupación</th>
              <th>Estado</th>
              <th v-if="perm.isAdmin()">Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="zona in zonas" :key="zona.id" class="zona-row">
              <td>
                <div class="zona-name">
                  <span class="zona-dot" :style="{ background: colorZona(zona) }"></span>
                  <div>
                    <div class="zona-nombre">{{ zona.nombre }}</div>
                    <div class="zona-desc">{{ zona.ubicacion || zona.descripcion || '—' }}</div>
                  </div>
                </div>
              </td>
              <td><span class="tipo-badge">{{ zona.tipoZona || 'REGULAR' }}</span></td>
              <td class="text-center font-semibold">{{ zona.capacidad || '—' }}</td>
              <td class="text-center">
                <span class="text-sm font-medium text-gray-700">{{ espaciosPorZona(zona.id).length }}</span>
              </td>
              <td>
                <div class="ocupacion-bar-wrap">
                  <div class="ocupacion-bar">
                    <div class="ocupacion-fill"
                         :style="{ width: pctOcupacion(zona.id, zona.capacidad) + '%', background: colorOcupacion(pctOcupacion(zona.id, zona.capacidad)) }">
                    </div>
                  </div>
                  <span class="ocupacion-pct">{{ pctOcupacion(zona.id, zona.capacidad) }}%</span>
                </div>
              </td>
              <td>
                <span :class="['estado-pill', zona.activo ? 'pill-activo' : 'pill-inactivo']">
                  {{ zona.activo ? 'Activa' : 'Inactiva' }}
                </span>
              </td>
              <td v-if="perm.isAdmin()">
                <div class="row-actions">
                  <button @click="abrirModalZonaEditar(zona)" class="action-btn action-edit" title="Editar">✏️ Editar</button>
                  <button @click="solicitarEliminarZona(zona)" class="action-btn action-del" title="Eliminar">🗑️ Eliminar</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ════════════════════════ MODAL ZONA ═══════════════════════════════════ -->
    <Teleport to="body">
      <div v-if="mostrarModalZona" class="modal-overlay" @click.self="mostrarModalZona = false">
        <div class="modal-box">
          <div class="modal-header">
            <h3>{{ editandoZonaId ? '✏️ Editar Zona' : '＋ Nueva Zona' }}</h3>
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
    </Teleport>

    <!-- Confirm Dialog -->
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

function espaciosPorZona(zonaId) {
  return espacios.value.filter(e => e.idZona === zonaId)
}

function pctOcupacion(zonaId, capacidad) {
  if (!capacidad) return 0
  const ocupados = espaciosPorZona(zonaId).filter(e => e.estado === 'OCUPADO').length
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
/* ─── Page ─────────────────────────────────────────────────── */
.zonas-page { display: flex; flex-direction: column; gap: 1.5rem; }

.page-header {
  display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 1rem;
}
.page-title { font-size: 1.375rem; font-weight: 700; color: #111827; margin: 0; }
.page-subtitle { font-size: 0.875rem; color: #6b7280; margin: 0.25rem 0 0; }
.header-actions { display: flex; gap: 0.75rem; }

/* ─── Buttons ───────────────────────────────────────────────── */
.btn { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 1.1rem;
       border-radius: 0.625rem; font-size: 0.875rem; font-weight: 600; border: none; cursor: pointer; transition: all .18s; }
.btn-primary { background: linear-gradient(135deg,#6366f1,#4f46e5); color: #fff; box-shadow: 0 2px 8px #6366f140; }
.btn-primary:hover { background: linear-gradient(135deg,#4f46e5,#4338ca); box-shadow: 0 4px 12px #6366f160; transform: translateY(-1px); }
.btn-ghost { background: #f3f4f6; color: #374151; }
.btn-ghost:hover { background: #e5e7eb; }
.btn-icon { font-size: 1rem; }

/* ─── Stats ─────────────────────────────────────────────────── */
.stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px,1fr)); gap: 1rem; }
.stat-card {
  display: flex; align-items: center; gap: 0.875rem; padding: 1rem 1.25rem;
  border-radius: 1rem; background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.07);
  border: 1px solid #f3f4f6; transition: transform .18s;
}
.stat-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,.1); }
.stat-icon { font-size: 1.75rem; }
.stat-num { font-size: 1.5rem; font-weight: 700; line-height: 1; }
.stat-lbl { font-size: 0.75rem; color: #6b7280; margin-top: 2px; }
.stat-total  .stat-num { color: #6366f1; }
.stat-disponible .stat-num { color: #10b981; }
.stat-ocupado .stat-num { color: #0ea5e9; }

/* ─── Sections ──────────────────────────────────────────────── */
.section-card {
  background: #fff; border-radius: 1.125rem; padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0,0,0,.07); border: 1px solid #f0f0f0;
}
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  flex-wrap: wrap; gap: 0.75rem; margin-bottom: 1.25rem;
}
.section-title { font-size: 1rem; font-weight: 700; color: #1f2937; margin: 0; }
.section-badge {
  font-size: 0.75rem; background: #f3f4f6; color: #6b7280;
  padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 500;
}

/* ─── Zonas Table ───────────────────────────────────────────── */
.zonas-table-wrap { overflow-x: auto; border-radius: 0.75rem; border: 1px solid #f0f0f0; }
.zonas-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
.zonas-table thead tr { background: #f8fafc; }
.zonas-table th { padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; font-weight: 600;
                  color: #6b7280; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid #f0f0f0; }
.zona-row { border-bottom: 1px solid #f9fafb; transition: background .15s; }
.zona-row:hover { background: #f8fafc; }
.zona-row td { padding: 0.875rem 1rem; vertical-align: middle; }
.zona-name { display: flex; align-items: center; gap: 0.625rem; }
.zona-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
.zona-nombre { font-weight: 600; color: #111827; }
.zona-desc { font-size: 0.75rem; color: #9ca3af; }
.tipo-badge {
  font-size: 0.7rem; font-weight: 600; padding: 0.2rem 0.6rem;
  background: #ede9fe; color: #7c3aed; border-radius: 99px;
}
.text-center { text-align: center; }
.font-semibold { font-weight: 600; }
.text-sm { font-size: 0.875rem; }
.text-gray-700 { color: #374151; }

/* Occupation bar */
.ocupacion-bar-wrap { display: flex; align-items: center; gap: 0.5rem; }
.ocupacion-bar { flex: 1; height: 6px; background: #e5e7eb; border-radius: 99px; overflow: hidden; min-width: 60px; }
.ocupacion-fill { height: 100%; border-radius: 99px; transition: width .4s; }
.ocupacion-pct { font-size: 0.7rem; color: #6b7280; min-width: 32px; }

.estado-pill { font-size: 0.7rem; font-weight: 600; padding: 0.25rem 0.7rem; border-radius: 99px; }
.pill-activo { background: #d1fae5; color: #065f46; }
.pill-inactivo { background: #fee2e2; color: #991b1b; }

.row-actions { display: flex; gap: 0.5rem; }
.action-btn {
  background: #f8fafc; border: 1px solid #e2e8f0; cursor: pointer; font-size: 0.75rem;
  font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 0.5rem; color: #475569; transition: all .15s;
}
.action-btn:hover { background: #e2e8f0; }
.action-del:hover { background: #fee2e2; color: #991b1b; border-color: #fca5a5; }

/* ─── Skeleton & Empty ──────────────────────────────────────── */
.skeleton-rows { display: flex; flex-direction: column; gap: 0.75rem; }
.skeleton-row { height: 44px; background: linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 50%,#f0f0f0 75%);
                background-size: 200% 100%; animation: shimmer 1.4s infinite; border-radius: 0.5rem; }
@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }

.empty-state { text-align: center; padding: 2.5rem 1rem; color: #9ca3af; }
.empty-icon { font-size: 2.5rem; margin-bottom: 0.5rem; }

/* ─── Modal ─────────────────────────────────────────────────── */
.modal-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 100; padding: 1rem;
}
.modal-box {
  background: #fff; border-radius: 1.25rem; width: 100%; max-width: 480px;
  box-shadow: 0 20px 60px rgba(0,0,0,.25); animation: slideUp .25s ease-out;
}
@keyframes slideUp { from{transform:translateY(30px);opacity:0} to{transform:translateY(0);opacity:1} }
.modal-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 1.25rem 1.5rem; border-bottom: 1px solid #f0f0f0;
}
.modal-header h3 { font-size: 1rem; font-weight: 700; color: #111827; margin: 0; }
.modal-close {
  background: #f3f4f6; border: none; border-radius: 0.5rem;
  width: 28px; height: 28px; cursor: pointer; font-size: 0.85rem; color: #6b7280;
  transition: background .15s;
}
.modal-close:hover { background: #e5e7eb; }
.modal-body { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; }
.modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #f0f0f0; display: flex; justify-content: flex-end; gap: 0.75rem; }

.form-group { display: flex; flex-direction: column; gap: 0.375rem; }
.form-group label { font-size: 0.8rem; font-weight: 600; color: #374151; }
.form-input {
  border: 1.5px solid #e5e7eb; border-radius: 0.625rem; padding: 0.55rem 0.875rem;
  font-size: 0.875rem; color: #111827; outline: none; transition: border-color .15s;
  background: #fff; width: 100%; box-sizing: border-box;
}
.form-input:focus { border-color: #6366f1; box-shadow: 0 0 0 3px #6366f120; }
.input-error { border-color: #ef4444; }
.form-err { font-size: 0.75rem; color: #ef4444; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 0.875rem; }
</style>

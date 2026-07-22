<template>
  <div class="dashboard-espacios-page">
    <!-- ═══════════════════════════════ HEADER ═══════════════════════════════ -->
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
          🔄 Refrescar
        </button>
      </div>
    </div>

    <!-- ═══════════════════════════ STATS CARDS ═══════════════════════════════ -->
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

    <!-- ══════════════════════ ESPACIOS Y ZONAS ══════════════════════════════ -->
    <section class="section-card">
      <div class="section-header">
        <div class="flex-row gap-3 items-center">
          <h3 class="section-title">🏢 Estado por Zonas</h3>
          <div class="section-badge">{{ espaciosAgrupados.length }} zonas activas</div>
        </div>

        <!-- Filtros de estado -->
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
        <!-- Grupos por Zona -->
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="dashboard-footer">
      <span>Última actualización SSE: </span>
      <span v-if="espaciosStore.lastUpdate" class="font-semibold">{{ formatDate(espaciosStore.lastUpdate) }}</span>
      <span v-else>--</span>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useEspaciosStore } from '@/stores/espacios'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

const espaciosStore = useEspaciosStore()
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

/* ─── Stats ─────────────────────────────────────────────────── */
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

/* ─── Sections ──────────────────────────────────────────────── */
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

/* ─── Estado Filters ────────────────────────────────────────── */
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

/* ─── Zona Group ────────────────────────────────────────────── */
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

/* ─── Espacios Grid ─────────────────────────────────────────── */
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

/* ─── Empty State ───────────────────────────────────────────── */
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
</style>

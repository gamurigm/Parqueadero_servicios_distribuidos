<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h3 class="text-xl font-semibold text-gray-800">Asignaciones de Roles</h3>
    </div>

    <DataTable :items="filteredList" :columns="columns" :loading="loading" :searchable="false">
      <template #filters>
        <div class="flex flex-wrap gap-3 mb-4">
          <input
            v-model="filtroUsuario"
            type="text"
            placeholder="Filtrar por usuario..."
            class="border border-gray-300 rounded px-3 py-1.5 text-sm w-48"
          />
          <select
            v-model="filtroRol"
            class="border border-gray-300 rounded px-3 py-1.5 text-sm"
          >
            <option value="">Todos los roles</option>
            <option v-for="r in roles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
          </select>
          <button @click="limpiarFiltros" class="text-gray-500 hover:text-gray-700 text-sm px-2">
            Limpiar
          </button>
        </div>
      </template>

      <template #cell-usuario="{ item }">
        <span class="font-medium text-gray-800">
          {{ item.usuario?.nombreCompleto || item.usuario?.username || '—' }}
        </span>
      </template>

      <template #cell-roles="{ item }">
        <div class="flex flex-wrap gap-1">
          <span
            v-for="r in item.roles"
            :key="r.id_rol"
            class="px-2 py-0.5 rounded text-xs font-medium inline-flex items-center gap-1"
            :class="r.activo
              ? (r.nombre === 'super_user' ? 'bg-purple-100 text-purple-800' :
                 r.nombre === 'admin' ? 'bg-red-100 text-red-800' :
                 'bg-blue-100 text-blue-800')
              : 'bg-gray-100 text-gray-500'"
          >
            {{ r.nombre }}
          </span>
        </div>
      </template>

      <template #cell-activas="{ item }">
        <span class="text-sm" :class="item.activos > 0 ? 'text-green-600' : 'text-gray-400'">
          {{ item.activos }} / {{ item.totalRoles }}
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
            Roles de {{ gestion.usuario?.nombreCompleto || gestion.usuario?.username }}
          </h4>
          <button @click="cerrarGestion" class="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <div class="space-y-2 mb-4">
          <p v-if="gestion.roles.length === 0" class="text-sm text-gray-500 text-center py-4">
            Sin roles asignados
          </p>
          <div
            v-for="r in gestion.roles"
            :key="r.id_rol"
            class="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
          >
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded text-xs font-medium"
                :class="r.activo
                  ? (r.nombre === 'super_user' ? 'bg-purple-100 text-purple-800' :
                     r.nombre === 'admin' ? 'bg-red-100 text-red-800' :
                     'bg-blue-100 text-blue-800')
                  : 'bg-gray-100 text-gray-500'"
              >
                {{ r.nombre }}
              </span>
              <span v-if="!r.activo" class="text-xs text-gray-400">(inactivo)</span>
            </div>
            <div class="flex items-center gap-2">
              <button
                v-if="can('admin')"
                @click="toggleEstadoRol(gestion.usuarioId, r.id_rol, r.activo)"
                :disabled="saving"
                class="text-xs px-2 py-0.5 rounded font-medium disabled:opacity-50"
                :class="r.activo
                  ? 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                  : 'bg-green-50 text-green-700 hover:bg-green-100'"
              >
                {{ saving ? '...' : (r.activo ? 'Desactivar' : 'Activar') }}
              </button>
              <button
                v-if="can('super_user')"
                @click="confirmarEliminarRol(gestion.usuarioId, r.id_rol, r.nombre)"
                :disabled="saving"
                class="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700 hover:bg-red-100 font-medium disabled:opacity-50"
              >
                {{ saving ? '...' : 'X' }}
              </button>
            </div>
          </div>
        </div>

        <div v-if="can('admin')" class="border-t pt-4">
          <label class="block text-sm font-medium text-gray-700 mb-1">Agregar rol</label>
          <div class="flex gap-2">
            <select v-model="nuevoRolId" class="flex-1 border border-gray-300 rounded px-3 py-2 text-sm">
              <option value="" disabled>Seleccione un rol</option>
              <option v-for="r in rolesDisponibles" :key="r.id" :value="r.id">{{ r.nombre }}</option>
            </select>
            <button
              @click="agregarRol"
              :disabled="!nuevoRolId || saving"
              class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm disabled:opacity-50"
            >
              {{ saving ? 'Guardando...' : 'Agregar' }}
            </button>
          </div>
          <p v-if="gestion.error" class="text-red-500 text-xs mt-2">{{ gestion.error }}</p>
        </div>
      </div>
    </div>

    <ConfirmDialog
      :visible="confirm.visible"
      titulo="Eliminar Rol"
      :mensaje="`¿Eliminar el rol '${confirm.rolNombre}'?`"
      confirmText="Eliminar"
      :danger="true"
      @confirm="ejecutarEliminarRol"
      @cancel="confirm.visible = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useToastStore } from '@/stores/toast'
import { asignacionesService } from '@/services/asignaciones.service'
import { rolesService } from '@/services/roles.service'
import { usuariosService } from '@/services/usuarios.service'
import DataTable from '@/components/common/DataTable.vue'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const auth = useAuthStore()
const toast = useToastStore()

const loading = ref(false)
const saving = ref(false)

const asignaciones = ref([])
const roles = ref([])
const usuarios = ref([])

const filtroUsuario = ref('')
const filtroRol = ref('')

const nuevoRolId = ref('')

const gestion = ref({ show: false, usuarioId: '', usuario: null, roles: [], error: '' })
const confirm = ref({ visible: false, usuarioId: '', id_rol: '', rolNombre: '', callback: null })

const columns = [
  { key: 'usuario', label: 'Usuario' },
  { key: 'roles', label: 'Roles' },
  { key: 'activas', label: 'Activas' },
]

const rolesDisponibles = computed(() => {
  if (!gestion.value.usuarioId) return []
  const idsAsignados = new Set(gestion.value.roles.map((r) => r.id_rol))
  return roles.value.filter((r) => !idsAsignados.has(r.id))
})

const listaCompleta = computed(() => {
  const map = new Map()
  for (const a of asignaciones.value) {
    const key = a.id_usuario
    if (!map.has(key)) {
      map.set(key, { roles: [], totalRoles: 0, activos: 0 })
    }
    const g = map.get(key)
    g.roles.push({
      id_rol: a.id_rol,
      nombre: a.rol?.nombre || '—',
      activo: a.activo,
      assignedAt: a.assignedAt,
    })
    g.totalRoles++
    if (a.activo) g.activos++
  }
  return usuarios.value.map((u) => {
    const existing = map.get(u.id)
    return {
      id_usuario: u.id,
      usuario: {
        id: u.id,
        username: u.username,
        nombreCompleto: u.nombreCompleto || u.persona
          ? [u.persona?.firstName, u.persona?.middleName, u.persona?.lastName].filter(Boolean).join(' ')
          : u.username,
        active: u.active,
      },
      roles: existing ? existing.roles : [],
      totalRoles: existing ? existing.totalRoles : 0,
      activos: existing ? existing.activos : 0,
    }
  })
})

const filteredList = computed(() => {
  let list = listaCompleta.value
  if (filtroUsuario.value) {
    const q = filtroUsuario.value.toLowerCase()
    list = list.filter((g) => {
      const name = (g.usuario?.nombreCompleto || g.usuario?.username || '').toLowerCase()
      return name.includes(q)
    })
  }
  if (filtroRol.value) {
    list = list.filter((g) => g.roles.some((r) => r.id_rol === filtroRol.value))
  }
  return list
})

const authRoles = computed(() => auth.roles || [])

function can(rol) {
  return auth.roles.includes('super_user') || authRoles.value.includes(rol)
}

function limpiarFiltros() {
  filtroUsuario.value = ''
  filtroRol.value = ''
}

async function cargarDatos() {
  loading.value = true
  try {
    const [asignacionesRes, rolesRes, usuariosRes] = await Promise.all([
      asignacionesService.listarRolesUsuario(),
      rolesService.listar(),
      usuariosService.listar(),
    ])
    asignaciones.value = Array.isArray(asignacionesRes) ? asignacionesRes : asignacionesRes.data || []
    roles.value = Array.isArray(rolesRes) ? rolesRes : rolesRes.data || []
    const usuariosRaw = Array.isArray(usuariosRes) ? usuariosRes : usuariosRes.data || []
    usuarios.value = usuariosRaw
  } catch (err) {
    console.error('Error cargando datos:', err)
  } finally {
    loading.value = false
  }
}

function abrirGestion(item) {
  gestion.value = {
    show: true,
    usuarioId: item.id_usuario,
    usuario: item.usuario,
    roles: [...item.roles],
    error: '',
  }
  nuevoRolId.value = ''
}

function cerrarGestion() {
  gestion.value.show = false
}

async function refrescarGestionRoles() {
  const todas = await asignacionesService.listarRolesUsuario()
  asignaciones.value = Array.isArray(todas) ? todas : todas.data || []
  const userRoles = asignaciones.value.filter((a) => a.id_usuario === gestion.value.usuarioId)
  gestion.value.roles = userRoles.map((a) => ({
    id_rol: a.id_rol,
    nombre: a.rol?.nombre || '—',
    activo: a.activo,
    assignedAt: a.assignedAt,
  }))
}

async function agregarRol() {
  if (!nuevoRolId.value || !gestion.value.usuarioId) return
  saving.value = true
  gestion.value.error = ''
  try {
    await asignacionesService.asignarRol(gestion.value.usuarioId, nuevoRolId.value)
    toast.success('Rol asignado correctamente')
    nuevoRolId.value = ''
    await refrescarGestionRoles()
  } catch (err) {
    gestion.value.error = err.response?.data?.message || err.message || 'Error al asignar rol'
  } finally {
    saving.value = false
  }
}

async function toggleEstadoRol(usuarioId, id_rol, activo) {
  saving.value = true
  try {
    await asignacionesService.desactivarRol(usuarioId, id_rol)
    toast.success(activo ? 'Rol desactivado correctamente' : 'Rol activado correctamente')
    await refrescarGestionRoles()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Error al cambiar estado del rol')
  } finally {
    saving.value = false
  }
}

function confirmarEliminarRol(usuarioId, id_rol, rolNombre) {
  confirm.value = {
    visible: true,
    usuarioId,
    id_rol,
    rolNombre,
  }
}

async function ejecutarEliminarRol() {
  confirm.value.visible = false
  saving.value = true
  try {
    await asignacionesService.eliminarRol(confirm.value.usuarioId, confirm.value.id_rol)
    toast.success('Rol eliminado correctamente')
    await refrescarGestionRoles()
  } catch (err) {
    toast.error(err.response?.data?.message || err.message || 'Error al eliminar el rol')
  } finally {
    saving.value = false
  }
}

onMounted(cargarDatos)
</script>

<template>
  <div class="page">
    <div class="card">
      <h2>🛠️ Gestión de Incidencias</h2>

      <!-- Filtro por estado + botón de refresco -->
      <div class="filtros">
        <select v-model="filtroEstado">
          <option value="todas">Todos los estados</option>
          <option v-for="e in estadosIncidencia" :key="e.id" :value="e.id">
            {{ e.nombre }}
          </option>
        </select>
        <button class="btn-refrescar" @click="cargarIncidencias">🔄 Refrescar</button>
      </div>

      <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>
      <p v-if="cargando" class="msg-cargando">⏳ Cargando incidencias...</p>

      <div v-if="!cargando && incidenciasFiltradas.length === 0" class="vacio">
        No hay incidencias con estos filtros
      </div>

      <!-- Itera sobre la lista filtrada y ordenada (computed) -->
      <div v-for="inc in incidenciasFiltradas" :key="inc.id" class="incidencia-item"
        :class="claseEstado(inc.estado_incidencia_id)">

        <div class="inc-header">
          <strong>{{ inc.titulo }}</strong>
          <span class="badge" :class="badgeEstado(inc.estado_incidencia_id)">
            {{ nombreEstado(inc.estado_incidencia_id) }}
          </span>
        </div>

        <p class="descripcion">{{ inc.descripcion_problema }}</p>
        <small>👤 {{ inc.usuario_login }} | 📍 {{ inc.espacio_id }} | 📅 {{ inc.zfecha?.slice(0,10) }}</small>

        <!-- Caso 1: Incidencia RESUELTA → solo historial, sin acciones -->
        <div v-if="inc.estado_incidencia_id === ID_REST" class="resolucion">
          <strong>✅ Resolución:</strong> {{ inc.comentarios_resolucion }}
          <small>🔧 Responsable: {{ inc.responsable_resolucion_id }} | 📅 {{ inc.fecha_resolucion?.slice(0,10) }}</small>
        </div>

        <!-- Caso 2: Incidencia EN MANTENIMIENTO → solo puede marcarse como resuelta
             El botón queda deshabilitado si el textarea está vacío, forzando
             que siempre haya comentario de resolución antes de cerrar. -->
        <div v-else-if="inc.estado_incidencia_id === ID_PROC" class="resolver-form">
          <div class="en-proc">🔧 En mantenimiento — registra la solución cuando termines</div>
          <small class="responsable-info">Se registrará como responsable: <strong>{{ dniResponsable }}</strong></small>
          <textarea v-model="resoluciones[inc.id].comentario"
            placeholder="Describe cómo se resolvió..." rows="3"></textarea>
          <div class="botones-accion">
            <button class="btn-resolver"
              @click="cambiarEstado(inc.id, ID_REST, resoluciones[inc.id].comentario)"
              :disabled="!resoluciones[inc.id].comentario || resolviendo[inc.id]">
              {{ resolviendo[inc.id] ? 'Guardando...' : '✅ Marcar como resuelta' }}
            </button>
          </div>
        </div>

        <!-- Caso 3: Incidencia PENDIENTE → puede ponerse en mantenimiento o resolverse directamente
             El comentario es opcional para mantenimiento pero obligatorio para resolver. -->
        <div v-else class="resolver-form">
          <small class="responsable-info">🔧 Se registrará como responsable: <strong>{{ dniResponsable }}</strong></small>
          <textarea v-model="resoluciones[inc.id].comentario"
            placeholder="Comentarios (obligatorio para resolver, opcional para mantenimiento)..." rows="3"></textarea>
          <div class="botones-accion">
            <!-- Pasar a mantenimiento no requiere comentario; envía string vacío -->
            <button class="btn-mantenimiento"
              @click="cambiarEstado(inc.id, ID_PROC, '')"
              :disabled="resolviendo[inc.id]">
              🔧 Poner en mantenimiento
            </button>
            <!-- Resolver sí requiere comentario → :disabled si textarea vacío -->
            <button class="btn-resolver"
              @click="cambiarEstado(inc.id, ID_REST, resoluciones[inc.id].comentario)"
              :disabled="!resoluciones[inc.id].comentario || resolviendo[inc.id]">
              {{ resolviendo[inc.id] ? 'Guardando...' : '✅ Marcar como resuelta' }}
            </button>
          </div>
        </div>

      </div>

      <!-- Contador global por estado al pie de la lista -->
      <div v-if="incidencias.length > 0" class="contador">
        <span class="badge badge-pent">⏳ Pendientes: {{ totalPorEstado(ID_PENT) }}</span>
        <span class="badge badge-proc">🔧 Mantenimiento: {{ totalPorEstado(ID_PROC) }}</span>
        <span class="badge badge-rest">✅ Resueltas: {{ totalPorEstado(ID_REST) }}</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL  = URL;
const ZUSUARIO = "ivan";
const Z        = `?zusuario=${ZUSUARIO}`;

// Lee el usuario logado para obtener su login y buscar su DNI/NIE
const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

// IDs de estados — pre-inicializados con los valores esperados de la BD.
// cargarEstados() los confirma desde la API al montar el componente.
let ID_PENT = "PENT";
let ID_PROC = "PROC";
let ID_REST = "REST";

const incidencias       = ref([]);
const estadosIncidencia = ref([]);
const mensaje           = ref("");
const mensajeError      = ref(false);
const cargando          = ref(false);
// Valor del selector de filtro; "todas" significa sin filtro activo
const filtroEstado      = ref("todas");

// reactive() para objetos cuyas claves se crean dinámicamente.
// resoluciones[inc.id] = { comentario: "" } → un textarea por incidencia
const resoluciones   = reactive({});
// resolviendo[inc.id] = true mientras el PUT está en curso → deshabilita botón
const resolviendo    = reactive({});
// DNI o NIE del responsable (se busca en /usuarios por el login del usuario logado)
const dniResponsable = ref("");

onMounted(async () => {
  // Carga estados y DNI responsable en paralelo; después carga incidencias
  await Promise.all([cargarEstados(), cargarDniResponsable()]);
  await cargarIncidencias();
});

// ── GET estados de incidencia ──────────────────────────────────
const cargarEstados = async () => {
  try {
    const res = await axios.get(`${API_URL}/estados_incidencia${Z}`);
    estadosIncidencia.value = res.data;
    // Confirma los IDs reales desde la BD
    res.data.forEach(e => {
      if (e.id === "PENT") ID_PENT = e.id;
      if (e.id === "PROC") ID_PROC = e.id;
      if (e.id === "REST") ID_REST = e.id;
    });
  } catch (error) {
    console.error("Error cargando estados incidencia:", error);
  }
};

// ── GET DNI del responsable ────────────────────────────────────
// La API de incidencias espera el campo responsable_resolucion_id
// con el DNI/NIE del técnico, no su login.
// Se busca el usuario logado en la tabla /usuarios y se extrae ref_identidad_fk.
const cargarDniResponsable = async () => {
  try {
    const res       = await axios.get(`${API_URL}/usuarios${Z}`);
    const miUsuario = res.data.find(u => u.login === usuario.login);
    // Si no se encuentra, se usa el login como fallback
    dniResponsable.value = miUsuario?.ref_identidad_fk || usuario.login;
  } catch (error) {
    dniResponsable.value = usuario.login;
  }
};

// ── GET incidencias ────────────────────────────────────────────
// Crea además la entrada en resoluciones[] para cada incidencia
// si no existe ya, para que el textarea esté disponible desde el primer render.
const cargarIncidencias = async () => {
  cargando.value = true;
  try {
    const res         = await axios.get(`${API_URL}/incidencias${Z}`);
    incidencias.value = res.data;
    res.data.forEach(inc => {
      if (!resoluciones[inc.id]) resoluciones[inc.id] = { comentario: "" };
    });
  } catch (error) {
    mostrarMensaje("❌ No se pudieron cargar las incidencias", true);
  } finally {
    cargando.value = false;
  }
};

// ── Computed: filtro + orden ────────────────────────────────────
// Se recalcula automáticamente cuando cambia filtroEstado o incidencias.
// Orden definido: PENT (0) → PROC (1) → REST (2) para que las pendientes
// aparezcan siempre al principio.
const incidenciasFiltradas = computed(() => {
  const orden = { [ID_PENT]: 0, [ID_PROC]: 1, [ID_REST]: 2 };
  return incidencias.value
    .filter(inc => filtroEstado.value === "todas" || inc.estado_incidencia_id === filtroEstado.value)
    .sort((a, b) => (orden[a.estado_incidencia_id] ?? 3) - (orden[b.estado_incidencia_id] ?? 3));
});

// Cuenta cuántas incidencias tienen un estado concreto
const totalPorEstado = (id) => incidencias.value.filter(i => i.estado_incidencia_id === id).length;

// ── PUT cambiar estado de incidencia ──────────────────────────
// Centraliza los dos casos posibles: PENT→PROC y (PENT|PROC)→REST.
// Si el nuevo estado es REST se exige comentario (validación frontend).
const cambiarEstado = async (id, nuevoEstado, comentario) => {
  // Guard: no permite marcar como resuelta sin comentario
  if (nuevoEstado === ID_REST && !comentario) return;

  resolviendo[id] = true;
  try {
    // Cuerpo base del PUT: siempre se envía el nuevo estado y el responsable
    const body = {
      estado_incidencia_id:      nuevoEstado,
      responsable_resolucion_id: dniResponsable.value,
      zusuario:                  ZUSUARIO
    };
    // Solo cuando se resuelve se añaden comentario y fecha de resolución
    if (nuevoEstado === ID_REST) {
      body.comentarios_resolucion = comentario;
      body.fecha_resolucion       = new Date().toISOString().slice(0, 10);
    }

    await axios.put(`${API_URL}/incidencias/${id}${Z}`, body);

    // Mensaje diferente según el estado al que se transiciona
    const msgs = {
      [ID_PROC]: "🔧 Incidencia puesta en mantenimiento",
      [ID_REST]: "✅ Incidencia marcada como resuelta"
    };
    mostrarMensaje(msgs[nuevoEstado] || "✅ Estado actualizado", false);
    await cargarIncidencias();  // Refresca la lista para reflejar el cambio
  } catch (error) {
    console.error("Error PUT incidencia:", error.response?.data);
    mostrarMensaje("❌ No se pudo actualizar la incidencia", true);
  } finally {
    resolviendo[id] = false;
    setTimeout(() => mensaje.value = "", 3000);
  }
};

// ── Helpers visuales ──────────────────────────────────────────
const nombreEstado = (id) => estadosIncidencia.value.find(e => e.id === id)?.nombre || id;

const claseEstado = (id) => {
  if (id === ID_REST) return "resuelta";
  if (id === ID_PROC) return "mantenimiento";
  return "pendiente";
};

const badgeEstado = (id) => {
  if (id === ID_REST) return "badge-rest";
  if (id === ID_PROC) return "badge-proc";
  return "badge-pent";
};

const mostrarMensaje = (texto, esError) => {
  mensaje.value      = texto;
  mensajeError.value = esError;
};
</script>

<style scoped>
.page { padding: 32px; display: flex; justify-content: center; }
.card { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 720px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 16px; }
h2 { color: #2c3e50; }
.filtros { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; }
.filtros select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; cursor: pointer; }
.btn-refrescar { padding: 7px 14px; background-color: #3498db; color: white; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: background-color 0.2s; }
.btn-refrescar:hover { background-color: #2980b9; }
.msg-ok { color: #42b983; font-weight: bold; }
.msg-error { color: #e74c3c; font-weight: bold; }
.msg-cargando { color: #888; font-size: 0.9rem; }
.vacio { text-align: center; color: #aaa; padding: 40px 0; font-size: 0.95rem; }
.incidencia-item { border-radius: 8px; padding: 16px; border-left: 4px solid #ddd; display: flex; flex-direction: column; gap: 8px; }
.pendiente     { border-left-color: #e67e22; background: #fff9f4; }
.mantenimiento { border-left-color: #3498db; background: #f0f7ff; }
.resuelta      { border-left-color: #42b983; background: #f4fff9; }
.inc-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.badge { font-size: 0.75rem; padding: 3px 10px; border-radius: 20px; font-weight: bold; }
.badge-pent { background: #ffecd2; color: #e67e22; }
.badge-proc { background: #d6eaf8; color: #2980b9; }
.badge-rest { background: #d4f5e9; color: #27ae60; }
.descripcion { color: #555; font-size: 0.92rem; }
small { color: #888; font-size: 0.8rem; }
.resolucion { background: #eafaf1; padding: 10px 14px; border-radius: 6px; font-size: 0.88rem; color: #27ae60; display: flex; flex-direction: column; gap: 4px; }
.en-proc { background: #d6eaf8; padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; color: #2980b9; font-weight: bold; }
.resolver-form { display: flex; flex-direction: column; gap: 8px; }
.responsable-info { color: #3498db; font-size: 0.82rem; }
.resolver-form textarea { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.9rem; font-family: inherit; resize: vertical; transition: border-color 0.2s; }
.resolver-form textarea:focus { outline: none; border-color: #42b983; }
.botones-accion { display: flex; gap: 8px; justify-content: flex-end; flex-wrap: wrap; }
.btn-mantenimiento { padding: 8px 16px; background-color: #3498db; color: white; border: none; border-radius: 6px; font-size: 0.88rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
.btn-mantenimiento:hover:not(:disabled) { background-color: #2980b9; }
.btn-mantenimiento:disabled { background-color: #aaa; cursor: not-allowed; }
.btn-resolver { padding: 8px 16px; background-color: #42b983; color: white; border: none; border-radius: 6px; font-size: 0.88rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
.btn-resolver:hover:not(:disabled) { background-color: #369870; }
.btn-resolver:disabled { background-color: #aaa; cursor: not-allowed; }
.contador { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid #f0f0f0; flex-wrap: wrap; }
</style>

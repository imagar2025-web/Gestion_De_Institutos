<template>
  <div class="page">
    <div class="card">
      <h2>🔧 Crear Incidencia</h2>

      <form @submit.prevent="enviarIncidencia()">
        <div class="form-group">
          <label>Descripción</label>
          <textarea v-model="incidencia.descripcion_problema"
            placeholder="Explica el problema con detalle" rows="4" required></textarea>
        </div>
        <div class="form-group">
          <label>Espacio afectado</label>
          <select v-model="incidencia.espacio_id" required>
            <option value="">-- Selecciona un espacio --</option>
            <!-- v-for genera una opción por cada espacio cargado de la API.
                 :key ayuda a Vue a identificar cada nodo de forma única. -->
            <option v-for="e in espacios" :key="e.id" :value="e.id">
              {{ e.nombre }} — Planta {{ e.ubicacion_planta }}
            </option>
          </select>
        </div>

        <!-- :disabled="enviando" bloquea el botón mientras el POST está en curso,
             evitando crear duplicados por doble clic. -->
        <button type="submit" :disabled="enviando">
          {{ enviando ? 'Enviando...' : 'Enviar incidencia' }}
        </button>
      </form>

      <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

      <p v-if="cargando" class="msg-cargando">⏳ Cargando incidencias...</p>
      <div v-else-if="misIncidencias.length === 0" class="vacio">
        No tienes incidencias registradas aún.
      </div>

      <!-- Lista de incidencias del usuario logado -->
      <div v-else class="lista">
        <h3>📋 Mis incidencias</h3>
        <!-- :class aplica un estilo distinto según el estado de cada incidencia -->
        <div v-for="inc in misIncidencias" :key="inc.id" class="incidencia-item"
          :class="claseEstado(inc.estado_incidencia_id)">
          <div class="inc-header">
            <strong>{{ inc.titulo }}</strong>
            <!-- Badge de color según estado (pendiente/mantenimiento/resuelta) -->
            <span class="badge" :class="badgeEstado(inc.estado_incidencia_id)">
              {{ nombreEstado(inc.estado_incidencia_id) }}
            </span>
          </div>
          <p>{{ inc.descripcion_problema }}</p>
          <!-- .slice(0,10) recorta la fecha ISO a solo YYYY-MM-DD -->
          <small>📍 Espacio: {{ inc.espacio_id }} | 📅 {{ inc.zfecha?.slice(0,10) }}</small>
          <!-- Solo se muestra la resolución si existe comentario de resolución -->
          <div v-if="inc.comentarios_resolucion" class="resolucion">
            <strong>✅ Resolución:</strong> {{ inc.comentarios_resolucion }}
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL  = URL;
const ZUSUARIO = "ivan";                       // Parámetro de auditoría
const Z        = `?zusuario=${ZUSUARIO}`;      // Query string reutilizable

// Lista de espacios para el selector del formulario
const espacios          = ref([]);
// Incidencias filtradas solo para el usuario logado (o todas si es admin)
const misIncidencias    = ref([]);
// Lista de estados de incidencia cargados de la API (PENT, PROC, REST)
const estadosIncidencia = ref([]);
const mensaje           = ref("");
const mensajeError      = ref(false);
const cargando          = ref(false);
const enviando          = ref(false);  // Flag específico para el POST

// IDs de los estados de incidencia — se confirman desde la API en cargarEstados().
// Se pre-asignan con los valores esperados para que el código funcione
// incluso si la llamada a la API falla temporalmente.
let ID_PENT = "PENT";
let ID_PROC = "PROC";
let ID_REST = "REST";

// Lee el usuario logado de sessionStorage.
// Si no hay sesión, devuelve un objeto vacío para evitar errores de undefined.
const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

// Función factoría que devuelve un objeto de incidencia vacío.
// Se usa tanto para inicializar como para resetear el formulario tras el POST.
const incidenciaVacia = () => ({
  espacio_id:                "",
  usuario_login:             usuario.login || "",   // Se rellena con el usuario logado
  descripcion_problema:      "",
  estado_incidencia_id:      ID_PENT,               // Toda incidencia nueva empieza en PENDIENTE
  responsable_resolucion_id: "",
  comentarios_resolucion:    "",
  fecha_resolucion:          "",
  zfecha:                    new Date().toISOString().slice(0, 10),  // Fecha actual YYYY-MM-DD
  zusuario:                  ZUSUARIO
});

const incidencia = ref(incidenciaVacia());

// ── Carga inicial ──────────────────────────────────────────────
// Primero carga los estados para tener ID_PENT/PROC/REST confirmados,
// luego carga espacios e incidencias en paralelo con Promise.all
// para reducir el tiempo total de espera.
onMounted(async () => {
  await cargarEstados();
  await Promise.all([cargarEspacios(), cargarIncidencias()]);
});

// ── GET estados de incidencia ──────────────────────────────────
// Confirma los IDs reales de la BD y guarda la lista para mostrar
// los nombres de estado en la interfaz.
const cargarEstados = async () => {
  try {
    const res = await axios.get(`${API_URL}/estados_incidencia${Z}`);
    estadosIncidencia.value = res.data;
    // Itera los estados devueltos y asigna los IDs reales a las variables.
    // Esto protege ante posibles renombrados futuros en la BD.
    res.data.forEach(e => {
      if (e.id === "PENT") ID_PENT = e.id;
      if (e.id === "PROC") ID_PROC = e.id;
      if (e.id === "REST") ID_REST = e.id;
    });
  } catch (error) {
    console.error("Error cargando estados:", error);
  }
};

// ── GET espacios ───────────────────────────────────────────────
const cargarEspacios = async () => {
  try {
    const res = await axios.get(`${API_URL}/espacios${Z}`);
    espacios.value = res.data;
  } catch (error) {
    console.error("Error cargando espacios:", error);
  }
};

// ── GET incidencias ────────────────────────────────────────────
// ADMIN ve todas las incidencias; el resto solo las propias.
// El filtro se aplica en el frontend porque la API devuelve todas.
const cargarIncidencias = async () => {
  cargando.value = true;
  try {
    const res = await axios.get(`${API_URL}/incidencias${Z}`);
    if (usuario.rol?.toLowerCase().includes("admin")) {
      // Admin: sin filtro
      misIncidencias.value = res.data;
    } else {
      // Otros roles: solo las incidencias del usuario logado
      misIncidencias.value = res.data.filter(i => i.usuario_login === usuario.login);
    }
  } catch (error) {
    mostrarMensaje("❌ No se pudieron cargar tus incidencias", true);
  } finally {
    cargando.value = false;
  }
};

// ── POST nueva incidencia ──────────────────────────────────────
const enviarIncidencia = async () => {
  enviando.value = true;
  try {
    mostrarMensaje("Enviando...", false);

    // Fuerza el estado PENDIENTE justo antes del POST por seguridad,
    // evitando que un valor residual del formulario cambie el estado inicial.
    incidencia.value.estado_incidencia_id = ID_PENT;
    incidencia.value.usuario_login        = usuario.login;
    incidencia.value.zfecha               = new Date().toISOString().slice(0, 10);

    await axios.post(`${API_URL}/incidencias${Z}`, incidencia.value);
    mostrarMensaje("✅ Incidencia creada correctamente", false);

    // Resetea el formulario a valores vacíos para permitir otra entrada
    incidencia.value = incidenciaVacia();
    await cargarIncidencias();  // Refresca la lista para mostrar la nueva incidencia
  } catch (error) {
    console.error("Error POST:", error.response?.data);
    mostrarMensaje("❌ El servidor rechazó los datos", true);
  } finally {
    enviando.value = false;
    // Limpia el mensaje automáticamente después de 3 segundos
    setTimeout(() => mensaje.value = "", 3000);
  }
};

// ── Helpers visuales ──────────────────────────────────────────

// Busca el nombre descriptivo del estado por su ID.
// Si no lo encuentra (estado desconocido), muestra el ID directamente.
const nombreEstado = (id) => estadosIncidencia.value.find(e => e.id === id)?.nombre || id;

// Devuelve la clase CSS de fondo para cada tarjeta de incidencia
const claseEstado = (id) => {
  if (id === ID_REST) return "resuelta";
  if (id === ID_PROC) return "mantenimiento";
  return "pendiente";
};

// Devuelve la clase CSS para el badge de estado
const badgeEstado = (id) => {
  if (id === ID_REST) return "badge-rest";
  if (id === ID_PROC) return "badge-proc";
  return "badge-pent";
};

// Helper centralizado para asignar mensaje + flag de error
const mostrarMensaje = (texto, esError) => {
  mensaje.value      = texto;
  mensajeError.value = esError;
};
</script>

<style scoped>
.page { padding: 32px; display: flex; justify-content: center; }
.card { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 640px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 16px; }
h2 { color: #2c3e50; }
h3 { color: #2c3e50; margin-top: 8px; }
.form-group { display: flex; flex-direction: column; gap: 4px; }
label { font-size: 0.85rem; font-weight: bold; color: #444; }
input, select, textarea { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; font-family: inherit; transition: border-color 0.2s; }
input:focus, select:focus, textarea:focus { outline: none; border-color: #42b983; }
button { padding: 12px; background-color: #42b983; color: white; border: none; border-radius: 6px; font-size: 1rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
button:hover:not(:disabled) { background-color: #369870; }
button:disabled { background-color: #aaa; cursor: not-allowed; }
.msg-ok { color: #42b983; font-weight: bold; }
.msg-error { color: #e74c3c; font-weight: bold; }
.msg-cargando { color: #888; font-size: 0.9rem; }
.vacio { text-align: center; color: #aaa; padding: 20px 0; font-size: 0.9rem; }
.lista { display: flex; flex-direction: column; gap: 12px; }
.incidencia-item { border-radius: 8px; padding: 14px; border-left: 4px solid #ddd; display: flex; flex-direction: column; gap: 6px; }
.pendiente     { border-left-color: #e67e22; background: #fff9f4; }
.mantenimiento { border-left-color: #3498db; background: #f0f7ff; }
.resuelta      { border-left-color: #42b983; background: #f4fff9; }
.inc-header { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px; }
.badge { font-size: 0.75rem; padding: 3px 10px; border-radius: 20px; font-weight: bold; }
.badge-pent { background: #ffecd2; color: #e67e22; }
.badge-proc { background: #d6eaf8; color: #2980b9; }
.badge-rest { background: #d4f5e9; color: #27ae60; }
small { color: #888; font-size: 0.8rem; }
p { color: #555; font-size: 0.9rem; }
.resolucion { background: #eafaf1; padding: 8px 12px; border-radius: 6px; font-size: 0.88rem; color: #27ae60; }
</style>

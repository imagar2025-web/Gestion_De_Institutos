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
                        <option v-for="e in espacios" :key="e.id" :value="e.id">
                            {{ e.nombre }} — Planta {{ e.ubicacion_planta }}
                        </option>
                    </select>
                </div>

                <button type="submit" :disabled="enviando">
                    {{ enviando ? 'Enviando...' : 'Enviar incidencia' }}
                </button>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando incidencias...</p>
            <div v-else-if="misIncidencias.length === 0" class="vacio">
                No tienes incidencias registradas aún.
            </div>

            <div v-else class="lista">
                <h3>📋 Mis incidencias</h3>
                <div v-for="inc in misIncidencias" :key="inc.id" class="incidencia-item"
                    :class="claseEstado(inc.estado_incidencia_id)">
                    <div class="inc-header">
                        <strong>{{ inc.titulo }}</strong>
                        <span class="badge" :class="badgeEstado(inc.estado_incidencia_id)">
                            {{ nombreEstado(inc.estado_incidencia_id) }}
                        </span>
                    </div>
                    <p>{{ inc.descripcion_problema }}</p>
                    <small>📍 Espacio: {{ inc.espacio_id }} | 📅 {{ inc.zfecha?.slice(0,10) }}</small>
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
const ZUSUARIO = "ivan";
const Z        = `?zusuario=${ZUSUARIO}`;

const espacios          = ref([]);
const misIncidencias    = ref([]);
const estadosIncidencia = ref([]);
const mensaje           = ref("");
const mensajeError      = ref(false);
const cargando          = ref(false);
const enviando          = ref(false);

// ID del estado pendiente — se confirma al cargar de la API
let ID_PENT = "PENT";
let ID_PROC = "PROC";
let ID_REST = "REST";

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

const incidenciaVacia = () => ({
    espacio_id:                "",
    usuario_login:             usuario.login || "",
    
    descripcion_problema:      "",
    estado_incidencia_id:      ID_PENT,
    responsable_resolucion_id: "",
    comentarios_resolucion:    "",
    fecha_resolucion:          "",
    zfecha:                    new Date().toISOString().slice(0, 10),
    zusuario:                  ZUSUARIO
});

const incidencia = ref(incidenciaVacia());

onMounted(async () => {
    await cargarEstados();
    await Promise.all([cargarEspacios(), cargarIncidencias()]);
});

const cargarEstados = async () => {
    try {
        const res = await axios.get(`${API_URL}/estados_incidencia${Z}`);
        estadosIncidencia.value = res.data;
        res.data.forEach(e => {
            if (e.id === "PENT") ID_PENT = e.id;
            if (e.id === "PROC") ID_PROC = e.id;
            if (e.id === "REST") ID_REST = e.id;
        });
    } catch (error) {
        console.error("Error cargando estados:", error);
    }
};

const cargarEspacios = async () => {
    try {
        const res = await axios.get(`${API_URL}/espacios${Z}`);
        espacios.value = res.data;
    } catch (error) {
        console.error("Error cargando espacios:", error);
    }
};

const cargarIncidencias = async () => {
    cargando.value = true;
    try {
        const res = await axios.get(`${API_URL}/incidencias${Z}`);
        if (usuario.rol?.toLowerCase().includes("admin")) {
            misIncidencias.value = res.data;
        } else {
            misIncidencias.value = res.data.filter(i => i.usuario_login === usuario.login);
        }
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar tus incidencias", true);
    } finally {
        cargando.value = false;
    }
};

const enviarIncidencia = async () => {
    enviando.value = true;
    try {
        mostrarMensaje("Enviando...", false);
        incidencia.value.estado_incidencia_id = ID_PENT;
        incidencia.value.usuario_login        = usuario.login;
        incidencia.value.zfecha               = new Date().toISOString().slice(0, 10);
        await axios.post(`${API_URL}/incidencias${Z}`, incidencia.value);
        mostrarMensaje("✅ Incidencia creada correctamente", false);
        incidencia.value = incidenciaVacia();
        await cargarIncidencias();
    } catch (error) {
        console.error("Error POST:", error.response?.data);
        mostrarMensaje("❌ El servidor rechazó los datos", true);
    } finally {
        enviando.value = false;
        setTimeout(() => mensaje.value = "", 3000);
    }
};

// Helpers visuales — misma lógica que ResolverIncidencia
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

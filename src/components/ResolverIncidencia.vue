<template>
    <div class="page">
        <div class="card">
            <h2>🛠️ Gestión de Incidencias</h2>

            <!-- Filtros -->
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

            <!-- Lista -->
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

                <!-- REST: historial -->
                <div v-if="inc.estado_incidencia_id === ID_REST" class="resolucion">
                    <strong>✅ Resolución:</strong> {{ inc.comentarios_resolucion }}
                    <small>🔧 Responsable: {{ inc.responsable_resolucion_id }} | 📅 {{ inc.fecha_resolucion?.slice(0,10) }}</small>
                </div>

                <!-- PROC: en mantenimiento, solo puede resolver -->
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

                <!-- PENT: puede pasar a mantenimiento o resolver directo -->
                <div v-else class="resolver-form">
                    <small class="responsable-info">🔧 Se registrará como responsable: <strong>{{ dniResponsable }}</strong></small>
                    <textarea v-model="resoluciones[inc.id].comentario"
                        placeholder="Comentarios (obligatorio para resolver, opcional para mantenimiento)..." rows="3"></textarea>
                    <div class="botones-accion">
                        <button class="btn-mantenimiento"
                            @click="cambiarEstado(inc.id, ID_PROC, '')"
                            :disabled="resolviendo[inc.id]">
                            🔧 Poner en mantenimiento
                        </button>
                        <button class="btn-resolver"
                            @click="cambiarEstado(inc.id, ID_REST, resoluciones[inc.id].comentario)"
                            :disabled="!resoluciones[inc.id].comentario || resolviendo[inc.id]">
                            {{ resolviendo[inc.id] ? 'Guardando...' : '✅ Marcar como resuelta' }}
                        </button>
                    </div>
                </div>

            </div>

            <!-- Contadores -->
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

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

// IDs de estados — se asignan tras cargar de la API
let ID_PENT = "PENT";
let ID_PROC = "PROC";
let ID_REST = "REST";

const incidencias       = ref([]);
const estadosIncidencia = ref([]);
const mensaje           = ref("");
const mensajeError      = ref(false);
const cargando          = ref(false);
const filtroEstado      = ref("todas");
const resoluciones      = reactive({});
const resolviendo       = reactive({});
const dniResponsable    = ref("");

onMounted(async () => {
    await Promise.all([cargarEstados(), cargarDniResponsable()]);
    await cargarIncidencias();
});

const cargarEstados = async () => {
    try {
        const res = await axios.get(`${API_URL}/estados_incidencia${Z}`);
        estadosIncidencia.value = res.data;
        // Confirma los IDs reales de la BD
        res.data.forEach(e => {
            if (e.id === "PENT") ID_PENT = e.id;
            if (e.id === "PROC") ID_PROC = e.id;
            if (e.id === "REST") ID_REST = e.id;
        });
    } catch (error) {
        console.error("Error cargando estados incidencia:", error);
    }
};

const cargarDniResponsable = async () => {
    try {
        const res       = await axios.get(`${API_URL}/usuarios${Z}`);
        const miUsuario = res.data.find(u => u.login === usuario.login);
        dniResponsable.value = miUsuario?.ref_identidad_fk || usuario.login;
    } catch (error) {
        dniResponsable.value = usuario.login;
    }
};

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

// Orden: PENT → PROC → REST
const incidenciasFiltradas = computed(() => {
    const orden = { [ID_PENT]: 0, [ID_PROC]: 1, [ID_REST]: 2 };
    return incidencias.value
        .filter(inc => filtroEstado.value === "todas" || inc.estado_incidencia_id === filtroEstado.value)
        .sort((a, b) => (orden[a.estado_incidencia_id] ?? 3) - (orden[b.estado_incidencia_id] ?? 3));
});

const totalPorEstado = (id) => incidencias.value.filter(i => i.estado_incidencia_id === id).length;

// PUT — cambia el estado
const cambiarEstado = async (id, nuevoEstado, comentario) => {
    if (nuevoEstado === ID_REST && !comentario) return;

    resolviendo[id] = true;
    try {
        const body = {
            estado_incidencia_id:      nuevoEstado,
            responsable_resolucion_id: dniResponsable.value,
            zusuario:                  ZUSUARIO
        };
        if (nuevoEstado === ID_REST) {
            body.comentarios_resolucion = comentario;
            body.fecha_resolucion       = new Date().toISOString().slice(0, 10);
        }

        await axios.put(`${API_URL}/incidencias/${id}${Z}`, body);

        const msgs = {
            [ID_PROC]: "🔧 Incidencia puesta en mantenimiento",
            [ID_REST]: "✅ Incidencia marcada como resuelta"
        };
        mostrarMensaje(msgs[nuevoEstado] || "✅ Estado actualizado", false);
        await cargarIncidencias();
    } catch (error) {
        console.error("Error PUT incidencia:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar la incidencia", true);
    } finally {
        resolviendo[id] = false;
        setTimeout(() => mensaje.value = "", 3000);
    }
};

// Helpers visuales
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

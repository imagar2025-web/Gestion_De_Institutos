<template>
    <div class="page">
        <div class="card">
            <h2>🛠️ Gestión de Incidencias</h2>

            <!-- Filtros -->
            <div class="filtros">
                <select v-model="filtroEstado">
                    <option value="todas">Todos los estados</option>
                    <option :value="ESTADO_PENDIENTE">Pendientes</option>
                    <option :value="ESTADO_RESUELTA">Resueltas</option>
                </select>
                
                <button class="btn-refrescar" @click="cargarIncidencias">🔄 Refrescar</button>
            </div>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>
            <p v-if="cargando" class="msg-cargando">⏳ Cargando incidencias...</p>

            <!-- Sin resultados -->
            <div v-if="!cargando && incidenciasFiltradas.length === 0" class="vacio">
                No hay incidencias con estos filtros
            </div>

            <!-- Lista -->
            <div v-for="inc in incidenciasFiltradas" :key="inc.id" class="incidencia-item"
                :class="inc.estado_incidencia_id === ESTADO_RESUELTA ? 'resuelta' : 'pendiente'">

                <div class="inc-header">
                    <strong>{{ inc.titulo }}</strong>
                    <div class="badges">
                        <span class="badge" :class="'prioridad-' + (inc.prioridad?.toLowerCase() || 'baja')">
                            ⚡ {{ inc.prioridad }}
                        </span>
                        <span class="badge"
                            :class="inc.estado_incidencia_id === ESTADO_RESUELTA ? 'badge-ok' : 'badge-pending'">
                            {{ inc.estado_incidencia_id }}
                        </span>
                    </div>
                </div>

                <p class="descripcion">{{ inc.descripcion_problema }}</p>
                <small>👤 {{ inc.usuario_login }} | 📍 {{ inc.espacio_id }} | 📅 {{ inc.zfecha }}</small>

                <!-- Ya resuelta — muestra historial completo -->
                <div v-if="inc.estado_incidencia_id === ESTADO_RESUELTA" class="resolucion">
                    <strong>✅ Resolución:</strong> {{ inc.comentarios_resolucion }}
                    <small>🔧 Responsable: {{ inc.responsable_resolucion_id }} | 📅 {{ inc.fecha_resolucion }}</small>
                </div>

                <!-- Pendiente — formulario para resolver -->
                <div v-else class="resolver-form">
                    <small class="responsable-info">🔧 Se registrará como responsable: <strong>{{ dniResponsable }}</strong></small>
                    <textarea
                        v-model="resoluciones[inc.id].comentario"
                        placeholder="Describe cómo se resolvió la incidencia..."
                        rows="3"
                    ></textarea>
                    <button
                        @click="resolver(inc.id)"
                        :disabled="!resoluciones[inc.id].comentario || resolviendo[inc.id]">
                        {{ resolviendo[inc.id] ? 'Guardando...' : 'Marcar como resuelta' }}
                    </button>
                </div>

            </div>

            <!-- Contador al pie -->
            <div v-if="incidencias.length > 0" class="contador">
                <span class="badge badge-pending">⏳ Pendientes: {{ totalPendientes }}</span>
                <span class="badge badge-ok">✅ Resueltas: {{ totalResueltas }}</span>
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

// ── Cambia estos dos valores por los IDs reales de tu BD ──
const ESTADO_PENDIENTE = "PENT";  
const ESTADO_RESUELTA  = "REST";  

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

// ── Estado ─────────────────────────────────────────────────
const incidencias  = ref([]);
const mensaje      = ref("");
const mensajeError = ref(false);
const cargando     = ref(false);

const filtroEstado    = ref("todas");


// Un objeto por incidencia solo para el comentario — responsable se resuelve automáticamente
const resoluciones   = reactive({});
const resolviendo    = reactive({});
const dniResponsable = ref(""); // dni_nie del usuario logado via ref_identidad_fk

// ── Carga inicial ──────────────────────────────────────────
onMounted(async () => {
    await cargarDniResponsable();
    await cargarIncidencias();
});

// Busca en /usuarios el login actual y extrae ref_identidad_fk (= dni_nie del profesor)
const cargarDniResponsable = async () => {
    try {
        const res       = await axios.get(`${API_URL}/usuarios${Z}`);
        const miUsuario = res.data.find(u => u.login === usuario.login);
        if (miUsuario?.ref_identidad_fk) {
            dniResponsable.value = miUsuario.ref_identidad_fk;
        } else {
            dniResponsable.value = usuario.login; // fallback si no tiene ref
            console.warn("No se encontró ref_identidad_fk, usando login como fallback");
        }
    } catch (error) {
        console.error("Error buscando DNI del responsable:", error);
        dniResponsable.value = usuario.login;
    }
};

const cargarIncidencias = async () => {
    cargando.value = true;
    try {
        const res         = await axios.get(`${API_URL}/incidencias${Z}`);
        incidencias.value = res.data;

        // Inicializa el objeto de resolución para cada incidencia
        res.data.forEach(inc => {
            if (!resoluciones[inc.id]) {
            resoluciones[inc.id] = { comentario: "" };
            }
        });
    } catch (error) {
        console.error("Error cargando incidencias:", error);
        mostrarMensaje("❌ No se pudieron cargar las incidencias", true);
    } finally {
        cargando.value = false;
    }
};

// ── Filtrado y ordenación ──────────────────────────────────
const incidenciasFiltradas = computed(() => {
    return incidencias.value
        .filter(inc => {
            const porEstado    = filtroEstado.value === "todas" || inc.estado_incidencia_id === filtroEstado.value;
            
            return porEstado;
        })
        .sort((a, b) => {
            // Pendientes siempre primero, luego por prioridad dentro de cada grupo
            if (a.estado_incidencia_id !== b.estado_incidencia_id) {
                return a.estado_incidencia_id === ESTADO_PENDIENTE ? -1 : 1;
            }
            const orden = { Alta: 0, Media: 1, Baja: 2 };
            return (orden[a.prioridad] ?? 3) - (orden[b.prioridad] ?? 3);
        });
});

// ── Contadores ─────────────────────────────────────────────
const totalPendientes = computed(() =>
    incidencias.value.filter(i => i.estado_incidencia_id === ESTADO_PENDIENTE).length
);
const totalResueltas = computed(() =>
    incidencias.value.filter(i => i.estado_incidencia_id === ESTADO_RESUELTA).length
);

// ── PUT — resolver incidencia ──────────────────────────────
const resolver = async (id) => {
    const datos = resoluciones[id];
    if (!datos?.comentario) return;

    resolviendo[id] = true;
    try {
        await axios.put(`${API_URL}/incidencias/${id}${Z}`, {
            estado_incidencia_id:      ESTADO_RESUELTA,
            comentarios_resolucion:    datos.comentario,
            responsable_resolucion_id: dniResponsable.value,
            fecha_resolucion:          new Date().toISOString().slice(0, 10),
            zusuario:                  ZUSUARIO
        });

        mostrarMensaje("✅ Incidencia marcada como resuelta", false);
        await cargarIncidencias();
    } catch (error) {
        console.error("Error PUT incidencia:", error.response?.data);
        mostrarMensaje("❌ No se pudo resolver la incidencia", true);
    } finally {
        resolviendo[id] = false;
        setTimeout(() => mensaje.value = "", 3000);
    }
};

const mostrarMensaje = (texto, esError) => {
    mensaje.value      = texto;
    mensajeError.value = esError;
};
</script>

<style scoped>
.page {
    padding: 32px;
    display: flex;
    justify-content: center;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    max-width: 720px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

h2 { color: #2c3e50; }

.filtros {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
}

.filtros select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
}

.btn-refrescar {
    padding: 7px 14px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background-color 0.2s;
}
.btn-refrescar:hover { background-color: #2980b9; }

.msg-ok       { color: #42b983; font-weight: bold; }
.msg-error    { color: #e74c3c; font-weight: bold; }
.msg-cargando { color: #888; font-size: 0.9rem; }

.vacio {
    text-align: center;
    color: #aaa;
    padding: 40px 0;
    font-size: 0.95rem;
}

.incidencia-item {
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.pendiente { border-left-color: #e67e22; background: #fff9f4; }
.resuelta  { border-left-color: #42b983; background: #f4fff9; }

.inc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.badges { display: flex; gap: 6px; }

.badge {
    font-size: 0.75rem;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: bold;
}

.badge-pending   { background: #ffecd2; color: #e67e22; }
.badge-ok        { background: #d4f5e9; color: #27ae60; }
.prioridad-alta  { background: #fde8e8; color: #e74c3c; }
.prioridad-media { background: #fef9e7; color: #f39c12; }
.prioridad-baja  { background: #eafaf1; color: #27ae60; }

.descripcion { color: #555; font-size: 0.92rem; }
small { color: #888; font-size: 0.8rem; }

.resolucion {
    background: #eafaf1;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.88rem;
    color: #27ae60;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.resolver-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.responsable-info { color: #3498db; font-size: 0.82rem; }

.resolver-form input {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: inherit;
    transition: border-color 0.2s;
}
.resolver-form input:focus { outline: none; border-color: #42b983; }

.resolver-form textarea {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.2s;
}
.resolver-form textarea:focus { outline: none; border-color: #42b983; }

.resolver-form button {
    align-self: flex-end;
    padding: 8px 20px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}
.resolver-form button:hover:not(:disabled) { background-color: #369870; }
.resolver-form button:disabled { background-color: #aaa; cursor: not-allowed; }

.contador {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
    padding-top: 8px;
    border-top: 1px solid #f0f0f0;
}
</style>

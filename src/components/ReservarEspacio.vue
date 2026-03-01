<template>
    <div class="page">
        <div class="card">
            <h2>🏫 Reservar Espacio</h2>

            <!-- Formulario de reserva -->
            <form @submit.prevent="hacerReserva()">

                <!-- ESPACIO -->
                <div class="form-group">
                    <label>Espacio</label>
                    <select v-model="reserva.espacio_id" @change="seleccionarEspacio" required>
                        <option value="">-- Selecciona un espacio --</option>
                        <option v-for="e in espacios" :key="e.id" :value="e.id"
                            :disabled="e.estado_operativo !== 'operativa'">
                            {{ e.nombre }} — Planta {{ e.ubicacion_planta }}
                            {{ e.estado_operativo !== 'operativa' ? '(No disponible)' : '' }}
                        </option>
                    </select>
                </div>

                <!-- Info del espacio seleccionado -->
                <div v-if="espacioSeleccionado" class="espacio-info">
                    <p>📍 <strong>Planta:</strong> {{ espacioSeleccionado.ubicacion_planta }}</p>
                    <p>👥 <strong>Capacidad:</strong> {{ espacioSeleccionado.capacidad_max }} personas</p>
                    <p>🖥️ <strong>Equipamiento:</strong> {{ espacioSeleccionado.equipamiento }}</p>
                    <p>🟢 <strong>Estado:</strong> {{ espacioSeleccionado.estado_operativo }}</p>
                </div>

                <!-- FECHA -->
                <div class="form-group">
                    <label>Fecha</label>
                    <input type="date" v-model="reserva.fecha_reserva" :min="hoy" required>
                </div>

                <!-- HORARIO -->
                <div class="form-group">
                    <label>Horario</label>
                    <select v-model="reserva.horario_id" :disabled="!reserva.fecha_reserva || !reserva.espacio_id"
                        required>
                        <option value="">
                            {{ !reserva.espacio_id ? '-- Primero selecciona un espacio --' : !reserva.fecha_reserva ?
                                '-- Primero selecciona una fecha --' : '-- Selecciona un horario --' }}
                        </option>
                        <option v-for="h in horariosDisponibles" :key="h.id" :value="h.id">
                            {{ h.nombre }} — {{ h.hora_inicio }} a {{ h.hora_fin }} ({{ h.turno_id }})
                        </option>
                    </select>
                    <small
                        v-if="reserva.fecha_reserva && reserva.espacio_id && horariosDisponibles.length === 0 && !cargandoHorarios"
                        class="msg-aviso">
                        ⚠️ No hay horarios disponibles para esta fecha
                    </small>
                    <p v-if="cargandoHorarios" class="msg-cargando">⏳ Cargando horarios...</p>
                    <p v-if="errorHorarios" class="msg-error">❌ No se pudieron cargar los horarios</p>
                </div>

                <!-- MOTIVO -->
                <div class="form-group">
                    <label>Motivo</label>
                    <input v-model="reserva.motivo_reserva" placeholder="¿Para qué necesitas el espacio?" required>
                </div>

                <button type="submit" :disabled="enviando">
                    {{ enviando ? 'Reservando...' : 'Reservar espacio' }}
                </button>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <!-- Mis reservas -->
            <div v-if="misReservas.length > 0" class="lista">
                <h3>📅 Mis reservas</h3>
                <div v-for="r in misReservas" :key="r.id" class="reserva-item">
                    <div class="reserva-header">
                        <strong>{{ nombreEspacio(r.espacio_id) }}</strong>
                        <button class="btn-cancelar" @click="cancelarReserva(r.id)">Cancelar</button>
                    </div>
                    <small>
                        📅 {{ r.fecha_reserva }} |
                        🕐 {{ nombreHorario(r.horario_id) }}
                    </small>
                    <p>{{ r.motivo_reserva }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL = URL;
const ZUSUARIO = "ivan";
const Z = `?zusuario=${ZUSUARIO}`;

// ── Estado ────────────────────────────────────────────────
const espacios = ref([]);
const horarios = ref([]);      // todos los horarios de la BD
const todasLasReservas = ref([]);      // todas las reservas para filtrar por fecha
const misReservas = ref([]);
const espacioSeleccionado = ref(null);
const mensaje = ref("");
const mensajeError = ref(false);
const enviando = ref(false);
const cargandoHorarios = ref(false);
const errorHorarios = ref(false);

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");
const hoy = new Date().toISOString().slice(0, 10);

const reserva = ref({
    espacio_id: "",
    horario_id: "",
    usuario_login: usuario.login || "",
    fecha_reserva: "",
    motivo_reserva: "",
    zfecha: hoy,
    zusuario: ZUSUARIO
});

// ── Carga inicial ─────────────────────────────────────────
onMounted(async () => {
    await cargarEspacios();
    await cargarHorarios();
    await cargarTodasLasReservas();
    await cargarMisReservas();
});

const cargarEspacios = async () => {
    try {
        const res = await axios.get(`${API_URL}/espacios${Z}`);
        espacios.value = res.data;
    } catch (error) {
        console.error("Error cargando espacios:", error);
    }
};

const cargarHorarios = async () => {
    cargandoHorarios.value = true;
    errorHorarios.value = false;
    try {
        const res = await axios.get(`${API_URL}/horarios${Z}`);
        horarios.value = res.data;
    } catch (error) {
        console.error("Error cargando horarios:", error);
        errorHorarios.value = true;
    } finally {
        cargandoHorarios.value = false;
    }
};

// Carga TODAS las reservas para poder filtrar por fecha
const cargarTodasLasReservas = async () => {
    try {
        const res = await axios.get(`${API_URL}/reservas${Z}`);
        todasLasReservas.value = res.data;
    } catch (error) {
        console.error("Error cargando reservas:", error);
    }
};

const cargarMisReservas = async () => {
    try {
        const res = await axios.get(`${API_URL}/reservas${Z}`);
        misReservas.value = res.data.filter(r => r.usuario_login === usuario.login);
    } catch (error) {
        console.error("Error cargando mis reservas:", error);
    }
};

// ── Horarios disponibles para la fecha y espacio seleccionados ───────
// Un horario está ocupado solo si ya hay una reserva con la misma fecha Y el mismo espacio
const horariosDisponibles = computed(() => {
    if (!reserva.value.fecha_reserva || !reserva.value.espacio_id) return [];

    console.log("Todas las reservas:", todasLasReservas.value)  // ← añade esto
    console.log("Filtrando por fecha:", reserva.value.fecha_reserva, "espacio:", reserva.value.espacio_id)

    const ocupados = new Set(
        todasLasReservas.value
            .filter(r =>
                r.fecha_reserva.slice(0,10) === reserva.value.fecha_reserva &&
                r.espacio_id === reserva.value.espacio_id
            )
            .map(r => r.horario_id)
    );

    console.log("Ocupados:", [...ocupados])
    return horarios.value.filter(h => !ocupados.has(h.id));
});

// Resetea el horario elegido cuando cambia la fecha o el espacio
watch(() => reserva.value.fecha_reserva, () => {
    reserva.value.horario_id = "";
});
watch(() => reserva.value.espacio_id, () => {
    reserva.value.horario_id = "";
});

// ── Helpers ───────────────────────────────────────────────
const seleccionarEspacio = () => {
    espacioSeleccionado.value =
        espacios.value.find(e => e.id === reserva.value.espacio_id) || null;
};

const nombreEspacio = (id) => {
    const e = espacios.value.find(e => e.id === id);
    return e ? e.nombre : id;
};

const nombreHorario = (id) => {
    const h = horarios.value.find(h => h.id === id);
    return h ? `${h.nombre} (${h.hora_inicio} - ${h.hora_fin})` : id;
};

// ── Hacer reserva ─────────────────────────────────────────
const hacerReserva = async () => {
    enviando.value = true;
    mensaje.value = "";
    mensajeError.value = false;

    try {
        reserva.value.zfecha = new Date().toISOString().slice(0, 10);
        reserva.value.usuario_login = usuario.login || ZUSUARIO;

        const response = await axios.post(
            `${API_URL}/reservas?zusuario=${ZUSUARIO}`,
            reserva.value
        );

        console.log("Reserva creada:", response.data);
        mensaje.value = "✅ Espacio reservado correctamente";

        await cargarTodasLasReservas();
        await cargarMisReservas();

        // Limpia el formulario
        reserva.value = {
            espacio_id: "",
            horario_id: "",
            usuario_login: usuario.login || "",
            fecha_reserva: "",
            motivo_reserva: "",
            zfecha: new Date().toISOString().slice(0, 10),
            zusuario: ZUSUARIO
        };
        espacioSeleccionado.value = null;

        setTimeout(() => mensaje.value = "", 3000);

    } catch (error) {
        console.error("Error al reservar:", error.response?.data);
        mensajeError.value = true;
        const errorServidor = error.response?.data?.error || error.response?.data?.motivo;
        mensaje.value = errorServidor ? `❌ ${errorServidor}` : "❌ No se pudo realizar la reserva";
    } finally {
        enviando.value = false;
    }
};

// ── Cancelar reserva ──────────────────────────────────────
const cancelarReserva = async (id) => {
    try {
        await axios.delete(`${API_URL}/reservas/${id}?zusuario=${ZUSUARIO}`);
        await cargarTodasLasReservas();
        await cargarMisReservas();
        mensaje.value = "✅ Reserva cancelada";
        mensajeError.value = false;
        setTimeout(() => mensaje.value = "", 2000);
    } catch (error) {
        console.error("Error al cancelar:", error.response?.data);
        mensaje.value = "❌ No se pudo cancelar la reserva";
        mensajeError.value = true;
    }
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
    max-width: 640px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

h2,
h3 {
    color: #2c3e50;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

label {
    font-size: 0.85rem;
    font-weight: bold;
    color: #444;
}

input,
select {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

input:focus,
select:focus {
    outline: none;
    border-color: #42b983;
}

.espacio-info {
    background: #f0f9f6;
    border: 1px solid #d4f5e9;
    border-radius: 8px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 0.9rem;
    color: #2c3e50;
}

button[type="submit"] {
    padding: 12px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}

button[type="submit"]:hover:not(:disabled) {
    background-color: #369870;
}

button[type="submit"]:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}

.msg-ok {
    color: #42b983;
    font-weight: bold;
}

.msg-error {
    color: #e74c3c;
    font-weight: bold;
}

.msg-cargando {
    color: #888;
    font-size: 0.85rem;
}

.lista {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.reserva-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 14px;
    border-left: 4px solid #42b983;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.reserva-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.btn-cancelar {
    padding: 4px 12px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-cancelar:hover {
    background-color: #c0392b;
}

small {
    color: #888;
    font-size: 0.8rem;
}

p {
    color: #555;
    font-size: 0.9rem;
}
</style>

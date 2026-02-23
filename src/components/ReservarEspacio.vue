<template>
    <div class="page">
        <div class="card">
            <h2>🏫 Reservar Espacio</h2>

            <!-- Formulario de reserva -->
            <form @submit.prevent="hacerReserva()">
                <div class="form-group">
                    <label>Espacio</label>
                    <select v-model="reserva.espacio_id" @change="seleccionarEspacio" required>
                        <option value="">-- Selecciona un espacio --</option>
                        <option
                            v-for="e in espacios"
                            :key="e.id"
                            :value="e.id"
                            :disabled="e.estado_operativo !== 'operativa'"
                        >
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

                <div class="form-group">
                    <label>Fecha</label>
                    <input type="date" v-model="reserva.fecha" :min="hoy" required>
                </div>

                <div class="form-row">
                    <div class="form-group">
                        <label>Hora inicio</label>
                        <select v-model="reserva.hora_inicio" required>
                            <option value="">--</option>
                            <option v-for="h in horas" :key="h" :value="h">{{ h }}</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Hora fin</label>
                        <select v-model="reserva.hora_fin" required>
                            <option value="">--</option>
                            <option v-for="h in horas" :key="h" :value="h">{{ h }}</option>
                        </select>
                    </div>
                </div>

                <div class="form-group">
                    <label>Motivo</label>
                    <input v-model="reserva.motivo" placeholder="¿Para qué necesitas el espacio?" required>
                </div>

                <button type="submit">Reservar espacio</button>
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
                    <small>📅 {{ r.fecha }} | 🕐 {{ r.hora_inicio }} - {{ r.hora_fin }}</small>
                    <p>{{ r.motivo }}</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";

const API_URL = "http://100.27.173.196:3000";
const ZUSUARIO = "ivan";

const espacios = ref([]);
const reservas = ref([]);
const espacioSeleccionado = ref(null);
const mensaje = ref("");
const mensajeError = ref(false);

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

const hoy = new Date().toISOString().slice(0, 10);

const horas = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

const reserva = ref({
    espacio_id: "",
    fecha: "",
    hora_inicio: "",
    hora_fin: "",
    motivo: ""
});

onMounted(async () => {
    try {
        const response = await axios.get(`${API_URL}/espacios?zusuario=${ZUSUARIO}`);
        espacios.value = response.data;
    } catch (error) {
        console.error("Error cargando espacios:", error);
    }
});

const seleccionarEspacio = () => {
    espacioSeleccionado.value = espacios.value.find(e => e.id === reserva.value.espacio_id) || null;
};

const misReservas = computed(() =>
    reservas.value.filter(r => r.reservadoPor === usuario.login)
);

const nombreEspacio = (id) => {
    const e = espacios.value.find(e => e.id === id);
    return e ? e.nombre : id;
};

const hacerReserva = () => {
    // Validar que hora fin sea posterior a hora inicio
    if (reserva.value.hora_inicio >= reserva.value.hora_fin) {
        mensaje.value = "❌ La hora de fin debe ser posterior a la hora de inicio";
        mensajeError.value = true;
        return;
    }

    // Comprobar conflicto de reservas
    const conflicto = reservas.value.find(r =>
        r.espacio_id === reserva.value.espacio_id &&
        r.fecha === reserva.value.fecha &&
        r.hora_inicio < reserva.value.hora_fin &&
        r.hora_fin > reserva.value.hora_inicio
    );

    if (conflicto) {
        mensaje.value = `❌ El espacio ya está reservado de ${conflicto.hora_inicio} a ${conflicto.hora_fin} ese día`;
        mensajeError.value = true;
        return;
    }

    reservas.value.push({
        id: Date.now(),
        ...reserva.value,
        reservadoPor: usuario.login
    });

    mensaje.value = "✅ Espacio reservado correctamente";
    mensajeError.value = false;
    reserva.value = { espacio_id: "", fecha: "", hora_inicio: "", hora_fin: "", motivo: "" };
    espacioSeleccionado.value = null;

    setTimeout(() => mensaje.value = "", 3000);
};

const cancelarReserva = (id) => {
    reservas.value = reservas.value.filter(r => r.id !== id);
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
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

h2, h3 { color: #2c3e50; }

.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}

label {
    font-size: 0.85rem;
    font-weight: bold;
    color: #444;
}

input, select {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

input:focus, select:focus {
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

button[type="submit"]:hover { background-color: #369870; }

.msg-ok    { color: #42b983; font-weight: bold; }
.msg-error { color: #e74c3c; font-weight: bold; }

.lista { display: flex; flex-direction: column; gap: 12px; }

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

.btn-cancelar:hover { background-color: #c0392b; }

small { color: #888; font-size: 0.8rem; }
p { color: #555; font-size: 0.9rem; }
</style>

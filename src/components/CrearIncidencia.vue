<template>
    <div class="page">
        <div class="card">
            <h2>🔧 Crear Incidencia</h2>

            <form @submit.prevent="enviarIncidencia()">
                <div class="form-group">
                    <label>Título</label>
                    <input v-model="incidencia.titulo" placeholder="Describe brevemente el problema" required>
                </div>

                <div class="form-group">
                    <label>Descripción</label>
                    <textarea v-model="incidencia.descripcion" placeholder="Explica el problema con detalle" rows="4" required></textarea>
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

                <div class="form-group">
                    <label>Prioridad</label>
                    <select v-model="incidencia.prioridad" required>
                        <option value="">-- Selecciona prioridad --</option>
                        <option value="Baja">🟢 Baja</option>
                        <option value="Media">🟡 Media</option>
                        <option value="Alta">🔴 Alta</option>
                    </select>
                </div>

                <button type="submit">Enviar incidencia</button>
            </form>

            <p v-if="mensaje" class="msg-ok">{{ mensaje }}</p>

            <div v-if="misIncidencias.length > 0" class="lista">
                <h3>📋 Mis incidencias</h3>
                <div v-for="inc in misIncidencias" :key="inc.id" class="incidencia-item" :class="inc.estado === 'Resuelta' ? 'resuelta' : 'pendiente'">
                    <div class="inc-header">
                        <strong>{{ inc.titulo }}</strong>
                        <span class="badge" :class="inc.estado === 'Resuelta' ? 'badge-ok' : 'badge-pending'">
                            {{ inc.estado }}
                        </span>
                    </div>
                    <p>{{ inc.descripcion }}</p>
                    <small>📍 Espacio: {{ inc.espacio_id }} | ⚡ {{ inc.prioridad }} | 📅 {{ inc.fecha }}</small>
                    <div v-if="inc.resolucion" class="resolucion">
                        <strong>✅ Resolución:</strong> {{ inc.resolucion }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { incidenciasStore } from "@/store/incidencias.js";

const API_URL = "http://100.27.173.196:3000";
const ZUSUARIO = "ivan";

const espacios = ref([]);
const mensaje = ref("");

const usuario = JSON.parse(sessionStorage.getItem("usuario") || "{}");

const incidencia = ref({
    titulo: "",
    descripcion: "",
    espacio_id: "",
    prioridad: ""
});

onMounted(async () => {
    try {
        const response = await axios.get(`${API_URL}/espacios?zusuario=${ZUSUARIO}`);
        espacios.value = response.data;
    } catch (error) {
        console.error("Error cargando espacios:", error);
    }
});

const misIncidencias = computed(() =>
    incidenciasStore.lista.filter(i => i.creadaPor === usuario.login)
);

const enviarIncidencia = () => {
    incidenciasStore.agregar({
        ...incidencia.value,
        creadaPor: usuario.login
    });

    mensaje.value = "✅ Incidencia creada correctamente";
    incidencia.value = { titulo: "", descripcion: "", espacio_id: "", prioridad: "" };

    setTimeout(() => mensaje.value = "", 3000);
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

h2 { color: #2c3e50; }
h3 { color: #2c3e50; margin-top: 8px; }

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

input, select, textarea {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    font-family: inherit;
    transition: border-color 0.2s;
}

input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #42b983;
}

button {
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

button:hover { background-color: #369870; }

.msg-ok { color: #42b983; font-weight: bold; }

.lista { display: flex; flex-direction: column; gap: 12px; }

.incidencia-item {
    border-radius: 8px;
    padding: 14px;
    border-left: 4px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.pendiente { border-left-color: #e67e22; background: #fff9f4; }
.resuelta  { border-left-color: #42b983; background: #f4fff9; }

.inc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.badge {
    font-size: 0.75rem;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: bold;
}

.badge-pending { background: #ffecd2; color: #e67e22; }
.badge-ok      { background: #d4f5e9; color: #27ae60; }

small { color: #888; font-size: 0.8rem; }

.resolucion {
    background: #eafaf1;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 0.88rem;
    color: #27ae60;
}
</style>

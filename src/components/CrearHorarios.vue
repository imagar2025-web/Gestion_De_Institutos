<template>
    <div class="page">
        <div class="card">

            <!-- FORMULARIO -->
            <h3>{{ modoEdicion ? '✏️ Editar Horario' : '➕ Crear Horario' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarHorario() : insertarHorario()">
                <div class="form-group">
                    <label>ID</label>
                    <input v-model="horario.id" :disabled="modoEdicion" required>
                    <small v-if="modoEdicion" class="hint">El ID no se puede modificar</small>
                </div>
                <div class="form-group">
                    <label>Nombre</label>
                    <input v-model="horario.nombre" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Hora inicio</label>
                        <input type="time" v-model="horario.hora_inicio" required>
                    </div>
                    <div class="form-group">
                        <label>Hora fin</label>
                        <input type="time" v-model="horario.hora_fin" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Turno ID</label>
                    <input v-model="horario.turno_id" required>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar horario' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-cancelar" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensajeHorario" :class="mensajeError ? 'msg-error' : 'msg-ok'">
                {{ mensajeHorario }}
            </p>

            <!-- TABLA -->
            <div class="tabla-header">
                <h3>📋 Horarios registrados</h3>
                <button class="btn-refrescar" @click="cargarHorarios">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>

            <div v-else-if="horarios.length === 0" class="vacio">
                No hay horarios registrados
            </div>

            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Hora inicio</th>
                            <th>Hora fin</th>
                            <th>Turno</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="h in horarios" :key="h.id" :class="{ 'fila-editando': modoEdicion && horario.id === h.id }">
                            <td>{{ h.id }}</td>
                            <td>{{ h.nombre }}</td>
                            <td>{{ h.hora_inicio }}</td>
                            <td>{{ h.hora_fin }}</td>
                            <td>{{ h.turno_id }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(h)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarHorario(h.id)">🗑️ Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL = URL;
const Z      = "?zusuario=ivan";

// ── Estado ─────────────────────────────────────────────────
const horarios      = ref([]);
const mensajeHorario = ref("");
const mensajeError  = ref(false);
const cargando      = ref(false);
const modoEdicion   = ref(false);

const horarioVacio = () => ({
    id:          "",
    nombre:      "",
    hora_inicio: "",
    hora_fin:    "",
    turno_id:    "",
    zfecha:      new Date().toISOString().slice(0, 10),
    zusuario:    "ivan"
});

const horario = ref(horarioVacio());

// ── Carga inicial ──────────────────────────────────────────
onMounted(() => cargarHorarios());

// ── GET ────────────────────────────────────────────────────
const cargarHorarios = async () => {
    cargando.value = true;
    try {
        const res = await axios.get(`${API_URL}/horarios${Z}`);
        horarios.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar los horarios", true);
    } finally {
        cargando.value = false;
    }
};

// ── POST ───────────────────────────────────────────────────
const insertarHorario = async () => {
    try {
        mostrarMensaje("Enviando...", false);
        await axios.post(`${API_URL}/horarios${Z}`, horario.value);
        mostrarMensaje("✅ Horario creado correctamente", false);
        horario.value = horarioVacio();
        await cargarHorarios();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mostrarMensaje(`❌ El horario "${horario.value.id}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

// ── PUT ────────────────────────────────────────────────────
const cargarEnFormulario = (h) => {
    // Copia los datos de la fila al formulario y activa modo edición
    horario.value = { ...h, zfecha: new Date().toISOString().slice(0, 10), zusuario: "ivan" };
    modoEdicion.value = true;
    mensajeHorario.value = "";
    // Hace scroll al formulario
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const actualizarHorario = async () => {
    try {
        mostrarMensaje("Guardando...", false);
        await axios.put(`${API_URL}/horarios/${horario.value.id}${Z}`, horario.value);
        mostrarMensaje("✅ Horario actualizado correctamente", false);
        cancelarEdicion();
        await cargarHorarios();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar el horario", true);
    }
};

const cancelarEdicion = () => {
    horario.value     = horarioVacio();
    modoEdicion.value = false;
    mensajeHorario.value = "";
};

// ── DELETE ─────────────────────────────────────────────────
const eliminarHorario = async (id) => {
    if (!confirm(`¿Seguro que quieres eliminar el horario "${id}"?`)) return;
    try {
        await axios.delete(`${API_URL}/horarios/${id}${Z}`);
        mostrarMensaje("✅ Horario eliminado correctamente", false);
        // Si estaba en edición ese mismo, cancela
        if (modoEdicion.value && horario.value.id === id) cancelarEdicion();
        await cargarHorarios();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar el horario", true);
    }
};

// ── Helper mensaje ─────────────────────────────────────────
const mostrarMensaje = (texto, esError) => {
    mensajeHorario.value = texto;
    mensajeError.value   = esError;
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
    max-width: 860px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    gap: 20px;
}

h3 { color: #2c3e50; margin: 0; }

/* Formulario */
.form-group {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-bottom: 12px;
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

input {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

input:focus {
    outline: none;
    border-color: #42b983;
}

input:disabled {
    background: #f0f0f0;
    color: #888;
    cursor: not-allowed;
}

.hint {
    color: #aaa;
    font-size: 0.78rem;
}

.form-botones {
    display: flex;
    gap: 10px;
    margin-top: 4px;
}

/* Botones */
.btn-primary {
    padding: 10px 20px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-primary:hover { background-color: #369870; }

.btn-cancelar {
    padding: 10px 20px;
    background-color: #95a5a6;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-cancelar:hover { background-color: #7f8c8d; }

.btn-refrescar {
    padding: 6px 14px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-refrescar:hover { background-color: #2980b9; }

/* Mensajes */
.msg-ok       { color: #42b983; font-weight: bold; }
.msg-error    { color: #e74c3c; font-weight: bold; }
.msg-cargando { color: #888; font-size: 0.9rem; }

/* Tabla */
.tabla-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.tabla-wrapper {
    overflow-x: auto;
}

table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

thead tr {
    background-color: #d5e8f0;
}

th {
    padding: 10px 14px;
    text-align: left;
    font-size: 0.82rem;
    color: #2c3e50;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.04em;
}

td {
    padding: 10px 14px;
    border-bottom: 1px solid #f0f0f0;
    color: #555;
}

tbody tr:hover { background-color: #f9f9f9; }

.fila-editando {
    background-color: #fff8e1 !important;
    border-left: 3px solid #f39c12;
}

.acciones {
    display: flex;
    gap: 8px;
}

.btn-editar {
    padding: 4px 10px;
    background-color: #f39c12;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-editar:hover { background-color: #d68910; }

.btn-eliminar {
    padding: 4px 10px;
    background-color: #e74c3c;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: background-color 0.2s;
}

.btn-eliminar:hover { background-color: #c0392b; }

.vacio {
    text-align: center;
    color: #aaa;
    padding: 30px 0;
    font-size: 0.95rem;
}
</style>
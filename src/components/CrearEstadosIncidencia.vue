// =============================================================================
// ARCHIVO: src/components/CrearEstadosIncidencia.vue — CRUD de estados de incidencia
// =============================================================================
// PROPÓSITO: Gestión de los estados del ciclo de incidencias (PENT, PROC, REST).
// ENDPOINTS MOCK: GET/POST/PUT/DELETE /estados_incidencia
// =============================================================================
<template>
    <div class="page">
        <div class="card">

            <h3>{{ modoEdicion ? '✏️ Editar Estado de Incidencia' : '➕ Crear Estado de Incidencia' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarEstado() : insertarEstado()">
                <div class="form-group">
                    <label>ID</label>
                    <input v-model="estado.id" :disabled="modoEdicion" required>
                    <small v-if="modoEdicion" class="hint">El ID no se puede modificar</small>
                </div>
                <div class="form-group">
                    <label>Nombre</label>
                    <input v-model="estado.nombre" required>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar estado' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-secundario" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <!-- TABLA -->
            <div class="tabla-header">
                <h3>📋 Estados de incidencia registrados</h3>
                <button class="btn-refrescar" @click="cargarEstados">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>

            <div v-else-if="estados.length === 0" class="vacio">
                No hay estados registrados
            </div>

            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Fecha</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="e in estados" :key="e.id"
                            :class="{ 'fila-editando': modoEdicion && estado.id === e.id }">
                            <td>{{ e.id }}</td>
                            <td>{{ e.nombre }}</td>
                            <td>{{ e.zfecha }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(e)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarEstado(e.id)">🗑️ Eliminar</button>
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
// MOCK: Antes se importaba axios para peticiones HTTP reales al servidor.
// import axios from "axios";
// Ahora usamos fakeApi que hace las mismas operaciones en memoria local.
import { fakeApi } from "@/mock/fakeApi";
// MOCK: La URL del servidor real ya no se usa.
// import { URL } from "@/variablesGlobales";
// URL original: http://44.207.19.239:3000

// MOCK: API_URL apunta a un placeholder. fakeApi solo necesita el nombre
// del recurso (ej: "espacios"), el dominio se ignora.
const API_URL = "http://mock";
const Z       = "?zusuario=ivan";

const estados      = ref([]);
const mensaje      = ref("");
const mensajeError = ref(false);
const cargando     = ref(false);
const modoEdicion  = ref(false);

const estadoVacio = () => ({
    id:       "",
    nombre:   "",
    zfecha:   new Date().toISOString().slice(0, 10),
    zusuario: "ivan"
});

const estado = ref(estadoVacio());

onMounted(() => cargarEstados());

// GET
const cargarEstados = async () => {
    cargando.value = true;
    try {
        const res = await fakeApi.get(`${API_URL}/estados_incidencia${Z}`);
        estados.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar los estados", true);
    } finally {
        cargando.value = false;
    }
};

// POST
const insertarEstado = async () => {
    try {
        mostrarMensaje("Enviando...", false);
        await fakeApi.post(`${API_URL}/estados_incidencia${Z}`, estado.value);
        mostrarMensaje("✅ Estado creado correctamente", false);
        estado.value = estadoVacio();
        await cargarEstados();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mostrarMensaje(`❌ El estado "${estado.value.id}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

// PUT
const cargarEnFormulario = (e) => {
    estado.value      = { ...e, zfecha: new Date().toISOString().slice(0, 10), zusuario: "ivan" };
    modoEdicion.value = true;
    mensaje.value     = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const actualizarEstado = async () => {
    try {
        mostrarMensaje("Guardando...", false);
        await fakeApi.put(`${API_URL}/estados_incidencia/${estado.value.id}${Z}`, estado.value);
        mostrarMensaje("✅ Estado actualizado correctamente", false);
        cancelarEdicion();
        await cargarEstados();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar el estado", true);
    }
};

const cancelarEdicion = () => {
    estado.value      = estadoVacio();
    modoEdicion.value = false;
    mensaje.value     = "";
};

// DELETE
const eliminarEstado = async (id) => {
    if (!confirm(`¿Seguro que quieres eliminar el estado "${id}"?`)) return;
    try {
        await fakeApi.delete(`${API_URL}/estados_incidencia/${id}${Z}`);
        mostrarMensaje("✅ Estado eliminado correctamente", false);
        if (modoEdicion.value && estado.value.id === id) cancelarEdicion();
        await cargarEstados();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar el estado", true);
    }
};

const mostrarMensaje = (texto, esError) => {
    mensaje.value      = texto;
    mensajeError.value = esError;
};
</script>

<style scoped>
.page { padding: 32px; display: flex; justify-content: center; }
.card { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 760px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; }
h3 { color: #2c3e50; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
label { font-size: 0.85rem; font-weight: bold; color: #444; }
input { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; }
input:focus { outline: none; border-color: #42b983; }
input:disabled { background: #f0f0f0; color: #888; cursor: not-allowed; }
.hint { color: #aaa; font-size: 0.78rem; }
.form-botones { display: flex; gap: 10px; margin-top: 4px; }
.btn-primary { padding: 10px 20px; background-color: #42b983; color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
.btn-primary:hover { background-color: #369870; }
.btn-secundario { padding: 10px 20px; background-color: #95a5a6; color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: bold; cursor: pointer; }
.btn-secundario:hover { background-color: #7f8c8d; }
.btn-refrescar { padding: 6px 14px; background-color: #3498db; color: white; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-refrescar:hover { background-color: #2980b9; }
.msg-ok { color: #42b983; font-weight: bold; }
.msg-error { color: #e74c3c; font-weight: bold; }
.msg-cargando { color: #888; font-size: 0.9rem; }
.tabla-header { display: flex; justify-content: space-between; align-items: center; }
.tabla-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
thead tr { background-color: #d5e8f0; }
th { padding: 10px 14px; text-align: left; font-size: 0.82rem; color: #2c3e50; font-weight: bold; text-transform: uppercase; letter-spacing: 0.04em; }
td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; color: #555; }
tbody tr:hover { background-color: #f9f9f9; }
.fila-editando { background-color: #fff8e1 !important; border-left: 3px solid #f39c12; }
.acciones { display: flex; gap: 8px; }
.btn-editar { padding: 4px 10px; background-color: #f39c12; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
.btn-editar:hover { background-color: #d68910; }
.btn-eliminar { padding: 4px 10px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
.btn-eliminar:hover { background-color: #c0392b; }
.vacio { text-align: center; color: #aaa; padding: 30px 0; font-size: 0.95rem; }
</style>

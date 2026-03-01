<template>
    <div class="page">
        <div class="card">

            <h3>{{ modoEdicion ? '✏️ Editar Etapa' : '➕ Crear Etapa' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarEtapa() : insertarEtapa()">
                <div class="form-group">
                    <label>ID</label>
                    <input v-model="etapa.id" :disabled="modoEdicion" required>
                    <small v-if="modoEdicion" class="hint">El ID no se puede modificar</small>
                </div>
                <div class="form-group">
                    <label>Nombre</label>
                    <input v-model="etapa.nombre" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <input v-model="etapa.descripcion" required>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar etapa' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-secundario" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <div class="tabla-header">
                <h3>📋 Etapas registradas</h3>
                <button class="btn-refrescar" @click="cargarEtapas">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>
            <div v-else-if="etapas.length === 0" class="vacio">No hay etapas registradas</div>
            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="e in etapas" :key="e.id"
                            :class="{ 'fila-editando': modoEdicion && etapa.id === e.id }">
                            <td>{{ e.id }}</td>
                            <td>{{ e.nombre }}</td>
                            <td>{{ e.descripcion }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(e)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarEtapa(e.id)">🗑️ Eliminar</button>
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
const Z       = "?zusuario=ivan";

const etapas       = ref([]);
const mensaje      = ref("");
const mensajeError = ref(false);
const cargando     = ref(false);
const modoEdicion  = ref(false);

const etapaVacia = () => ({
    id:          "",
    nombre:      "",
    descripcion: "",
    zfecha:      new Date().toISOString().slice(0, 10),
    zusuario:    "ivan"
});

const etapa = ref(etapaVacia());

onMounted(() => cargarEtapas());

const cargarEtapas = async () => {
    cargando.value = true;
    try {
        const res = await axios.get(`${API_URL}/etapas${Z}`);
        etapas.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar las etapas", true);
    } finally {
        cargando.value = false;
    }
};

const insertarEtapa = async () => {
    try {
        mostrarMensaje("Enviando...", false);
        await axios.post(`${API_URL}/etapas${Z}`, etapa.value);
        mostrarMensaje("✅ Etapa creada correctamente", false);
        etapa.value = etapaVacia();
        await cargarEtapas();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mostrarMensaje(`❌ La etapa "${etapa.value.id}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

const cargarEnFormulario = (e) => {
    etapa.value       = { ...e, zfecha: new Date().toISOString().slice(0, 10), zusuario: "ivan" };
    modoEdicion.value = true;
    mensaje.value     = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const actualizarEtapa = async () => {
    try {
        mostrarMensaje("Guardando...", false);
        await axios.put(`${API_URL}/etapas/${etapa.value.id}${Z}`, etapa.value);
        mostrarMensaje("✅ Etapa actualizada correctamente", false);
        cancelarEdicion();
        await cargarEtapas();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar la etapa", true);
    }
};

const cancelarEdicion = () => {
    etapa.value       = etapaVacia();
    modoEdicion.value = false;
    mensaje.value     = "";
};

const eliminarEtapa = async (id) => {
    if (!confirm(`¿Seguro que quieres eliminar la etapa "${id}"?`)) return;
    try {
        await axios.delete(`${API_URL}/etapas/${id}${Z}`);
        mostrarMensaje("✅ Etapa eliminada correctamente", false);
        if (modoEdicion.value && etapa.value.id === id) cancelarEdicion();
        await cargarEtapas();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar la etapa", true);
    }
};

const mostrarMensaje = (texto, esError) => {
    mensaje.value      = texto;
    mensajeError.value = esError;
};
</script>

<style scoped>
.page { padding: 32px; display: flex; justify-content: center; }
.card { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 860px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; }
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

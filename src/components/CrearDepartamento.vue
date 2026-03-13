<template>
    <div class="page">
        <div class="card">

            <!-- FORMULARIO -->
            <h3>{{ modoEdicion ? '✏️ Editar Departamento' : '➕ Crear Departamento' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarDepartamento() : insertarDepartamento()">
                <div class="form-group">
                    <label>ID</label>
                    <input v-model="departamento.id" :disabled="modoEdicion" required>
                    <small v-if="modoEdicion" class="hint">El ID no se puede modificar</small>
                </div>
                <div class="form-group">
                    <label>Nombre del departamento</label>
                    <input v-model="departamento.nombre" required>
                </div>
                <div class="form-group">
                    <label>Ubicación</label>
                    <input v-model="departamento.ubicacion" required>
                </div>
                <div class="form-group">
                    <label>Correo de contacto</label>
                    <input type="email" v-model="departamento.correo_contacto" required>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar departamento' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-secundario" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <!-- TABLA -->
            <div class="tabla-header">
                <h3>📋 Departamentos registrados</h3>
                <button class="btn-refrescar" @click="cargarDepartamentos">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>

            <div v-else-if="departamentos.length === 0" class="vacio">
                No hay departamentos registrados
            </div>

            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Ubicación</th>
                            <th>Correo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="d in departamentos" :key="d.id"
                            :class="{ 'fila-editando': modoEdicion && departamento.id === d.id }">
                            <td>{{ d.id }}</td>
                            <td>{{ d.nombre }}</td>
                            <td>{{ d.ubicacion }}</td>
                            <td>{{ d.correo_contacto }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(d)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarDepartamento(d.id)">🗑️ Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<script setup>

// ─────────────────────────────────────────────────────────────
// CrearDepartamento.vue  —  CRUD completo de Departamento
// Tabla maestra de departamentos del centro.
// Patrón común a todos los CRUDs del proyecto:
//   - GET al montar → lista en tabla
//   - POST formulario → insertar
//   - PUT fila → cargarEnFormulario() activa modoEdicion, luego actualizar
//   - DELETE fila → confirmar con window.confirm(), luego eliminar
//   - modoEdicion: controla si el formulario está en modo crear o editar
//   - PK: id (deshabilitado en edición, no se puede cambiar)
// ─────────────────────────────────────────────────────────────

import { ref, onMounted } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL = URL;  // URL base de la API
const Z = "?zusuario=ivan";  // Parámetro de auditoría requerido por todos los endpoints

const departamentos = ref([]);
const mensaje       = ref("");
const mensajeError  = ref(false);
const cargando      = ref(false);
const modoEdicion   = ref(false);

const deptoVacio = () => ({
    id:              "",
    nombre:          "",
    ubicacion:       "",
    correo_contacto: "",
    zfecha:          new Date().toISOString().split("T")[0],  // Fecha de auditoría YYYY-MM-DD
    zusuario:        "ivan"  // Usuario que realiza la operación (requerido por la API)
});

const departamento = ref(deptoVacio());

onMounted(() => cargarDepartamentos());  // Carga inicial de datos al montar el componente

// GET
const cargarDepartamentos = async () => {  // GET → carga datos de la API y rellena la tabla
    cargando.value = true;  // Activa el spinner de carga
    try {
        const res = await axios.get(`${API_URL}/departamentos${Z}`);
        departamentos.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar los departamentos", true);
    } finally {
        cargando.value = false;  // El bloque finally apaga el spinner siempre, incluso si hay error
    }
};

// POST
const insertarDepartamento = async () => {  // POST → crea un nuevo registro en la BD
    try {
        mostrarMensaje("Enviando...", false);  // Feedback inmediato antes de esperar respuesta del servidor
        await axios.post(`${API_URL}/departamentos${Z}`, departamento.value);
        mostrarMensaje("✅ Departamento creado correctamente", false);
        departamento.value = deptoVacio();
        await cargarDepartamentos();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {  // Error de clave duplicada en la BD → mensaje específico al usuario
            mostrarMensaje(`❌ El departamento "${departamento.value.id}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

// PUT
const cargarEnFormulario = (d) => {  // GET → carga datos de la API y rellena la tabla
    departamento.value = { ...d, zfecha: new Date().toISOString().split("T")[0], zusuario: "ivan" };  // Fecha de auditoría YYYY-MM-DD
    modoEdicion.value  = true;
    mensaje.value      = "";
    window.scrollTo({ top: 0, behavior: "smooth" });  // Desplaza la vista al formulario para que el usuario vea los cambios
};

const actualizarDepartamento = async () => {  // PUT → actualiza el registro editado en la BD
    try {
        mostrarMensaje("Guardando...", false);
        await axios.put(`${API_URL}/departamentos/${departamento.value.id}${Z}`, departamento.value);
        mostrarMensaje("✅ Departamento actualizado correctamente", false);
        cancelarEdicion();  // Resetea el formulario y desactiva modoEdicion sin guardar cambios
        await cargarDepartamentos();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar el departamento", true);
    }
};

const cancelarEdicion = () => {
    departamento.value = deptoVacio();
    modoEdicion.value  = false;
    mensaje.value      = "";
};

// DELETE
const eliminarDepartamento = async (id) => {  // DELETE → elimina el registro tras confirmación
    if (!confirm(`¿Seguro que quieres eliminar el departamento "${id}"?`)) return;  // Confirmación nativa del navegador antes de borrar un registro
    try {
        await axios.delete(`${API_URL}/departamentos/${id}${Z}`);
        mostrarMensaje("✅ Departamento eliminado correctamente", false);
        if (modoEdicion.value && departamento.value.id === id) cancelarEdicion();  // Si se borra/cancela el que estaba en edición, también cancela el modo
        await cargarDepartamentos();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar el departamento", true);
    }
};

const mostrarMensaje = (texto, esError) => {  // Helper: actualiza mensaje + flag de error en un solo lugar
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
.btn-secundario { padding: 10px 20px; background-color: #95a5a6; color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
.btn-secundario:hover { background-color: #7f8c8d; }
.btn-refrescar { padding: 6px 14px; background-color: #3498db; color: white; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; transition: background-color 0.2s; }
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
.btn-editar { padding: 4px 10px; background-color: #f39c12; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: background-color 0.2s; }
.btn-editar:hover { background-color: #d68910; }
.btn-eliminar { padding: 4px 10px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: background-color 0.2s; }
.btn-eliminar:hover { background-color: #c0392b; }
.vacio { text-align: center; color: #aaa; padding: 30px 0; font-size: 0.95rem; }
</style>

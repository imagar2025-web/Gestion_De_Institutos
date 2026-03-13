<template>
    <div class="page">
        <div class="card">

            <h3>{{ modoEdicion ? '✏️ Editar Profesor' : '➕ Crear Profesor' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarProfesor() : insertarProfesor()">
                <div class="form-row">
                    <div class="form-group">
                        <label>DNI / NIE</label>
                        <input v-model="profesor.dni_nie" :disabled="modoEdicion" required>
                        <small v-if="modoEdicion" class="hint">El DNI no se puede modificar</small>
                    </div>
                    <div class="form-group">
                        <label>Rol</label>
                        <select v-model="profesor.rol_id" required>
                            <option value="">-- Selecciona un rol --</option>
                            <option v-for="r in rolesDisponibles" :key="r" :value="r">{{ r }}</option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input v-model="profesor.nombre" required>
                    </div>
                    <div class="form-group">
                        <label>Apellidos</label>
                        <input v-model="profesor.apellidos" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Correo institucional</label>
                    <input type="email" v-model="profesor.correo_institucional" required>
                </div>
                <div class="form-group">
                    <label>Departamento ID</label>
                    <select v-model="profesor.departamento_id" required>
                        <option value="">-- Selecciona un departamento --</option>
                        <option v-for="d in departamentos" :key="d.id" :value="d.id">
                            {{ d.id }} — {{ d.nombre }}
                        </option>
                    </select>
                </div>
                <div class="form-group" v-if="!modoEdicion">
                    <label>Password</label>
                    <input type="password" v-model="profesor.password_hash" required>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar profesor' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-secundario" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <!-- TABLA -->
            <div class="tabla-header">
                <h3>📋 Profesores registrados</h3>
                <button class="btn-refrescar" @click="cargarProfesores">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>

            <div v-else-if="profesores.length === 0" class="vacio">
                No hay profesores registrados
            </div>

            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>DNI/NIE</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Correo</th>
                            <th>Departamento</th>
                            <th>Rol</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="p in profesores" :key="p.dni_nie"
                            :class="{ 'fila-editando': modoEdicion && profesor.dni_nie === p.dni_nie }">
                            <td>{{ p.dni_nie }}</td>
                            <td>{{ p.nombre }}</td>
                            <td>{{ p.apellidos }}</td>
                            <td>{{ p.correo_institucional }}</td>
                            <td>{{ p.departamento_id }}</td>
                            <td>{{ p.rol_id }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(p)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarProfesor(p.dni_nie)">🗑️ Eliminar</button>
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
// CrearProfesores.vue  —  CRUD completo de Profesor
// Profesores del centro. PK = DNI/NIE. Incluye rol y departamento.
// Patrón común a todos los CRUDs del proyecto:
//   - GET al montar → lista en tabla
//   - POST formulario → insertar
//   - PUT fila → cargarEnFormulario() activa modoEdicion, luego actualizar
//   - DELETE fila → confirmar con window.confirm(), luego eliminar
//   - modoEdicion: controla si el formulario está en modo crear o editar
//   - PK: dni_nie (deshabilitado en edición, no se puede cambiar)
// ─────────────────────────────────────────────────────────────

import { ref, onMounted } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL = URL;  // URL base de la API
const Z = "?zusuario=ivan";  // Parámetro de auditoría requerido por todos los endpoints

const rolesDisponibles = ["ADMIN", "TIC", "PROF", "ALUM"];

const profesores    = ref([]);
const departamentos = ref([]);
const mensaje       = ref("");
const mensajeError  = ref(false);
const cargando      = ref(false);
const modoEdicion   = ref(false);

const profVacio = () => ({
    dni_nie:               "",
    nombre:                "",
    apellidos:             "",
    correo_institucional:  "",
    departamento_id:       "",
    rol_id:                "",
    password_hash:         "",
    zfecha:                new Date().toISOString().split("T")[0],  // Fecha de auditoría YYYY-MM-DD
    zusuario:              "ivan"  // Usuario que realiza la operación (requerido por la API)
});

const profesor = ref(profVacio());

onMounted(async () => {  // Carga inicial de datos al montar el componente
    await cargarDepartamentos();
    await cargarProfesores();
});

// GET departamentos para el selector
const cargarDepartamentos = async () => {  // GET → carga datos de la API y rellena la tabla
    try {
        const res = await axios.get(`${API_URL}/departamentos${Z}`);
        departamentos.value = res.data;
    } catch (error) {
        console.error("Error cargando departamentos:", error);
    }
};

// GET profesores
const cargarProfesores = async () => {  // GET → carga datos de la API y rellena la tabla
    cargando.value = true;  // Activa el spinner de carga
    try {
        const res = await axios.get(`${API_URL}/profesores${Z}`);
        profesores.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar los profesores", true);
    } finally {
        cargando.value = false;  // El bloque finally apaga el spinner siempre, incluso si hay error
    }
};

// POST
const insertarProfesor = async () => {  // POST → crea un nuevo registro en la BD
    try {
        mostrarMensaje("Enviando...", false);  // Feedback inmediato antes de esperar respuesta del servidor
        await axios.post(`${API_URL}/profesores${Z}`, profesor.value);
        mostrarMensaje("✅ Profesor creado correctamente", false);
        profesor.value = profVacio();
        await cargarProfesores();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {  // Error de clave duplicada en la BD → mensaje específico al usuario
            mostrarMensaje(`❌ El profesor "${profesor.value.dni_nie}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

// PUT
const cargarEnFormulario = (p) => {  // GET → carga datos de la API y rellena la tabla
    profesor.value    = { ...p, password_hash: "", zfecha: new Date().toISOString().split("T")[0], zusuario: "ivan" };  // Fecha de auditoría YYYY-MM-DD
    modoEdicion.value = true;  // Activa el modo edición: el título y el botón del formulario cambian
    mensaje.value     = "";  // Limpia el mensaje anterior para no desorientar al usuario
    window.scrollTo({ top: 0, behavior: "smooth" });  // Desplaza la vista al formulario para que el usuario vea los cambios
};

const actualizarProfesor = async () => {  // PUT → actualiza el registro editado en la BD
    try {
        mostrarMensaje("Guardando...", false);
        await axios.put(`${API_URL}/profesores/${profesor.value.dni_nie}${Z}`, profesor.value);
        mostrarMensaje("✅ Profesor actualizado correctamente", false);
        cancelarEdicion();  // Resetea el formulario y desactiva modoEdicion sin guardar cambios
        await cargarProfesores();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar el profesor", true);
    }
};

const cancelarEdicion = () => {
    profesor.value    = profVacio();
    modoEdicion.value = false;
    mensaje.value     = "";  // Limpia el mensaje anterior para no desorientar al usuario
};

// DELETE
const eliminarProfesor = async (dni) => {  // DELETE → elimina el registro tras confirmación
    if (!confirm(`¿Seguro que quieres eliminar al profesor "${dni}"?`)) return;  // Confirmación nativa del navegador antes de borrar un registro
    try {
        await axios.delete(`${API_URL}/profesores/${dni}${Z}`);
        mostrarMensaje("✅ Profesor eliminado correctamente", false);
        if (modoEdicion.value && profesor.value.dni_nie === dni) cancelarEdicion();  // Si se borra/cancela el que estaba en edición, también cancela el modo
        await cargarProfesores();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar el profesor", true);
    }
};

const mostrarMensaje = (texto, esError) => {  // Helper: actualiza mensaje + flag de error en un solo lugar
    mensaje.value      = texto;
    mensajeError.value = esError;
};
</script>

<style scoped>
.page { padding: 32px; display: flex; justify-content: center; }
.card { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 960px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; }
h3 { color: #2c3e50; margin: 0; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { font-size: 0.85rem; font-weight: bold; color: #444; }
input, select { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; }
input:focus, select:focus { outline: none; border-color: #42b983; }
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

<template>
    <div class="page">
        <div class="card">

            <h3>{{ modoEdicion ? '✏️ Editar Rol' : '➕ Crear Rol' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarRol() : insertarRol()">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID</label>
                        <input v-model="rol.id" :disabled="modoEdicion" required>
                        <small v-if="modoEdicion" class="hint">El ID no se puede modificar</small>
                    </div>
                    <div class="form-group">
                        <label>Nivel de privilegio</label>
                        <input type="number" v-model="rol.nivel_privilegio" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Nombre</label>
                    <input v-model="rol.nombre" required>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <input v-model="rol.descripcion" required>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar rol' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-secundario" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <div class="tabla-header">
                <h3>📋 Roles registrados</h3>
                <button class="btn-refrescar" @click="cargarRoles">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>
            <div v-else-if="roles.length === 0" class="vacio">No hay roles registrados</div>
            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Nivel privilegio</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="r in roles" :key="r.id"
                            :class="{ 'fila-editando': modoEdicion && rol.id === r.id }">
                            <td>{{ r.id }}</td>
                            <td>{{ r.nombre }}</td>
                            <td>{{ r.nivel_privilegio }}</td>
                            <td>{{ r.descripcion }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(r)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarRol(r.id)">🗑️ Eliminar</button>
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
// CrearRoles.vue  —  CRUD completo de Rol
// Roles del sistema (ADMIN, TIC, PROF, ALUM) con su nivel de privilegio.
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
const Z       = "?zusuario=ivan";

const roles        = ref([]);
const mensaje      = ref("");
const mensajeError = ref(false);  // Distingue mensaje de éxito (false=verde) de error (true=rojo)
const cargando     = ref(false);  // true mientras se ejecuta una petición GET
const modoEdicion  = ref(false);  // Controla si el formulario muestra el modo crear o editar

const rolVacio = () => ({
    id:               "",
    nombre:           "",
    nivel_privilegio: "",
    descripcion:      "",
    zfecha:           new Date().toISOString().slice(0, 10),  // Fecha de auditoría YYYY-MM-DD
    zusuario:         "ivan"  // Usuario que realiza la operación (requerido por la API)
});

const rol = ref(rolVacio());

onMounted(() => cargarRoles());  // Carga inicial de datos al montar el componente

const cargarRoles = async () => {  // GET → carga datos de la API y rellena la tabla
    cargando.value = true;  // Activa el spinner de carga
    try {
        const res = await axios.get(`${API_URL}/roles${Z}`);
        roles.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar los roles", true);
    } finally {
        cargando.value = false;  // El bloque finally apaga el spinner siempre, incluso si hay error
    }
};

const insertarRol = async () => {  // POST → crea un nuevo registro en la BD
    try {
        mostrarMensaje("Enviando...", false);  // Feedback inmediato antes de esperar respuesta del servidor
        await axios.post(`${API_URL}/roles${Z}`, rol.value);
        mostrarMensaje("✅ Rol creado correctamente", false);
        rol.value = rolVacio();
        await cargarRoles();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {  // Error de clave duplicada en la BD → mensaje específico al usuario
            mostrarMensaje(`❌ El rol "${rol.value.id}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

const cargarEnFormulario = (r) => {  // GET → carga datos de la API y rellena la tabla
    rol.value         = { ...r, zfecha: new Date().toISOString().slice(0, 10), zusuario: "ivan" };  // Fecha de auditoría YYYY-MM-DD
    modoEdicion.value = true;  // Activa el modo edición: el título y el botón del formulario cambian
    mensaje.value     = "";  // Limpia el mensaje anterior para no desorientar al usuario
    window.scrollTo({ top: 0, behavior: "smooth" });  // Desplaza la vista al formulario para que el usuario vea los cambios
};

const actualizarRol = async () => {  // PUT → actualiza el registro editado en la BD
    try {
        mostrarMensaje("Guardando...", false);
        await axios.put(`${API_URL}/roles/${rol.value.id}${Z}`, rol.value);
        mostrarMensaje("✅ Rol actualizado correctamente", false);
        cancelarEdicion();  // Resetea el formulario y desactiva modoEdicion sin guardar cambios
        await cargarRoles();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar el rol", true);
    }
};

const cancelarEdicion = () => {
    rol.value         = rolVacio();
    modoEdicion.value = false;
    mensaje.value     = "";  // Limpia el mensaje anterior para no desorientar al usuario
};

const eliminarRol = async (id) => {  // DELETE → elimina el registro tras confirmación
    if (!confirm(`¿Seguro que quieres eliminar el rol "${id}"?`)) return;  // Confirmación nativa del navegador antes de borrar un registro
    try {
        await axios.delete(`${API_URL}/roles/${id}${Z}`);
        mostrarMensaje("✅ Rol eliminado correctamente", false);
        if (modoEdicion.value && rol.value.id === id) cancelarEdicion();  // Si se borra/cancela el que estaba en edición, también cancela el modo
        await cargarRoles();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar el rol", true);
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
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
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

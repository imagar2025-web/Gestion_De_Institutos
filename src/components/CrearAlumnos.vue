<template>
    <div class="page">
        <div class="card">

            <h3>{{ modoEdicion ? '✏️ Editar Alumno' : '➕ Crear Alumno' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarAlumno() : insertarAlumno()">
                <div class="form-row">
                    <div class="form-group">
                        <label>NIA</label>
                        <input type="number" v-model="alumno.nia" :disabled="modoEdicion" required>
                        <small v-if="modoEdicion" class="hint">El NIA no se puede modificar</small>
                    </div>
                    <div class="form-group">
                        <label>Estado</label>
                        <select v-model="alumno.estado_id" required>
                            <option value="">-- Selecciona un estado --</option>
                            <option v-for="e in estados" :key="e.id" :value="e.id">
                                {{ e.id }} — {{ e.nombre }}
                            </option>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input v-model="alumno.nombre" required>
                    </div>
                    <div class="form-group">
                        <label>Apellidos</label>
                        <input v-model="alumno.apellidos" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Correo electrónico</label>
                    <input type="email" v-model="alumno.correo_electronico" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Curso</label>
                        <select v-model="alumno.curso_id" required>
                            <option value="">-- Selecciona un curso --</option>
                            <option v-for="c in cursos" :key="c.id" :value="c.id">
                                {{ c.nombre_curso }} — {{ c.grupo }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Tutor legal / contacto</label>
                        <input v-model="alumno.tutor_legal_contacto" required>
                    </div>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar alumno' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-secundario" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <div class="tabla-header">
                <h3>📋 Alumnos registrados</h3>
                <button class="btn-refrescar" @click="cargarAlumnos">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>
            <div v-else-if="alumnos.length === 0" class="vacio">No hay alumnos registrados</div>
            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>NIA</th>
                            <th>Nombre</th>
                            <th>Apellidos</th>
                            <th>Correo</th>
                            <th>Curso</th>
                            <th>Estado</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="a in alumnos" :key="a.nia"
                            :class="{ 'fila-editando': modoEdicion && alumno.nia == a.nia }">
                            <td>{{ a.nia }}</td>
                            <td>{{ a.nombre }}</td>
                            <td>{{ a.apellidos }}</td>
                            <td>{{ a.correo_electronico }}</td>
                            <td>{{ a.curso_id }}</td>
                            <td>{{ a.estado_id }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(a)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarAlumno(a.nia)">🗑️ Eliminar</button>
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

const alumnos      = ref([]);
const estados      = ref([]);
const cursos       = ref([]);
const mensaje      = ref("");
const mensajeError = ref(false);
const cargando     = ref(false);
const modoEdicion  = ref(false);

const alumnoVacio = () => ({
    nia:                  "",
    nombre:               "",
    apellidos:            "",
    correo_electronico:   "",
    curso_id:             "",
    tutor_legal_contacto: "",
    estado_id:            "",
    zfecha:               new Date().toISOString().slice(0, 10),
    zusuario:             "ivan"
});

const alumno = ref(alumnoVacio());

onMounted(async () => {
    await Promise.all([cargarEstados(), cargarCursos(), cargarAlumnos()]);
});

const cargarEstados = async () => {
    try {
        const res = await axios.get(`${API_URL}/estados_usuario${Z}`);
        estados.value = res.data;
    } catch (error) {
        console.error("Error cargando estados:", error);
    }
};

const cargarCursos = async () => {
    try {
        const res = await axios.get(`${API_URL}/cursos${Z}`);
        cursos.value = res.data;
    } catch (error) {
        console.error("Error cargando cursos:", error);
    }
};

const cargarAlumnos = async () => {
    cargando.value = true;
    try {
        const res = await axios.get(`${API_URL}/alumnos${Z}`);
        alumnos.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar los alumnos", true);
    } finally {
        cargando.value = false;
    }
};

const insertarAlumno = async () => {
    try {
        mostrarMensaje("Enviando...", false);
        await axios.post(`${API_URL}/alumnos${Z}`, alumno.value);
        mostrarMensaje("✅ Alumno creado correctamente", false);
        alumno.value = alumnoVacio();
        await cargarAlumnos();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mostrarMensaje(`❌ El alumno con NIA "${alumno.value.nia}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

const cargarEnFormulario = (a) => {
    alumno.value      = { ...a, zfecha: new Date().toISOString().slice(0, 10), zusuario: "ivan" };
    modoEdicion.value = true;
    mensaje.value     = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const actualizarAlumno = async () => {
    try {
        mostrarMensaje("Guardando...", false);
        await axios.put(`${API_URL}/alumnos/${alumno.value.nia}${Z}`, alumno.value);
        mostrarMensaje("✅ Alumno actualizado correctamente", false);
        cancelarEdicion();
        await cargarAlumnos();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar el alumno", true);
    }
};

const cancelarEdicion = () => {
    alumno.value      = alumnoVacio();
    modoEdicion.value = false;
    mensaje.value     = "";
};

const eliminarAlumno = async (nia) => {
    if (!confirm(`¿Seguro que quieres eliminar al alumno con NIA "${nia}"?`)) return;
    try {
        await axios.delete(`${API_URL}/alumnos/${nia}${Z}`);
        mostrarMensaje("✅ Alumno eliminado correctamente", false);
        if (modoEdicion.value && alumno.value.nia == nia) cancelarEdicion();
        await cargarAlumnos();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar el alumno", true);
    }
};

const mostrarMensaje = (texto, esError) => {
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

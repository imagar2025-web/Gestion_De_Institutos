<template>
    <div class="page">
        <div class="card">

            <h3>{{ modoEdicion ? '✏️ Editar Curso' : '➕ Crear Curso' }}</h3>

            <form @submit.prevent="modoEdicion ? actualizarCurso() : insertarCurso()">
                <div class="form-row">
                    <div class="form-group">
                        <label>ID</label>
                        <input v-model="curso.id" :disabled="modoEdicion" required>
                        <small v-if="modoEdicion" class="hint">El ID no se puede modificar</small>
                    </div>
                    <div class="form-group">
                        <label>Nombre del curso</label>
                        <input v-model="curso.nombre_curso" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Etapa ID</label>
                        <input v-model="curso.etapa_id" required>
                    </div>
                    <div class="form-group">
                        <label>Grupo</label>
                        <input v-model="curso.grupo" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Turno ID</label>
                        <input v-model="curso.turno_id" required>
                    </div>
                    <div class="form-group">
                        <label>Año académico</label>
                        <input v-model="curso.anio_academico" placeholder="2024-2025" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Tutor ID</label>
                        <select v-model="curso.tutor_id" required>
                            <option value="">-- Selecciona un tutor --</option>
                            <option v-for="p in profesores" :key="p.dni_nie" :value="p.dni_nie">
                                {{ p.nombre }} {{ p.apellidos }} ({{ p.dni_nie }})
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Aula ID</label>
                        <select v-model="curso.aula_id" required>
                            <option value="">-- Selecciona un aula --</option>
                            <option v-for="e in espacios" :key="e.id" :value="e.id">
                                {{ e.nombre }} — Planta {{ e.ubicacion_planta }}
                            </option>
                        </select>
                    </div>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicion ? '💾 Guardar cambios' : '➕ Insertar curso' }}
                    </button>
                    <button v-if="modoEdicion" type="button" class="btn-secundario" @click="cancelarEdicion">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensaje" :class="mensajeError ? 'msg-error' : 'msg-ok'">{{ mensaje }}</p>

            <!-- TABLA -->
            <div class="tabla-header">
                <h3>📋 Cursos registrados</h3>
                <button class="btn-refrescar" @click="cargarCursos">🔄 Refrescar</button>
            </div>

            <p v-if="cargando" class="msg-cargando">⏳ Cargando...</p>

            <div v-else-if="cursos.length === 0" class="vacio">
                No hay cursos registrados
            </div>

            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Etapa</th>
                            <th>Grupo</th>
                            <th>Turno</th>
                            <th>Año</th>
                            <th>Tutor</th>
                            <th>Aula</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="c in cursos" :key="c.id"
                            :class="{ 'fila-editando': modoEdicion && curso.id === c.id }">
                            <td>{{ c.id }}</td>
                            <td>{{ c.nombre_curso }}</td>
                            <td>{{ c.etapa_id }}</td>
                            <td>{{ c.grupo }}</td>
                            <td>{{ c.turno_id }}</td>
                            <td>{{ c.anio_academico }}</td>
                            <td>{{ c.tutor_id }}</td>
                            <td>{{ c.aula_id }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEnFormulario(c)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarCurso(c.id)">🗑️ Eliminar</button>
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
const Z = "?zusuario=ivan";

const cursos      = ref([]);
const profesores  = ref([]);
const espacios    = ref([]);
const mensaje     = ref("");
const mensajeError = ref(false);
const cargando    = ref(false);
const modoEdicion = ref(false);

const cursoVacio = () => ({
    id:            "",
    nombre_curso:  "",
    etapa_id:      "",
    grupo:         "",
    turno_id:      "",
    anio_academico:"",
    tutor_id:      "",
    aula_id:       "",
    zfecha:        new Date().toISOString().slice(0, 10),
    zusuario:      "ivan"
});

const curso = ref(cursoVacio());

onMounted(async () => {
    await Promise.all([cargarProfesores(), cargarEspacios(), cargarCursos()]);
});

// GETs auxiliares para los selectores
const cargarProfesores = async () => {
    try {
        const res = await axios.get(`${API_URL}/profesores${Z}`);
        profesores.value = res.data;
    } catch (error) {
        console.error("Error cargando profesores:", error);
    }
};

const cargarEspacios = async () => {
    try {
        const res = await axios.get(`${API_URL}/espacios${Z}`);
        espacios.value = res.data;
    } catch (error) {
        console.error("Error cargando espacios:", error);
    }
};

// GET cursos
const cargarCursos = async () => {
    cargando.value = true;
    try {
        const res = await axios.get(`${API_URL}/cursos${Z}`);
        cursos.value = res.data;
    } catch (error) {
        mostrarMensaje("❌ No se pudieron cargar los cursos", true);
    } finally {
        cargando.value = false;
    }
};

// POST
const insertarCurso = async () => {
    try {
        mostrarMensaje("Enviando...", false);
        await axios.post(`${API_URL}/cursos${Z}`, curso.value);
        mostrarMensaje("✅ Curso creado correctamente", false);
        curso.value = cursoVacio();
        await cargarCursos();
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mostrarMensaje(`❌ El curso "${curso.value.id}" ya existe`, true);
        } else {
            console.error("Error POST:", error.response?.data);
            mostrarMensaje("❌ El servidor rechazó los datos", true);
        }
    }
};

// PUT
const cargarEnFormulario = (c) => {
    curso.value       = { ...c, zfecha: new Date().toISOString().slice(0, 10), zusuario: "ivan" };
    modoEdicion.value = true;
    mensaje.value     = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const actualizarCurso = async () => {
    try {
        mostrarMensaje("Guardando...", false);
        await axios.put(`${API_URL}/cursos/${curso.value.id}${Z}`, curso.value);
        mostrarMensaje("✅ Curso actualizado correctamente", false);
        cancelarEdicion();
        await cargarCursos();
    } catch (error) {
        console.error("Error PUT:", error.response?.data);
        mostrarMensaje("❌ No se pudo actualizar el curso", true);
    }
};

const cancelarEdicion = () => {
    curso.value       = cursoVacio();
    modoEdicion.value = false;
    mensaje.value     = "";
};

// DELETE
const eliminarCurso = async (id) => {
    if (!confirm(`¿Seguro que quieres eliminar el curso "${id}"?`)) return;
    try {
        await axios.delete(`${API_URL}/cursos/${id}${Z}`);
        mostrarMensaje("✅ Curso eliminado correctamente", false);
        if (modoEdicion.value && curso.value.id === id) cancelarEdicion();
        await cargarCursos();
    } catch (error) {
        console.error("Error DELETE:", error.response?.data);
        mostrarMensaje("❌ No se pudo eliminar el curso", true);
    }
};

const mostrarMensaje = (texto, esError) => {
    mensaje.value      = texto;
    mensajeError.value = esError;
};
</script>

<style scoped>
.page { padding: 32px; display: flex; justify-content: center; }
.card { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 1060px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; }
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

<template>
    <div class="page">
        <div class="card">
            <h2>🖥️ Info del Sistema</h2>

            <!-- ALUMNOS -->
            <div class="seccion">
                <div class="tabla-header">
                    <h3>🎓 Alumnos</h3>
                    <button class="btn-refrescar" @click="obtener('alumnos', alumnos)">🔄 Refrescar</button>
                </div>
                <p v-if="cargando.alumnos" class="msg-cargando">⏳ Cargando...</p>
                <div v-else-if="alumnos.length === 0" class="vacio">No hay alumnos cargados o la API no responde.</div>
                <div v-else class="tabla-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>NIA</th>
                                <th>Nombre</th>
                                <th>Apellidos</th>
                                <th>Correo</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="alumno in alumnos" :key="alumno.nia">
                                <td>{{ alumno.nia }}</td>
                                <td>{{ alumno.nombre }}</td>
                                <td>{{ alumno.apellidos }}</td>
                                <td>{{ alumno.correo_electronico }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <hr class="separador">

            <!-- PROFESORES -->
            <div class="seccion">
                <div class="tabla-header">
                    <h3>👨‍🏫 Profesores</h3>
                    <button class="btn-refrescar" @click="obtener('profesores', profesores)">🔄 Refrescar</button>
                </div>
                <p v-if="cargando.profesores" class="msg-cargando">⏳ Cargando...</p>
                <div v-else-if="profesores.length === 0" class="vacio">No hay profesores cargados o la API no responde.
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
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="profe in profesores" :key="profe.dni_nie">
                                <td>{{ profe.dni_nie }}</td>
                                <td>{{ profe.nombre }}</td>
                                <td>{{ profe.apellidos }}</td>
                                <td>{{ profe.correo_institucional }}</td>
                                <td>{{ profe.departamento_id }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <hr class="separador">

            <!-- CURSOS -->
            <div class="seccion">
                <div class="tabla-header">
                    <h3>📚 Cursos</h3>
                    <button class="btn-refrescar" @click="obtener('cursos', cursos)">🔄 Refrescar</button>
                </div>
                <p v-if="cargando.cursos" class="msg-cargando">⏳ Cargando...</p>
                <div v-else-if="cursos.length === 0" class="vacio">No hay cursos cargados o la API no responde.</div>
                <div v-else class="tabla-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Etapa</th>
                                <th>Grupo</th>
                                <th>Turno</th>
                                <th>Año académico</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="curso in cursos" :key="curso.id">
                                <td>{{ curso.id }}</td>
                                <td>{{ curso.nombre_curso }}</td>
                                <td>{{ curso.etapa_id }}</td>
                                <td>{{ curso.grupo }}</td>
                                <td>{{ curso.turno_id }}</td>
                                <td>{{ curso.anio_academico }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <hr class="separador">

            <!-- ESPACIOS -->
            <div class="seccion">
                <div class="tabla-header">
                    <h3>🏫 Espacios</h3>
                    <button class="btn-refrescar" @click="obtener('espacios', espacios)">🔄 Refrescar</button>
                </div>
                <p v-if="cargando.espacios" class="msg-cargando">⏳ Cargando...</p>
                <div v-else-if="espacios.length === 0" class="vacio">No hay espacios cargados o la API no responde.
                </div>
                <div v-else class="tabla-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Planta</th>
                                <th>Capacidad</th>
                                <th>Equipamiento</th>
                                <th>Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="espacio in espacios" :key="espacio.id">
                                <td>{{ espacio.id }}</td>
                                <td>{{ espacio.nombre }}</td>
                                <td>{{ espacio.ubicacion_planta }}</td>
                                <td>{{ espacio.capacidad_max }}</td>
                                <td>{{ espacio.equipamiento }}</td>
                                <td>
                                    <span class="badge" :class="'estado-' + espacio.estado_operativo">
                                        {{ espacio.estado_operativo }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <hr class="separador">

            <!-- DEPARTAMENTOS -->
            <div class="seccion">
                <div class="tabla-header">
                    <h3>🏢 Departamentos</h3>
                    <button class="btn-refrescar" @click="obtener('departamentos', departamentos)">🔄 Refrescar</button>
                </div>
                <p v-if="cargando.departamentos" class="msg-cargando">⏳ Cargando...</p>
                <div v-else-if="departamentos.length === 0" class="vacio">No hay departamentos cargados o la API no
                    responde.</div>
                <div v-else class="tabla-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Ubicación</th>
                                <th>Correo contacto</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="dept in departamentos" :key="dept.id">
                                <td>{{ dept.id }}</td>
                                <td>{{ dept.nombre }}</td>
                                <td>{{ dept.ubicacion }}</td>
                                <td>{{ dept.correo_contacto }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <hr class="separador">

            <!-- HORARIOS -->
            <div class="seccion">
                <div class="tabla-header">
                    <h3>🕐 Horarios</h3>
                    <button class="btn-refrescar" @click="obtener('horarios', horarios)">🔄 Refrescar</button>
                </div>
                <p v-if="cargando.horarios" class="msg-cargando">⏳ Cargando...</p>
                <div v-else-if="horarios.length === 0" class="vacio">No hay horarios cargados o la API no responde.
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
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="h in horarios" :key="h.id">
                                <td>{{ h.id }}</td>
                                <td>{{ h.nombre }}</td>
                                <td>{{ h.hora_inicio }}</td>
                                <td>{{ h.hora_fin }}</td>
                                <td>{{ h.turno_id }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <hr class="separador">

            <!-- USUARIOS -->
            <div class="seccion">
                <div class="tabla-header">
                    <h3>👤 Usuarios</h3>
                    <button class="btn-refrescar" @click="obtener('usuarios', usuarios)">🔄 Refrescar</button>
                </div>
                <p v-if="cargando.usuarios" class="msg-cargando">⏳ Cargando...</p>
                <div v-else-if="usuarios.length === 0" class="vacio">No hay usuarios cargados o la API no responde.
                </div>
                <div v-else class="tabla-wrapper">
                    <table>
                        <thead>
                            <tr>
                                <th>Login</th>
                                <th>Rol</th>
                                <th>Estado</th>
                                <th>Último acceso</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="u in usuarios" :key="u.login">
                                <td>{{ u.login }}</td>
                                <td>{{ u.rol_id }}</td>
                                <td>{{ u.estado_id }}</td>
                                <td>{{ u.ultimo_acceso }}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { URL } from '@/variablesGlobales';

const API_URL = URL;
const Z = "?zusuario=ivan";

// ── Datos ──────────────────────────────────────────────────
const alumnos = ref([]);
const profesores = ref([]);
const cursos = ref([]);
const espacios = ref([]);
const departamentos = ref([]);
const horarios = ref([]);
const usuarios = ref([]);

// Estado de carga individual por tabla
const cargando = reactive({
    alumnos: false,
    profesores: false,
    cursos: false,
    espacios: false,
    departamentos: false,
    horarios: false,
    usuarios: false,
});

// ── GET genérico ───────────────────────────────────────────
const obtener = async (ruta, variable) => {
    cargando[ruta] = true;
    try {
        const response = await fetch(`${API_URL}/${ruta}${Z}`);
        if (!response.ok) throw new Error("Error en la API");
        variable.value = await response.json();
    } catch (error) {
        console.error(`Error al cargar ${ruta}:`, error);
        variable.value = [];
    } finally {
        cargando[ruta] = false;
    }
};

// ── Carga inicial — todas las tablas a la vez ──────────────
onMounted(() => {
    obtener("alumnos", alumnos);
    obtener("profesores", profesores);
    obtener("cursos", cursos);
    obtener("espacios", espacios);
    obtener("departamentos", departamentos);
    obtener("horarios", horarios);
    obtener("usuarios", usuarios);
});
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
    max-width: 1060px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

h2 {
    color: #2c3e50;
    margin: 0 0 8px 0;
}

h3 {
    color: #2c3e50;
    margin: 0;
}

.seccion {
    display: flex;
    flex-direction: column;
    gap: 12px;
}

.separador {
    border: none;
    border-top: 2px solid #d5e8f0;
    margin: 12px 0;
}

.tabla-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

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

.btn-refrescar:hover {
    background-color: #2980b9;
}

.msg-cargando {
    color: #888;
    font-size: 0.9rem;
    margin: 0;
}

.vacio {
    text-align: center;
    color: #aaa;
    padding: 20px 0;
    font-size: 0.9rem;
    background: #fafafa;
    border-radius: 6px;
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

tbody tr:hover {
    background-color: #f9f9f9;
}

/* Badges estado espacios */
.badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: bold;
}

.estado-operativa {
    background: #d4f5e9;
    color: #27ae60;
}

.estado-mantenimiento {
    background: #fef9e7;
    color: #f39c12;
}

.estado-fuera_de_servicio {
    background: #fde8e8;
    color: #e74c3c;
}
</style>
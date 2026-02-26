<template>
    <h1>GET SISTEMA</h1>
    <button @click="obtenerAlumnos"> Refrescar Lista de alumnos</button>
    <br><br>
    <h2>alumnos</h2>
    <table v-if="alumnos.length > 0">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Apellido</th>
                <th>Correo</th>
            </tr>
        </thead>
        <tbody>

            <tr v-for="alumno in alumnos" :key="alumno.id">
                <td>{{ alumno.nia }}</td>
                <td>{{ alumno.nombre }}</td>
                <td>{{ alumno.apellidos }}</td>
                <td>{{ alumno.correo_electronico }}</td>
            </tr>
        </tbody>
    </table>
    <p v-else>No hay alumnos cargados o la API no responde.</p>
    <button @click="obtenerProfesores"> Refrescar Lista</button>
    <h2>profesores</h2>
    <table v-if="profesores.length > 0">
        <thead>
            <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Apellidos</th>
                <th>Correo</th>
                <th>NumDEPT</th>
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
    <p v-else>No hay profesores cargados o la API no responde.</p>

    <button @click="obtenerCursos"> Refrescar Lista</button>
    <h2>Cursos</h2>
    <table v-if="cursos.length > 0">
        <thead>
            <tr>
                <th>Id</th>
                <th>Nombre</th>
                <th>Grupo</th>

            </tr>
        </thead>
        <tbody>
            <tr v-for="curso in cursos" :key="curso.id">
                <td>{{ curso.id }}</td>
                <td>{{ curso.nombre_curso }}</td>
                <td>{{ curso.grupo }}</td>

            </tr>
        </tbody>
    </table>
    <p v-else>No hay cursos cargados o la API no responde.</p>
    <button @click="obtenerEspacios"> Refrescar Lista</button>
    <h2>espacios</h2>
    <table v-if="espacios.length > 0">
        <thead>
            <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Ubicacion</th>
                <th>Equipamiento</th>
                <th>Estado</th>
            </tr>
        </thead>
        <tbody>
            <tr v-for="espacio in espacios" :key="espacio.id">
                <td>{{ espacio.id }}</td>
                <td>{{ espacio.nombre }}</td>
                <td>{{ espacio.ubicacion_planta }}</td>
                <td>{{ espacio.equipamiento }}</td>
                <td v-if="espacio.estado_operativo">Disponible</td>
                <td v-else>Ocupada</td>
            </tr>
        </tbody>
    </table>
    <p v-else>No hay espacios cargados o la API no responde.</p>
</template>
<script setup>
import {ref,onMounted} from 'vue'
import { URL } from '@/variablesGlobales';
const alumnos = ref([]);
const profesores = ref([]);
const espacios = ref([]);
const cursos = ref([]);
const API_URL = URL+"/";
const z_usuario="?zusuario=ivan"

const obtener = async (ruta,variable) => {
    try {
        const response = await fetch(API_URL + ruta+z_usuario);
        if (!response.ok) throw new Error("Error en la API");
        variable.value = await response.json();
    } catch (error) {
        console.error("Error al conectar con la API:", error);
        alert("No se pudo conectar con la API en AWS");
    }
};

// Llamar a la API automáticamente al cargar la página
onMounted(() => {
    obtener("alumnos",alumnos);
    obtener("espacios",espacios);
    obtener("cursos",cursos);
    obtener("profesores",profesores);
});
</script>
<style scoped>


</style>
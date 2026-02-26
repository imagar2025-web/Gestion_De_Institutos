<template>
    <h3>Crear Curso</h3>
    <form @submit.prevent="insertarCurso()">
        <label>ID</label><input v-model="curso.id" required><br>
        <label>Nombre del curso</label><input v-model="curso.nombre_curso" required><br>
        <label>Etapa ID</label><input v-model="curso.etapa_id" required><br>
        <label>Grupo</label><input v-model="curso.grupo" required><br>
        <label>Turno ID</label><input v-model="curso.turno_id" required><br>
        <label>Año académico</label><input v-model="curso.anio_academico" placeholder="2024-2025" required><br>
        <label>Tutor ID</label><input v-model="curso.tutor_id" required><br>
        <label>horario ID</label><input v-model="curso.horario_id" required><br>
        <button type="submit">Insertar curso</button>
    </form>
    <ul>
        <li>La etapa, turno, tutor y horario deben existir previamente en la base de datos</li>
        <li>Si el ID está duplicado no se realizará la inserción</li>
    </ul>
    <p v-if="mensajeCurso">{{ mensajeCurso }}</p>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const API_URL = "http://100.27.173.196:3000";
const z_usuario_query = "?zusuario=ivan";

const curso = ref({
    id: "",
    nombre_curso: "",
    etapa_id: "",
    grupo: "",
    turno_id: "",
    anio_academico: "",
    tutor_id: "",
    horario_id: "",
    zfecha: new Date().toISOString().slice(0, 10),
    zusuario: "ivan"
});

const mensajeCurso = ref("");

const insertarCurso = async () => {
    try {
        mensajeCurso.value = "Enviando...";
        const response = await axios.post(`${API_URL}/cursos${z_usuario_query}`, curso.value);
        console.log("Curso insertado con éxito:", response.data);
        mensajeCurso.value = "Curso creado correctamente";
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mensajeCurso.value = ` El curso "${curso.value.id}" ya existe en la base de datos`;
        } else {
            console.error("Detalle del error:", error.response?.data);
            mensajeCurso.value = "El servidor rechazó los datos del curso (Error 500)";
        }
    }
};
</script>
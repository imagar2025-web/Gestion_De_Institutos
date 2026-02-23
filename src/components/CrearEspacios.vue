<template>
    <h3>Crear Aula</h3>
    <form @submit.prevent="insertarAula()">
        <label>ID</label><input v-model="aula.id" required><br>
        <label>Nombre</label><input v-model="aula.nombre" required><br>
        <label>Ubicación / Planta</label><input v-model="aula.ubicacion_planta" required><br>
        <label>Capacidad máxima</label><input type="number" v-model="aula.capacidad_max" required><br>
        <label>Equipamiento</label><input v-model="aula.equipamiento" required><br>
        <label>Estado operativo</label>
        <select v-model="aula.estado_operativo" required>
            <option value="">-- Selecciona un estado --</option>
            <option value="operativa">Operativa</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="fuera_de_servicio">Fuera de servicio</option>
        </select><br>
        <button type="submit">Insertar aula</button>
    </form>
    <ul>
        <li>Si el ID está duplicado no se realizará la inserción</li>
    </ul>
    <p v-if="mensajeAula">{{ mensajeAula }}</p>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const API_URL = "http://100.27.173.196:3000";
const z_usuario_query = "?zusuario=ivan";

const aula = ref({
    id: "",
    nombre: "",
    ubicacion_planta: "",
    capacidad_max: "",
    equipamiento: "",
    estado_operativo: "",
    zfecha: new Date().toISOString().slice(0, 10),
    zusuario: "ivan"
});

const mensajeAula = ref("");

const insertarAula = async () => {
    try {
        mensajeAula.value = "Enviando...";
        const response = await axios.post(`${API_URL}/espacios${z_usuario_query}`, aula.value);
        console.log("Aula insertada con éxito:", response.data);
        mensajeAula.value = " Aula creada correctamente";
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mensajeAula.value = ` El aula "${aula.value.id}" ya existe en la base de datos`;
        } else {
            console.error("Detalle del error:", error.response?.data);
            mensajeAula.value = " El servidor rechazó los datos del aula (Error 500)";
        }
    }
};
</script>
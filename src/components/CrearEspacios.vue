<template>
    <h3>Crear horario</h3>
    <form @submit.prevent="insertarhorario()">
        <label>ID</label><input v-model="horario.id" required><br>
        <label>Nombre</label><input v-model="horario.nombre" required><br>
        <label>Ubicación / Planta</label><input v-model="horario.ubicacion_planta" required><br>
        <label>Capacidad máxima</label><input type="number" v-model="horario.capacidad_max" required><br>
        <label>Equipamiento</label><input v-model="horario.equipamiento" required><br>
        <label>Estado operativo</label>
        <select v-model="horario.estado_operativo" required>
            <option value="">-- Selecciona un estado --</option>
            <option value="operativa">Operativa</option>
            <option value="mantenimiento">En mantenimiento</option>
            <option value="fuera_de_servicio">Fuera de servicio</option>
        </select><br>
        <button type="submit">Insertar horario</button>
    </form>
    <ul>
        <li>Si el ID está duplicado no se realizará la inserción</li>
    </ul>
    <p v-if="mensajeHorario">{{ mensajeHorario }}</p>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";
const API_URL = URL;
const z_usuario_query = "?zusuario=ivan";

const horario = ref({
    id: "",
    nombre: "",
    ubicacion_planta: "",
    capacidad_max: "",
    equipamiento: "",
    estado_operativo: "",
    zfecha: new Date().toISOString().slice(0, 10),
    zusuario: "ivan"
});

const mensajeHorario = ref("");

const insertarhorario = async () => {
    try {
        mensajeHorario.value = "Enviando...";
        const response = await axios.post(`${API_URL}/espacios${z_usuario_query}`, horario.value);
        console.log("horario insertada con éxito:", response.data);
        mensajeHorario.value = " horario creada correctamente";
    } catch (error) {
        if (error.response?.data?.error?.includes("duplicate key")) {
            mensajeHorario.value = ` El horario "${horario.value.id}" ya existe en la base de datos`;
        } else {
            console.error("Detalle del error:", error.response?.data);
            mensajeHorario.value = " El servidor rechazó los datos del horario (Error 500)";
        }
    }
};
</script>
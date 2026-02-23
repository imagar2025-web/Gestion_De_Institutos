<template>
    <!-- Creo los datos para la aplicacion Este script no sera empleado para la aplicacion
   solo para el montaje de los datos que empleara de logica el programa-->

   
        <form @submit.prevent="crearDepartamento()">
            <label>ID</label><input v-model="departamento.id" required><br>
            <label>Nombre del departamento</label><input v-model="departamento.nombre" required><br>
            <label>ubicacion</label><input v-model="departamento.ubicacion" required><br>
            <label>correo de contacto</label><input v-model="departamento.correo_contacto" required><br>
            <button tpye="submit">Insertar departamento</button>
        </form>
        <ul>
            <li>Si el formulario no rellena todos los campos no realizara la insercion</li>
            <li>Si el id esta duplicado en las tablas no realizara las inserciones</li>
        </ul>
        <p v-if="mensaje">{{ mensaje }}</p>
    

</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const API_URL = "http://100.27.173.196:3000";
const z_usuario_query = "?zusuario=ivan";
const departamento = ref(
    {
        id: "",
        nombre: "",
        ubicacion: "",
        correo_contacto: "",
        zfecha: new Date().toISOString().split("T")[0],
        zusuario: "ivan",
    }
);
const mensaje = ref("");
const crearDepartamento = async () => {
    try {
        mensaje.value = "Enviando...";

        const response = await axios.post(`${API_URL}/departamentos${z_usuario_query}`, departamento.value);
        console.log("Insertado con éxito:", response.data);

        mensaje.value = "Creados correctamente";
    } catch (error) {
        console.error("Detalle del error 500:", error.response?.data);
        mensaje.value = "El servidor rechazó los datos (Error 500)";
    }
};
</script>

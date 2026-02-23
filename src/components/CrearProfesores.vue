<template>
    <!-- Creo los datos para la aplicacion Este script no sera empleado para la aplicacion
   solo para el montaje de los datos que empleara de logica el programa-->

   
        <form @submit.prevent="crearProfesor()">
            <label>dni_nie</label><input v-model="departamento.dni_nie" required><br>
            <label>Nombre</label><input v-model="departamento.nombre" required><br>
            <label>Apellidos</label><input v-model="departamento.apellidos" required><br>
            <label>correo de contacto</label><input v-model="departamento.correo_institucional" required><br>
            <label>Id del departamento</label><input v-model="departamento.departamento_id" required><br>
            <label>rol_id</label><input v-model="departamento.rol_id" required><br>
            <label>password_hash</label><input v-model="departamento.password_hash" required><br>
            <button tpye="submit">Insertar departamento</button>
        </form>
        <ul>
            <li>Si el formulario no rellena todos los campos no realizara la insercion</li>
            <li>si no existe previamente el rol y no exite el departamento no se podra crear este profesor</li>
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
    dni_nie: "",
    nombre: "",
    apellidos: "",
    correo_institucional: "",
    departamento_id: "",
    rol_id: "",
    password_hash: "",
    zfecha: new Date().toISOString().split("T")[0],
    zusuario: "ivan"
  }
);
const mensaje = ref("");
const crearProfesor = async () => {
    try {
        mensaje.value = "Enviando...";

        const response = await axios.post(`${API_URL}/profesores${z_usuario_query}`, departamento.value);
        console.log("Insertado con éxito:", response.data);

        mensaje.value = "Creados correctamente";
    } catch (error) {
        console.error("Detalle del error 500:", error.response?.data);
        mensaje.value = "El servidor rechazó los datos (Error 500)";
    }
};
</script>

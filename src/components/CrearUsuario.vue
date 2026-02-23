<template>
  <!-- Creo los datos para la aplicacion Este script no sera empleado para la aplicacion
   solo para el montaje de los datos que empleara de logica el programa-->

  <div>
    <button @click="crearusuario">Crear</button>
    <p v-if="mensaje">{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const API_URL = "http://100.27.173.196:3000";
const z_usuario_query = "?zusuario=ivan";
const roles = [
  {
    id: "PROF_2",
    nombre: "Profesor",
    nivel_privilegio: 5,
    descripcion: "Docente",
    zfecha: new Date().toISOString().split("T")[0],
    zusuario: "ivan",
  },
  {
    id: "ALUM_2",
    nombre: "Alumno",
    nivel_privilegio: 1,
    descripcion: "Estudiant",
    zfecha: new Date().toISOString().split("T")[0],
    zusuario: "ivan",
  },
];
const mensaje = ref("");
const crearusuario = async () => {
  try {
    mensaje.value = "Enviando...";
    for (const rol of roles) {
      const response = await axios.post(`${API_URL}/roles`, rol);
      console.log("Insertado con éxito:", response.data);
    }
    mensaje.value = "Creados correctamente";
  } catch (error) {
    console.error("Detalle del error 500:", error.response?.data);
    mensaje.value = "El servidor rechazó los datos (Error 500)";
  }
};
</script>

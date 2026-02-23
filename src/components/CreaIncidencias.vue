<template>
  <!-- Creo los datos para la aplicacion -->

  <div>
    <button @click="crearusuario">Crear</button>
    <p v-if="mensaje">{{ mensaje }}</p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

// 1. Corregimos la barra final para evitar "//"
const API_URL = "http://100.27.173.196:3000";
const z_usuario_query = "?zusuario=ivan";
const roles = [
  {
    id: "PROF_2", // Cambiado
    nombre: "Profesor", // 8 chars
    nivel_privilegio: 5,
    descripcion: "Docente", // 7 chars
    zfecha: new Date().toISOString().split("T")[0],
    zusuario: "ivan",
  },
  {
    id: "ALUM_2", // Cambiado
    nombre: "Alumno", // 6 chars
    nivel_privilegio: 1,
    descripcion: "Estudiant", // 9 chars
    zfecha: new Date().toISOString().split("T")[0],
    zusuario: "ivan",
  },
  // ... y así con los demás
];
const mensaje = ref("");
const crearusuario = async () => {
  try {
    mensaje.value = "Enviando...";
    for (const rol of roles) {
      // Quitamos el query param (?zusuario=ivan) si ya va dentro del objeto 'rol'
      // A veces enviar la misma info en dos sitios confunde al servidor
      const response = await axios.post(`${API_URL}/roles`, rol);
      console.log("Insertado con éxito:", response.data);
    }
    mensaje.value = "Creados correctamente";
  } catch (error) {
    // Imprimimos el error que viene del servidor para leer el mensaje real
    console.error("Detalle del error 500:", error.response?.data);
    mensaje.value = "El servidor rechazó los datos (Error 500)";
  }
};
</script>

<template>
    <!-- Creo los datos para la aplicacion -->

    <div>
        <button @click="crearusuario">Crear</button>
        <p v-if="mensaje">{{ mensaje }}</p>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const API_URL = "http://100.27.173.196:3000/"
const z_usuario = "?zusuario=ivan"
const roles = [
    {
        id: "ADMIN",
        nombre: "Administrador",
        nivel_privilegio: "10",
        descripcion: "administrador del sistema",

        zusuario: "ivan"
    },
    {
        id: "TIC",
        nombre: "Responsable TIC",
        nivel_privilegio: "8",
        descripcion: "tico",

        zusuario: "ivan"
    },
    {
        id: "PROF",
        nombre: "Profesor",
        nivel_privilegio: "5",
        descripcion: "profesores",

        zusuario: "ivan"
    },
    {
        id: "ALUM",
        nombre: "Alumno",
        nivel_privilegio: "1",
        descripcion: "los alumnos",

        zusuario: "ivan"
    }

]

const mensaje = ref('')

const crearusuario = async () => {
    try {
        for (const rol of roles) {
            const response = await axios.post(API_URL + 'roles' + z_usuario, rol)
            console.log(response.data)
        }
        mensaje.value = 'usuario creado correctamente'

    } catch (error) {
        mensaje.value = 'Error al crear el usuario'
        console.error(error)
    }
}
</script>
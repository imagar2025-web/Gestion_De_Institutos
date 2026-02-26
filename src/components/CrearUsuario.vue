<template>
  <!-- FORMULARIO ESTADO USUARIO -->
  <h3>1. Crear Estado de Usuario</h3>
  <form @submit.prevent="insertarEstado()">
    <label>Estado</label>
    <select v-model="estadoSeleccionado" @change="rellenarEstado" required>
      <option value="">-- Selecciona un estado --</option>
      <option v-for="e in estadosDisponibles" :key="e.id" :value="e">
        {{ e.id }} - {{ e.nombre }}
      </option>
    </select><br>
    <label>ID</label><input v-model="estado.id" required><br>
    <label>Nombre</label><input v-model="estado.nombre" required><br>
    <label>Permite acceso</label><input v-model="estado.permite_acceso" required><br>
    <label>Descripción</label><input v-model="estado.descripcion" required><br>
    <button type="submit">Insertar estado</button>
  </form>
  <p v-if="mensajeEstado">{{ mensajeEstado }}</p>

  <hr>

  <!-- FORMULARIO USUARIO -->
  <h3>2. Crear Usuario</h3>
  <form @submit.prevent="insertarUsuario()">
    <label>Login</label><input v-model="usuario.login" required><br>
    <label>Password</label><input v-model="usuario.password_hash" required><br>
    <label>Rol ID</label><input v-model="usuario.rol_id" required><br>
    <label>Ref identidad FK</label><input v-model="usuario.ref_identidad_fk" required><br>
    <label>Estado ID</label>
    <select v-model="usuario.estado_id" required>
      <option value="">-- Selecciona un estado --</option>
      <option v-for="e in estadosDisponibles" :key="e.id" :value="e.id">
        {{ e.id }} - {{ e.nombre }}
      </option>
    </select><br>
    <label>Último acceso</label>
    <input type="date" v-model="usuario.ultimo_acceso" required><br>
    <button type="submit">Insertar usuario</button>
  </form>
  <ul>
    <li>Crea primero el estado antes de insertar el usuario</li>
    <li>Si el rol o el estado no existen previamente no se podrá crear el usuario</li>
  </ul>
  <p v-if="mensajeUsuario">{{ mensajeUsuario }}</p>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL = URL;
const z_usuario_query = "?zusuario=ivan";

// --- ESTADOS PREDEFINIDOS ---
const estadosDisponibles = [
  { id: "ACT_I", nombre: "Activo", permite_acceso: true, descripcion: "Usuario con acceso total a la plataforma." },
  { id: "BAJ_I", nombre: "Baja", permite_acceso: false, descripcion: "El usuario ya no pertenece al centro. Se mantienen datos pero no accede." },
  { id: "BLOQ_I", nombre: "Bloqueado", permite_acceso: false, descripcion: "Acceso restringido por seguridad o por el administrador." },
  { id: "GRAD_I", nombre: "Graduado", permite_acceso: false, descripcion: "Alumnos que han terminado su ciclo formativo." },
  { id: "TEMP_I", nombre: "Baja Temporal", permite_acceso: false, descripcion: "Usuario fuera del sistema temporalmente (ej. enfermedad larga)." },
];

// --- ESTADO USUARIO ---
const estadoSeleccionado = ref("");
const estado = ref({
  id: "",
  nombre: "",
  permite_acceso: "",
  descripcion: "",
  zfecha: new Date().toISOString().split("T")[0],
  zusuario: "ivan"
});
const mensajeEstado = ref("");

const rellenarEstado = () => {
  if (estadoSeleccionado.value) {
    estado.value.id = estadoSeleccionado.value.id;
    estado.value.nombre = estadoSeleccionado.value.nombre;
    estado.value.permite_acceso = estadoSeleccionado.value.permite_acceso;
    estado.value.descripcion = estadoSeleccionado.value.descripcion;
  }
};

const insertarEstado = async () => {
  try {
    mensajeEstado.value = "Enviando...";
    const response = await axios.post(`${API_URL}/estados_usuario${z_usuario_query}`, estado.value);
    console.log("Estado insertado con éxito:", response.data);
    mensajeEstado.value = "✅ Estado creado correctamente";
  } catch (error) {
    console.error("Detalle del error:", error.response?.data);
    mensajeEstado.value = "❌ El servidor rechazó los datos del estado (Error 500)";
  }
};

// --- USUARIO ---
const usuario = ref({
  login: "",
  password_hash: "",
  rol_id: "",
  ref_identidad_fk: "",
  estado_id: "",
  ultimo_acceso: "",
  zfecha: new Date().toISOString().split("T")[0],
  zusuario: "ivan"
});
const mensajeUsuario = ref("");

const insertarUsuario = async () => {
  try {
    mensajeUsuario.value = "Enviando...";
    const response = await axios.post(`${API_URL}/usuarios${z_usuario_query}`, usuario.value);
    console.log("Usuario insertado con éxito:", response.data);
    mensajeUsuario.value = "✅ Usuario creado correctamente";
  } catch (error) {
    console.error("Detalle del error:", error.response?.data);
    mensajeUsuario.value = "❌ El servidor rechazó los datos del usuario (Error 500)";
  }
};
</script>
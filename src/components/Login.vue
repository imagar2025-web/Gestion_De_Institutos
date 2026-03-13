<template>
  <div class="login-container">
    <div class="login-card">

      <div class="login-logo">
        <h1>🏫</h1>
        <h2>Gestión de Institutos</h2>
        <p class="subtitulo">I.E.S. Domenico Scarlatti</p>
      </div>

      <!-- @submit.prevent evita el comportamiento nativo del formulario
           (recarga de página) y llama a iniciarSesion() -->
      <form @submit.prevent="iniciarSesion()">
        <div class="form-group">
          <label>Usuario</label>
          <!-- v-model enlaza el input con credenciales.login en tiempo real -->
          <input v-model="credenciales.login" placeholder="Tu usuario" autocomplete="username" required>
        </div>

        <div class="form-group">
          <label>Contraseña</label>
          <input type="password" v-model="credenciales.password_hash" placeholder="Tu contraseña"
            autocomplete="current-password" required>
        </div>

        <!-- :disabled="cargando" bloquea el botón mientras se espera respuesta
             del servidor, evitando dobles envíos. -->
        <button type="submit" :disabled="cargando">
          {{ cargando ? "Comprobando..." : "Iniciar sesión" }}
        </button>
      </form>

      <!-- :class aplica msg-ok o msg-error según si el login fue exitoso o no -->
      <p v-if="mensaje" :class="exito ? 'msg-ok' : 'msg-error'">{{ mensaje }}</p>

    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { URL } from "@/variablesGlobales";  // URL base de la API

const API_URL  = URL;
const ZUSUARIO = "ivan";  // Parámetro de auditoría requerido por la API

// useRouter permite redirigir al usuario programáticamente tras el login
const router = useRouter();

// Objeto reactivo con las credenciales que escribe el usuario en el formulario.
// password_hash es el nombre del campo aunque se envíe como "password" al backend.
const credenciales = ref({
  login: "",
  password: ""
});

// Mensaje de feedback al usuario (éxito o error)
const mensaje  = ref("");
// Distingue visualmente entre mensaje de éxito (verde) y error (rojo)
const exito    = ref(false);
// Controla el estado de carga para deshabilitar el botón y cambiar su texto
const cargando = ref(false);

// ── Función principal de login ────────────────────────────────
const iniciarSesion = async () => {
  try {
    cargando.value = true;
    mensaje.value  = "";

    // POST a /auth/login con las credenciales del formulario.
    // zusuario es el parámetro de auditoría que la API registra en los logs.
    const response = await axios.post(
      `${API_URL}/auth/login?zusuario=${ZUSUARIO}`,
      {
        login:    credenciales.value.login,
        password: credenciales.value.password_hash,  // La API espera el campo "password"
        zusuario: ZUSUARIO
      }
    );

    const datos = response.data;  // { usuario, rol, nombre, apellidos }

    // Persiste los datos del usuario en sessionStorage.
    // sessionStorage dura mientras dure la pestaña del navegador;
    // al cerrarla, la sesión se borra automáticamente.
    sessionStorage.setItem("usuario", JSON.stringify({
      login:     datos.usuario,
      rol:       datos.rol,
      nombre:    datos.nombre,
      apellidos: datos.apellidos
    }));

    exito.value   = true;
    mensaje.value = `✅ Bienvenido/a ${datos.nombre} ${datos.apellidos} — ${datos.rol}`;

  } catch (error) {
    exito.value = false;

    // La API puede devolver distintos campos según el tipo de error:
    //   err.motivo  → acceso denegado (usuario bloqueado, sin permiso…)
    //   err.error   → error técnico (usuario no existe, contraseña incorrecta…)
    const err = error.response?.data;
    if (err?.motivo) {
      mensaje.value = `🚫 Acceso denegado: ${err.motivo}`;
    } else if (err?.error) {
      mensaje.value = `❌ ${err.error}`;
    } else {
      mensaje.value = "❌ Error al conectar con el servidor";
    }
  } finally {
    // finally siempre se ejecuta, tanto si hubo éxito como error.
    cargando.value = false;

    // Espera 1,5 segundos para que el usuario pueda leer el mensaje,
    // luego redirige a la página principal donde App.vue leerá sessionStorage
    // y mostrará la navbar con el rol correspondiente.
    setTimeout(() => {
      router.push("/");
    }, 1500);
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2c3e50 0%, #3d5a73 100%);
}

.login-card {
  background: white;
  padding: 48px 40px;
  border-radius: 16px;
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.25);
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.login-logo {
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.login-logo h1 { font-size: 3rem; }
.login-logo h2 { color: #2c3e50; font-size: 1.3rem; }

.subtitulo { color: #888; font-size: 0.9rem; }

.form-group { display: flex; flex-direction: column; gap: 6px; }

label { font-size: 0.85rem; font-weight: bold; color: #444; }

input {
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: border-color 0.2s, box-shadow 0.2s;
}

input:focus {
  outline: none;
  border-color: #42b983;
  box-shadow: 0 0 0 3px rgba(66, 185, 131, 0.15);
}

button {
  width: 100%;
  padding: 14px;
  background-color: #42b983;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.1s;
  margin-top: 4px;
}

button:hover:not(:disabled) { background-color: #369870; transform: translateY(-1px); }
button:active:not(:disabled) { transform: translateY(0); }
button:disabled { background-color: #aaa; cursor: not-allowed; }

.msg-ok    { color: #42b983; font-weight: bold; text-align: center; font-size: 0.9rem; }
.msg-error { color: #e74c3c; font-weight: bold; text-align: center; font-size: 0.9rem; }
</style>

// =============================================================================
// ARCHIVO: src/components/Login.vue — Pantalla de autenticación
// =============================================================================
// PROPÓSITO: Formulario de login que valida credenciales contra la "API".
//
// FLUJO ORIGINAL (con API real):
//   1. Usuario rellena login + password
//   2. axios.post("/auth/login") envía credenciales al servidor
//   3. El servidor comprueba en la BD y devuelve { usuario, rol, nombre, apellidos }
//   4. Se guarda en sessionStorage → App.vue lee la sesión → muestra navbar
//
// FLUJO MOCK (sin API):
//   1. Usuario rellena login + password (igual)
//   2. fakeApi.post() busca en el array 'usuarios' de datos.js
//   3. Comprueba password_hash y estado_id (permite_acceso)
//   4. Devuelve los mismos campos → sessionStorage → App.vue (igual)
//
// USUARIOS DE PRUEBA: Adminivan/1234, TICale/1234, PROFcarlos/1234,
//   ALUMpedro/1234, BLOQuser/1234 (bloqueado, no puede entrar)
// =============================================================================
<template>
    <div class="login-container">
        <div class="login-card">

            <div class="login-logo">
                <h1>🏫</h1>
                <h2>Gestión de Institutos</h2>
                <p class="subtitulo">I.E.S. Domenico Scarlatti</p>
            </div>

            <form @submit.prevent="iniciarSesion()">
                <div class="form-group">
                    <label>Usuario</label>
                    <input v-model="credenciales.login" placeholder="Tu usuario" autocomplete="username" required>
                </div>

                <div class="form-group">
                    <label>Contraseña</label>
                    <input type="password" v-model="credenciales.password_hash" placeholder="Tu contraseña"
                        autocomplete="current-password" required>
                </div>

                <button type="submit" :disabled="cargando">
                    {{ cargando ? "Comprobando..." : "Iniciar sesión" }}
                </button>
            </form>

            <p v-if="mensaje" :class="exito ? 'msg-ok' : 'msg-error'">{{ mensaje }}</p>

        </div>
    </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
// MOCK: Antes se importaba axios para peticiones HTTP reales al servidor.
// import axios from "axios";
// Ahora usamos fakeApi que hace las mismas operaciones en memoria local.
import { fakeApi } from "@/mock/fakeApi";
// MOCK: La URL del servidor real ya no se usa.
// import { URL } from "@/variablesGlobales";
// URL original: http://44.207.19.239:3000

// MOCK: API_URL apunta a un placeholder. fakeApi solo necesita el nombre
// del recurso (ej: "espacios"), el dominio se ignora.
const API_URL = "http://mock";
const ZUSUARIO = "ivan";

const router = useRouter();

const credenciales = ref({
    login: "",
    password: ""
});

const mensaje = ref("");
const exito = ref(false);
const cargando = ref(false);

const iniciarSesion = async () => {
    try {
        cargando.value = true;
        mensaje.value = "";

        const response = await fakeApi.post(
            `${API_URL}/auth/login?zusuario=${ZUSUARIO}`,
            {
                login: credenciales.value.login,
                password: credenciales.value.password_hash,
                zusuario: ZUSUARIO
            }
        );

        const datos = response.data;

        sessionStorage.setItem("usuario", JSON.stringify({
            login: datos.usuario,
            rol: datos.rol,
            nombre: datos.nombre,
            apellidos: datos.apellidos
        }));
        
        exito.value = true;
        mensaje.value = `✅ Bienvenido/a ${datos.nombre} ${datos.apellidos} — ${datos.rol}`;

    } catch (error) {
        exito.value = false;
        const err = error.response?.data;
        if (err?.motivo) {
            mensaje.value = `🚫 Acceso denegado: ${err.motivo}`;
        } else if (err?.error) {
            mensaje.value = `❌ ${err.error}`;
        } else {
            mensaje.value = "❌ Error al conectar con el servidor";
        }
    } finally {
        cargando.value = false;
        //movido para que siempre se ejecute el asignado forzado
       /* sessionStorage.setItem("usuario", JSON.stringify({
            login: "Admin",
            rol: "admin",
            nombre: "ivan",
            apellidos: "martin"
        }));*/

        

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

.login-logo h1 {
    font-size: 3rem;
}

.login-logo h2 {
    color: #2c3e50;
    font-size: 1.3rem;
}

.subtitulo {
    color: #888;
    font-size: 0.9rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

label {
    font-size: 0.85rem;
    font-weight: bold;
    color: #444;
}

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

button:hover:not(:disabled) {
    background-color: #369870;
    transform: translateY(-1px);
}

button:active:not(:disabled) {
    transform: translateY(0);
}

button:disabled {
    background-color: #aaa;
    cursor: not-allowed;
}

.msg-ok {
    color: #42b983;
    font-weight: bold;
    text-align: center;
    font-size: 0.9rem;
}

.msg-error {
    color: #e74c3c;
    font-weight: bold;
    text-align: center;
    font-size: 0.9rem;
}
</style>
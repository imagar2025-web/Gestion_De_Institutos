<template>
    <div class="page">
        <div class="card">

            <!-- ══════════════════════════════════════════ -->
            <!-- SECCIÓN 1: ESTADOS DE USUARIO             -->
            <!-- ══════════════════════════════════════════ -->
            <h3>{{ modoEdicionEstado ? '✏️ Editar Estado' : '➕ Crear Estado de Usuario' }}</h3>

            <form @submit.prevent="modoEdicionEstado ? actualizarEstado() : insertarEstado()">
                <div class="form-row">
                    <div class="form-group">
                        <label>Estado predefinido</label>
                        <select v-model="estadoSeleccionado" @change="rellenarEstado">
                            <option value="">-- Autorellenar desde plantilla --</option>
                            <option v-for="e in estadosDisponibles" :key="e.id" :value="e">
                                {{ e.id }} - {{ e.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>ID</label>
                        <input v-model="estado.id" :disabled="modoEdicionEstado" required>
                        <small v-if="modoEdicionEstado" class="hint">El ID no se puede modificar</small>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Nombre</label>
                        <input v-model="estado.nombre" required>
                    </div>
                    <div class="form-group">
                        <label>Permite acceso</label>
                        <select v-model="estado.permite_acceso" required>
                            <option value="">-- Selecciona --</option>
                            <option :value="true">✅ Sí</option>
                            <option :value="false">❌ No</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <input v-model="estado.descripcion" required>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicionEstado ? '💾 Guardar estado' : '➕ Insertar estado' }}
                    </button>
                    <button v-if="modoEdicionEstado" type="button" class="btn-secundario" @click="cancelarEdicionEstado">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensajeEstado" :class="mensajeErrorEstado ? 'msg-error' : 'msg-ok'">{{ mensajeEstado }}</p>

            <!-- Tabla estados -->
            <div class="tabla-header">
                <h4>📋 Estados registrados</h4>
                <button class="btn-refrescar" @click="cargarEstados">🔄 Refrescar</button>
            </div>

            <p v-if="cargandoEstados" class="msg-cargando">⏳ Cargando...</p>
            <div v-else-if="estados.length === 0" class="vacio">No hay estados registrados</div>
            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Nombre</th>
                            <th>Permite acceso</th>
                            <th>Descripción</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="e in estados" :key="e.id"
                            :class="{ 'fila-editando': modoEdicionEstado && estado.id === e.id }">
                            <td>{{ e.id }}</td>
                            <td>{{ e.nombre }}</td>
                            <td>
                                <span class="badge" :class="e.permite_acceso ? 'badge-si' : 'badge-no'">
                                    {{ e.permite_acceso ? '✅ Sí' : '❌ No' }}
                                </span>
                            </td>
                            <td>{{ e.descripcion }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarEstadoEnFormulario(e)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarEstado(e.id)">🗑️ Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <hr class="separador">

            <!-- ══════════════════════════════════════════ -->
            <!-- SECCIÓN 2: USUARIOS                       -->
            <!-- ══════════════════════════════════════════ -->
            <h3>{{ modoEdicionUsuario ? '✏️ Editar Usuario' : '➕ Crear Usuario' }}</h3>
            <p class="aviso">⚠️ Crea primero el estado antes de insertar el usuario</p>

            <form @submit.prevent="modoEdicionUsuario ? actualizarUsuario() : insertarUsuario()">
                <div class="form-row">
                    <div class="form-group">
                        <label>Login</label>
                        <input v-model="usuario.login" :disabled="modoEdicionUsuario" required>
                        <small v-if="modoEdicionUsuario" class="hint">El login no se puede modificar</small>
                    </div>
                    <div class="form-group">
                        <label>Rol ID</label>
                        <input v-model="usuario.rol_id" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Estado</label>
                        <select v-model="usuario.estado_id" required>
                            <option value="">-- Selecciona un estado --</option>
                            <option v-for="e in estados" :key="e.id" :value="e.id">
                                {{ e.id }} - {{ e.nombre }}
                            </option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Ref identidad FK</label>
                        <input v-model="usuario.ref_identidad_fk" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group" v-if="!modoEdicionUsuario">
                        <label>Password</label>
                        <input type="password" v-model="usuario.password_hash" required>
                    </div>
                    <div class="form-group">
                        <label>Último acceso</label>
                        <input type="date" v-model="usuario.ultimo_acceso" required>
                    </div>
                </div>

                <div class="form-botones">
                    <button type="submit" class="btn-primary">
                        {{ modoEdicionUsuario ? '💾 Guardar usuario' : '➕ Insertar usuario' }}
                    </button>
                    <button v-if="modoEdicionUsuario" type="button" class="btn-secundario" @click="cancelarEdicionUsuario">
                        ✖ Cancelar
                    </button>
                </div>
            </form>

            <p v-if="mensajeUsuario" :class="mensajeErrorUsuario ? 'msg-error' : 'msg-ok'">{{ mensajeUsuario }}</p>

            <!-- Tabla usuarios -->
            <div class="tabla-header">
                <h4>📋 Usuarios registrados</h4>
                <button class="btn-refrescar" @click="cargarUsuarios">🔄 Refrescar</button>
            </div>

            <p v-if="cargandoUsuarios" class="msg-cargando">⏳ Cargando...</p>
            <div v-else-if="usuarios.length === 0" class="vacio">No hay usuarios registrados</div>
            <div v-else class="tabla-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Login</th>
                            <th>Rol</th>
                            <th>Estado</th>
                            <th>Ref identidad</th>
                            <th>Último acceso</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="u in usuarios" :key="u.login"
                            :class="{ 'fila-editando': modoEdicionUsuario && usuario.login === u.login }">
                            <td>{{ u.login }}</td>
                            <td>{{ u.rol_id }}</td>
                            <td>{{ u.estado_id }}</td>
                            <td>{{ u.ref_identidad_fk }}</td>
                            <td>{{ u.ultimo_acceso }}</td>
                            <td class="acciones">
                                <button class="btn-editar" @click="cargarUsuarioEnFormulario(u)">✏️ Editar</button>
                                <button class="btn-eliminar" @click="eliminarUsuario(u.login)">🗑️ Eliminar</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { URL } from "@/variablesGlobales";

const API_URL = URL;
const Z = "?zusuario=ivan";

// ── Estados predefinidos (plantillas) ─────────────────────
const estadosDisponibles = [
    { id: "ACT",  nombre: "Activo",        permite_acceso: true,  descripcion: "Usuario con acceso total a la plataforma." },
    { id: "BAJ",  nombre: "Baja",          permite_acceso: false, descripcion: "El usuario ya no pertenece al centro." },
    { id: "BLOQ", nombre: "Bloqueado",     permite_acceso: false, descripcion: "Acceso restringido por seguridad o administrador." },
    { id: "GRAD", nombre: "Graduado",      permite_acceso: false, descripcion: "Alumno que terminó su ciclo formativo." },
    { id: "TEMP", nombre: "Baja Temporal", permite_acceso: false, descripcion: "Usuario fuera del sistema temporalmente." },
];

// ── Estado reactivo — Estados ──────────────────────────────
const estados            = ref([]);
const estadoSeleccionado = ref("");
const mensajeEstado      = ref("");
const mensajeErrorEstado = ref(false);
const cargandoEstados    = ref(false);
const modoEdicionEstado  = ref(false);

const estadoVacio = () => ({
    id:             "",
    nombre:         "",
    permite_acceso: "",
    descripcion:    "",
    zfecha:         new Date().toISOString().split("T")[0],
    zusuario:       "ivan"
});

const estado = ref(estadoVacio());

// ── Estado reactivo — Usuarios ─────────────────────────────
const usuarios             = ref([]);
const mensajeUsuario       = ref("");
const mensajeErrorUsuario  = ref(false);
const cargandoUsuarios     = ref(false);
const modoEdicionUsuario   = ref(false);

const usuarioVacio = () => ({
    login:            "",
    password_hash:    "",
    rol_id:           "",
    ref_identidad_fk: "",
    estado_id:        "",
    ultimo_acceso:    "",
    zfecha:           new Date().toISOString().split("T")[0],
    zusuario:         "ivan"
});

const usuario = ref(usuarioVacio());

// ── Carga inicial ──────────────────────────────────────────
onMounted(async () => {
    await cargarEstados();
    await cargarUsuarios();
});

// ══════════════════════════════════════════════════════════
// CRUD ESTADOS
// ══════════════════════════════════════════════════════════

const cargarEstados = async () => {
    cargandoEstados.value = true;
    try {
        const res = await axios.get(`${API_URL}/estados_usuario${Z}`);
        estados.value = res.data;
    } catch (error) {
        mostrarMensajeEstado("❌ No se pudieron cargar los estados", true);
    } finally {
        cargandoEstados.value = false;
    }
};

const rellenarEstado = () => {
    if (estadoSeleccionado.value) {
        estado.value.id             = estadoSeleccionado.value.id;
        estado.value.nombre         = estadoSeleccionado.value.nombre;
        estado.value.permite_acceso = estadoSeleccionado.value.permite_acceso;
        estado.value.descripcion    = estadoSeleccionado.value.descripcion;
    }
};

const insertarEstado = async () => {
    try {
        mostrarMensajeEstado("Enviando...", false);
        await axios.post(`${API_URL}/estados_usuario${Z}`, estado.value);
        mostrarMensajeEstado("✅ Estado creado correctamente", false);
        estado.value            = estadoVacio();
        estadoSeleccionado.value = "";
        await cargarEstados();
    } catch (error) {
        console.error("Error POST estado:", error.response?.data);
        mostrarMensajeEstado("❌ El servidor rechazó los datos del estado", true);
    }
};

const cargarEstadoEnFormulario = (e) => {
    estado.value            = { ...e, zfecha: new Date().toISOString().split("T")[0], zusuario: "ivan" };
    estadoSeleccionado.value = "";
    modoEdicionEstado.value  = true;
    mensajeEstado.value      = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
};

const actualizarEstado = async () => {
    try {
        mostrarMensajeEstado("Guardando...", false);
        await axios.put(`${API_URL}/estados_usuario/${estado.value.id}${Z}`, estado.value);
        mostrarMensajeEstado("✅ Estado actualizado correctamente", false);
        cancelarEdicionEstado();
        await cargarEstados();
    } catch (error) {
        console.error("Error PUT estado:", error.response?.data);
        mostrarMensajeEstado("❌ No se pudo actualizar el estado", true);
    }
};

const cancelarEdicionEstado = () => {
    estado.value             = estadoVacio();
    estadoSeleccionado.value = "";
    modoEdicionEstado.value  = false;
    mensajeEstado.value      = "";
};

const eliminarEstado = async (id) => {
    if (!confirm(`¿Seguro que quieres eliminar el estado "${id}"?`)) return;
    try {
        await axios.delete(`${API_URL}/estados_usuario/${id}${Z}`);
        mostrarMensajeEstado("✅ Estado eliminado correctamente", false);
        if (modoEdicionEstado.value && estado.value.id === id) cancelarEdicionEstado();
        await cargarEstados();
    } catch (error) {
        console.error("Error DELETE estado:", error.response?.data);
        mostrarMensajeEstado("❌ No se pudo eliminar el estado", true);
    }
};

// ══════════════════════════════════════════════════════════
// CRUD USUARIOS
// ══════════════════════════════════════════════════════════

const cargarUsuarios = async () => {
    cargandoUsuarios.value = true;
    try {
        const res = await axios.get(`${API_URL}/usuarios${Z}`);
        usuarios.value = res.data;
    } catch (error) {
        mostrarMensajeUsuario("❌ No se pudieron cargar los usuarios", true);
    } finally {
        cargandoUsuarios.value = false;
    }
};

const insertarUsuario = async () => {
    try {
        mostrarMensajeUsuario("Enviando...", false);
        await axios.post(`${API_URL}/usuarios${Z}`, usuario.value);
        mostrarMensajeUsuario("✅ Usuario creado correctamente", false);
        usuario.value = usuarioVacio();
        await cargarUsuarios();
    } catch (error) {
        console.error("Error POST usuario:", error.response?.data);
        mostrarMensajeUsuario("❌ El servidor rechazó los datos del usuario", true);
    }
};

const cargarUsuarioEnFormulario = (u) => {
    usuario.value           = { ...u, password_hash: "", zfecha: new Date().toISOString().split("T")[0], zusuario: "ivan" };
    modoEdicionUsuario.value = true;
    mensajeUsuario.value     = "";
    // Scroll a la sección de usuarios
    document.querySelector(".separador")?.scrollIntoView({ behavior: "smooth" });
};

const actualizarUsuario = async () => {
    try {
        mostrarMensajeUsuario("Guardando...", false);
        await axios.put(`${API_URL}/usuarios/${usuario.value.login}${Z}`, usuario.value);
        mostrarMensajeUsuario("✅ Usuario actualizado correctamente", false);
        cancelarEdicionUsuario();
        await cargarUsuarios();
    } catch (error) {
        console.error("Error PUT usuario:", error.response?.data);
        mostrarMensajeUsuario("❌ No se pudo actualizar el usuario", true);
    }
};

const cancelarEdicionUsuario = () => {
    usuario.value            = usuarioVacio();
    modoEdicionUsuario.value = false;
    mensajeUsuario.value     = "";
};

const eliminarUsuario = async (login) => {
    if (!confirm(`¿Seguro que quieres eliminar el usuario "${login}"?`)) return;
    try {
        await axios.delete(`${API_URL}/usuarios/${login}${Z}`);
        mostrarMensajeUsuario("✅ Usuario eliminado correctamente", false);
        if (modoEdicionUsuario.value && usuario.value.login === login) cancelarEdicionUsuario();
        await cargarUsuarios();
    } catch (error) {
        console.error("Error DELETE usuario:", error.response?.data);
        mostrarMensajeUsuario("❌ No se pudo eliminar el usuario", true);
    }
};

// ── Helpers ────────────────────────────────────────────────
const mostrarMensajeEstado   = (t, e) => { mensajeEstado.value = t; mensajeErrorEstado.value = e; };
const mostrarMensajeUsuario  = (t, e) => { mensajeUsuario.value = t; mensajeErrorUsuario.value = e; };
</script>

<style scoped>
.page { padding: 32px; display: flex; justify-content: center; }
.card { background: white; border-radius: 12px; padding: 32px; width: 100%; max-width: 960px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); display: flex; flex-direction: column; gap: 20px; }
h3 { color: #2c3e50; margin: 0; }
h4 { color: #2c3e50; margin: 0; font-size: 1rem; }
.aviso { color: #e67e22; font-size: 0.85rem; margin: -10px 0 0; }
.separador { border: none; border-top: 2px solid #d5e8f0; margin: 10px 0; }
.form-group { display: flex; flex-direction: column; gap: 4px; margin-bottom: 12px; }
.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
label { font-size: 0.85rem; font-weight: bold; color: #444; }
input, select { padding: 10px 12px; border: 1px solid #ddd; border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; }
input:focus, select:focus { outline: none; border-color: #42b983; }
input:disabled { background: #f0f0f0; color: #888; cursor: not-allowed; }
.hint { color: #aaa; font-size: 0.78rem; }
.form-botones { display: flex; gap: 10px; margin-top: 4px; }
.btn-primary { padding: 10px 20px; background-color: #42b983; color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: bold; cursor: pointer; transition: background-color 0.2s; }
.btn-primary:hover { background-color: #369870; }
.btn-secundario { padding: 10px 20px; background-color: #95a5a6; color: white; border: none; border-radius: 6px; font-size: 0.95rem; font-weight: bold; cursor: pointer; }
.btn-secundario:hover { background-color: #7f8c8d; }
.btn-refrescar { padding: 6px 14px; background-color: #3498db; color: white; border: none; border-radius: 6px; font-size: 0.85rem; cursor: pointer; }
.btn-refrescar:hover { background-color: #2980b9; }
.msg-ok { color: #42b983; font-weight: bold; }
.msg-error { color: #e74c3c; font-weight: bold; }
.msg-cargando { color: #888; font-size: 0.9rem; }
.tabla-header { display: flex; justify-content: space-between; align-items: center; }
.tabla-wrapper { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
thead tr { background-color: #d5e8f0; }
th { padding: 10px 14px; text-align: left; font-size: 0.82rem; color: #2c3e50; font-weight: bold; text-transform: uppercase; letter-spacing: 0.04em; }
td { padding: 10px 14px; border-bottom: 1px solid #f0f0f0; color: #555; }
tbody tr:hover { background-color: #f9f9f9; }
.fila-editando { background-color: #fff8e1 !important; border-left: 3px solid #f39c12; }
.acciones { display: flex; gap: 8px; }
.btn-editar { padding: 4px 10px; background-color: #f39c12; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
.btn-editar:hover { background-color: #d68910; }
.btn-eliminar { padding: 4px 10px; background-color: #e74c3c; color: white; border: none; border-radius: 4px; font-size: 0.8rem; cursor: pointer; }
.btn-eliminar:hover { background-color: #c0392b; }
.vacio { text-align: center; color: #aaa; padding: 30px 0; font-size: 0.95rem; }
.badge { padding: 3px 10px; border-radius: 20px; font-size: 0.78rem; font-weight: bold; }
.badge-si { background: #d4f5e9; color: #27ae60; }
.badge-no { background: #fde8e8; color: #e74c3c; }
</style>

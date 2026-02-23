<template>
  <div>
    <!-- NAVBAR - solo visible si hay sesión -->
    <nav v-if="usuarioLogado">
      <div class="nav-brand">🏫 Gestión de Institutos</div>

      <div class="nav-links">
        <!-- INCIDENCIAS - todos los roles -->
        <div class="nav-group">
          <span class="nav-group-label">Incidencias</span>
          <router-link to="/creaIncidencias">Crear</router-link>
          <router-link v-if="esAdmin || esTIC" to="/resolverIncidencias">Resolver</router-link>
        </div>

        <!-- ESPACIOS - Profesor, TIC y Admin -->
        <div class="nav-group" v-if="esAdmin || esProfesor || esTIC">
          <span class="nav-group-label">Espacios</span>
          <router-link to="/reservarAula">Reservar aula</router-link>
        </div>

        <!-- MANTENIMIENTO - solo Admin -->
        <div class="nav-group" v-if="esAdmin">
          <span class="nav-group-label">Mantenimiento</span>
          <router-link to="/creaDepartamento">Departamentos</router-link>
          <router-link to="/creaProfesores">Profesores</router-link>
          <router-link to="/creaUsuarios">Usuarios</router-link>
          <router-link to="/creaCursos">Cursos</router-link>
          <router-link to="/sistema">Info Sistema</router-link>
        </div>
      </div>

      <!-- Usuario logado + cerrar sesión -->
      <div class="nav-user">
        <span>👤 {{ usuario.nombre }} {{ usuario.apellidos }} — {{ usuario.rol }}</span>
        <button class="btn-logout" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <router-view />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();

const usuario = ref({ login: "", rol: "", nombre: "", apellidos: "" });
const usuarioLogado = ref(false);

// Recarga el estado cada vez que cambia la ruta
// (así detecta cuando el Login.vue guarda en sessionStorage)
watch(() => route.path, () => {
  cargarSesion();
});

onMounted(() => {
  cargarSesion();
});

const cargarSesion = () => {
  const datos = sessionStorage.getItem("usuario");
  if (datos) {
    usuario.value = JSON.parse(datos);
    usuarioLogado.value = true;
  } else {
    usuarioLogado.value = false;
  }
};

const esAdmin = computed(() => usuario.value.rol?.toLowerCase().includes("admin"));
const esTIC = computed(() => usuario.value.rol?.toLowerCase().includes("tic"));
const esProfesor = computed(() => usuario.value.rol?.toLowerCase().includes("prof"));

const cerrarSesion = () => {
  sessionStorage.removeItem("usuario");
  usuarioLogado.value = false;
  router.push("/login");
};
</script>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  color: #2c3e50;
  min-height: 100vh;
  background-color: #f4f6f9;
}

nav {
  background-color: #2c3e50;
  padding: 14px 32px;
  display: flex;
  align-items: center;
  gap: 24px;
  flex-wrap: wrap;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.nav-brand {
  color: #fff;
  font-size: 1.1rem;
  font-weight: bold;
  white-space: nowrap;
}

.nav-links {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex: 1;
}

.nav-group {
  display: flex;
  align-items: center;
  gap: 8px;
  background-color: rgba(255, 255, 255, 0.08);
  padding: 6px 14px;
  border-radius: 8px;
}

.nav-group-label {
  color: #42b983;
  font-size: 0.72rem;
  font-weight: bold;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding-right: 8px;
  margin-right: 4px;
}

nav a {
  color: #cfd8e3;
  font-weight: 500;
  text-decoration: none;
  font-size: 0.88rem;
  padding: 4px 8px;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;
}

nav a:hover {
  background-color: rgba(255, 255, 255, 0.1);
  color: #fff;
}

nav a.router-link-exact-active {
  color: #42b983;
  background-color: rgba(66, 185, 131, 0.15);
}

.nav-user {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #cfd8e3;
  font-size: 0.85rem;
  margin-left: auto;
  white-space: nowrap;
}

.btn-logout {
  padding: 6px 14px;
  background-color: #e74c3c;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.85rem;
  transition: background-color 0.2s;
}

.btn-logout:hover {
  background-color: #c0392b;
}
</style>
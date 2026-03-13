<template>
  <div>
    <!-- La navbar solo se muestra cuando existe una sesión activa.
         Si usuarioLogado es false (antes del login o tras cerrar sesión)
         el nav no se renderiza en el DOM. -->
    <nav v-if="usuarioLogado">
      <div class="nav-brand">🏫 Gestión de Institutos</div>

      <div class="nav-links">

        <!-- INCIDENCIAS — todos los roles pueden crear.
             Solo ADMIN y TIC pueden resolver.
             Solo ADMIN tiene acceso a la gestión completa. -->
        <div class="nav-group">
          <span class="nav-group-label">Incidencias</span>
          <router-link to="/creaIncidencias">Crear</router-link>
          <router-link v-if="esAdmin || esTIC" to="/resolverIncidencias">Resolver</router-link>
          <router-link v-if="esAdmin" to="/gestionIncidencias">Gestión completa</router-link>
        </div>

        <!-- ESPACIOS — visible para ADMIN, TIC y PROF.
             Solo ADMIN ve el enlace de gestionar espacios. -->
        <div class="nav-group" v-if="esAdmin || esProfesor || esTIC">
          <span class="nav-group-label">Espacios</span>
          <router-link to="/reservarAula">Reservar aula</router-link>
          <router-link v-if="esAdmin" to="/creEspacios">Gestionar</router-link>
        </div>

        <!-- MANTENIMIENTO — solo ADMIN.
             Contiene todos los CRUDs de tablas maestras. -->
        <div class="nav-group" v-if="esAdmin">
          <span class="nav-group-label">Mantenimiento</span>
          <router-link to="/creaRoles">Roles</router-link>
          <router-link to="/creaEtapas">Etapas</router-link>
          <router-link to="/creaTurnos">Turnos</router-link>
          <router-link to="/creaHorarios">Horarios</router-link>
          <router-link to="/creaEstadosIncidencia">Estados incidencia</router-link>
          <router-link to="/creaDepartamento">Departamentos</router-link>
          <router-link to="/creaProfesores">Profesores</router-link>
          <router-link to="/creaAlumnos">Alumnos</router-link>
          <router-link to="/creaUsuarios">Usuarios</router-link>
          <router-link to="/creaCursos">Cursos</router-link>
          <router-link to="/sistema">Info Sistema</router-link>
        </div>

      </div>

      <!-- Muestra nombre, apellidos y rol del usuario logado.
           El botón limpia sessionStorage y redirige al login. -->
      <div class="nav-user">
        <span>👤 {{ usuario.nombre }} {{ usuario.apellidos }} — {{ usuario.rol }}</span>
        <button class="btn-logout" @click="cerrarSesion">Cerrar sesión</button>
      </div>
    </nav>

    <!-- Aquí Vue Router renderiza el componente de la ruta activa -->
    <router-view />
  </div>
</template>

<script setup>
// Composition API con <script setup>:
// todo lo declarado aquí es directamente accesible en el template.
import { ref, computed, onMounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";

// useRouter → instancia del router para programar navegación (push, replace…)
// useRoute  → objeto reactivo con info de la ruta actual (path, params, query…)
const router = useRouter();
const route  = useRoute();

// Objeto reactivo que almacena los datos del usuario logado.
// Se rellena leyendo sessionStorage en cargarSesion().
const usuario      = ref({ login: "", rol: "", nombre: "", apellidos: "" });

// Flag reactivo que controla si se muestra la navbar o no.
const usuarioLogado = ref(false);

// ── Vigilar cambios de ruta ──────────────────────────────────
// watch detecta cambios en route.path. Cada vez que el usuario
// navega a otra página, se re-lee sessionStorage para sincronizar
// el estado de la navbar (útil si otra pestaña cierra sesión).
watch(() => route.path, () => {
  cargarSesion();
});

// Al montar el componente raíz se lee sessionStorage por primera vez,
// asegurando que la navbar aparezca si ya había sesión activa.
onMounted(() => {
  cargarSesion();
});

// ── Leer sesión de sessionStorage ────────────────────────────
// sessionStorage.getItem devuelve null si no existe la clave.
// Si existe, el JSON se parsea y se asigna al ref usuario.
const cargarSesion = () => {
  const datos = sessionStorage.getItem("usuario");
  if (datos) {
    usuario.value      = JSON.parse(datos);
    usuarioLogado.value = true;
  } else {
    usuarioLogado.value = false;
  }
};

// ── Computed de rol ───────────────────────────────────────────
// Computed son propiedades derivadas y cacheadas; solo se recalculan
// cuando cambia usuario.value.rol.
// Se usa includes() y toLowerCase() para comparar de forma flexible
// (ej: "ADMIN", "admin" y "Admin" son equivalentes).
const esAdmin    = computed(() => usuario.value.rol?.toLowerCase().includes("admin"));
const esTIC      = computed(() => usuario.value.rol?.toLowerCase().includes("tic"));
const esProfesor = computed(() => usuario.value.rol?.toLowerCase().includes("prof"));

// ── Cerrar sesión ────────────────────────────────────────────
// 1. Elimina la clave "usuario" de sessionStorage → el usuario
//    queda deslogado aunque refresque la página.
// 2. Pone usuarioLogado a false → la navbar desaparece inmediatamente.
// 3. Redirige al login mediante router.push().
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

/* La clase router-link-exact-active la añade Vue Router
   automáticamente al enlace cuya ruta coincide exactamente
   con la URL actual → resaltado visual de la página activa. */
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

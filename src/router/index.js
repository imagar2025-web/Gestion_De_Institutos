// ─────────────────────────────────────────────────────────────
// router/index.js  —  Configuración de Vue Router
// Define todas las rutas de la SPA y la guardia de navegación
// que protege las páginas privadas frente a usuarios no logados.
// ─────────────────────────────────────────────────────────────

import { createRouter, createWebHistory } from 'vue-router'

// HomeView se importa de forma estática porque es la ruta principal
// y debe estar disponible de inmediato al cargar la app.
import HomeView from '../views/HomeView.vue'

// ── Definición de rutas ──────────────────────────────────────
// Cada objeto tiene:
//   path      → URL que el usuario escribe / a la que navega
//   component → componente Vue que se renderiza en <router-view>
//   meta      → metadatos opcionales (ej: marcar rutas públicas)
//
// Las rutas con import() dinámico se cargan en chunks separados
// (code splitting), reduciendo el bundle inicial.
const routes = [
  // ── Ruta pública ─────────────────────────────────────────
  // meta.publica = true indica a la guardia que NO exige sesión.
  { path: '/login', component: () => import('../components/Login.vue'), meta: { publica: true } },

  // ── Rutas generales ───────────────────────────────────────
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/sistema', component: () => import('../components/InfoSistema.vue') },

  // ── Incidencias ───────────────────────────────────────────
  // Cualquier rol puede crear incidencias.
  { path: '/creaIncidencias',    component: () => import('../components/CrearIncidencia.vue') },
  // Solo ADMIN y TIC pueden resolver incidencias.
  { path: '/resolverIncidencias', component: () => import('../components/ResolverIncidencia.vue') },
  // Solo ADMIN tiene acceso al CRUD completo del historial.
  { path: '/gestionIncidencias', component: () => import('../components/GestionIncidencias.vue') },

  // ── Espacios ──────────────────────────────────────────────
  // ADMIN, TIC y PROF pueden reservar aulas.
  { path: '/reservarAula', component: () => import('../components/ReservarEspacio.vue') },
  // Solo ADMIN puede gestionar (crear/editar/borrar) espacios.
  { path: '/creEspacios',  component: () => import('../components/CrearEspacios.vue') },

  // ── Mantenimiento — tablas maestras existentes ────────────
  { path: '/creaDepartamento', component: () => import('../components/CrearDepartamento.vue') },
  { path: '/creaProfesores',   component: () => import('../components/CrearProfesores.vue') },
  { path: '/creaUsuarios',     component: () => import('../components/CrearUsuario.vue') },
  { path: '/creaCursos',       component: () => import('../components/CrearCursos.vue') },
  { path: '/creaHorarios',     component: () => import('../components/CrearHorarios.vue') },
  { path: '/creaEstadosIncidencia', component: () => import('../components/CrearEstadosIncidencia.vue') },

  // ── Mantenimiento — tablas nuevas añadidas en Sprint 4 ────
  { path: '/creaRoles',   component: () => import('../components/CrearRoles.vue') },
  { path: '/creaEtapas',  component: () => import('../components/CrearEtapas.vue') },
  { path: '/creaTurnos',  component: () => import('../components/CrearTurnos.vue') },
  { path: '/creaAlumnos', component: () => import('../components/CrearAlumnos.vue') },
]

// Crea el router usando el modo HTML5 History API (URLs limpias, sin #).
// process.env.BASE_URL toma el valor de publicPath en vue.config.js (por defecto "/").
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// ── Guardia de navegación global ─────────────────────────────
// Se ejecuta ANTES de cada cambio de ruta.
// Parámetros:
//   to   → ruta de destino
//   from → ruta de origen
//   next → función que decide si continuar, redirigir o cancelar
router.beforeEach((to, from, next) => {
  // Comprueba si existe la clave "usuario" en sessionStorage,
  // que se escribe en Login.vue al autenticarse correctamente.
  const sesion = sessionStorage.getItem("usuario");

  if (!to.meta.publica && !sesion) {
    // Ruta protegida + sin sesión → redirige al login
    next('/login')
  } else if (to.path === '/login' && sesion) {
    // Ya logado intentando volver al login → redirige al inicio
    next('/')
  } else {
    // Todo correcto → deja pasar
    next()
  }
})

export default router

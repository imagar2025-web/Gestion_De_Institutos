// =============================================================================
// ARCHIVO: src/router/index.js — Configuración de rutas de la aplicación
// =============================================================================
// PROPÓSITO: Define TODAS las rutas URL → componente de la aplicación.
//   También implementa una GUARDIA DE NAVEGACIÓN que protege las rutas
//   privadas: si no hay sesión en sessionStorage, redirige al login.
//
// NOTA: Este archivo NO cambia entre la versión con API y la versión mock.
//   Las rutas apuntan a los mismos componentes; lo que cambia es lo que
//   esos componentes importan internamente (axios vs fakeApi).
//
// LAZY LOADING: La mayoría de componentes se cargan con import() dinámico,
//   lo que significa que el navegador solo descarga el JS de un componente
//   cuando el usuario navega a esa ruta (mejora el rendimiento inicial).
//
// GUARDIA (beforeEach):
//   - Si la ruta NO es pública Y no hay sesión → redirige a /login
//   - Si la ruta ES /login Y ya hay sesión → redirige a / (home)
//   - En cualquier otro caso → deja pasar
// =============================================================================

import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

// ── Definición de rutas ─────────────────────────────────────────────────────
// Cada objeto tiene: path (URL), component (qué renderizar), meta (datos extra)
// meta.publica = true → accesible sin login (solo /login tiene esto)
// ─────────────────────────────────────────────────────────────────────────────
const routes = [
  // ── Ruta pública: Login ──
  { path: '/login', component: () => import('../components/Login.vue'), meta: { publica: true } },

  // ── Rutas generales ──
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/sistema', component: () => import('../components/InfoSistema.vue') },

  // ── Incidencias (todos los roles pueden crear; TIC/Admin pueden resolver) ──
  { path: '/creaIncidencias',    component: () => import('../components/CrearIncidencia.vue') },
  { path: '/resolverIncidencias', component: () => import('../components/ResolverIncidencia.vue') },
  { path: '/gestionIncidencias', component: () => import('../components/GestionIncidencias.vue') },

  // ── Espacios (Profesor/TIC/Admin pueden reservar; Admin puede gestionar) ──
  { path: '/reservarAula', component: () => import('../components/ReservarEspacio.vue') },
  { path: '/creEspacios',  component: () => import('../components/CrearEspacios.vue') },

  // ── Mantenimiento — Solo Admin ──
  { path: '/creaDepartamento', component: () => import('../components/CrearDepartamento.vue') },
  { path: '/creaProfesores',   component: () => import('../components/CrearProfesores.vue') },
  { path: '/creaUsuarios',     component: () => import('../components/CrearUsuario.vue') },
  { path: '/creaCursos',       component: () => import('../components/CrearCursos.vue') },
  { path: '/creaHorarios',     component: () => import('../components/CrearHorarios.vue') },
  { path: '/creaEstadosIncidencia', component: () => import('../components/CrearEstadosIncidencia.vue') },
  { path: '/creaRoles',   component: () => import('../components/CrearRoles.vue') },
  { path: '/creaEtapas',  component: () => import('../components/CrearEtapas.vue') },
  { path: '/creaTurnos',  component: () => import('../components/CrearTurnos.vue') },
  { path: '/creaAlumnos', component: () => import('../components/CrearAlumnos.vue') },
]

// ── Crear la instancia del router ───────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// ── Guardia de navegación global ────────────────────────────────────────────
// Se ejecuta ANTES de cada cambio de ruta.
// Comprueba si hay sesión en sessionStorage para decidir si deja pasar.
// ─────────────────────────────────────────────────────────────────────────────
router.beforeEach((to, from, next) => {
  // Leer la sesión guardada por Login.vue
  const sesion = sessionStorage.getItem("usuario");

  if (!to.meta.publica && !sesion) {
    // Ruta protegida + sin sesión → al login
    next('/login')
  } else if (to.path === '/login' && sesion) {
    // Ya logueado intentando ir al login → al home
    next('/')
  } else {
    // Todo OK → dejar pasar
    next()
  }
})

export default router

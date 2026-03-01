import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const routes = [
  // Pública
  { path: '/login', component: () => import('../components/Login.vue'), meta: { publica: true } },

  // General
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
  { path: '/sistema', component: () => import('../components/InfoSistema.vue') },

  // Incidencias
  { path: '/creaIncidencias',    component: () => import('../components/CrearIncidencia.vue') },
  { path: '/resolverIncidencias', component: () => import('../components/ResolverIncidencia.vue') },
  { path: '/gestionIncidencias', component: () => import('../components/GestionIncidencias.vue') },

  // Espacios
  { path: '/reservarAula', component: () => import('../components/ReservarEspacio.vue') },
  { path: '/creEspacios',  component: () => import('../components/CrearEspacios.vue') },

  // Mantenimiento — ya existentes
  { path: '/creaDepartamento', component: () => import('../components/CrearDepartamento.vue') },
  { path: '/creaProfesores',   component: () => import('../components/CrearProfesores.vue') },
  { path: '/creaUsuarios',     component: () => import('../components/CrearUsuario.vue') },
  { path: '/creaCursos',       component: () => import('../components/CrearCursos.vue') },
  { path: '/creaHorarios',     component: () => import('../components/CrearHorarios.vue') },
  { path: '/creaEstadosIncidencia', component: () => import('../components/CrearEstadosIncidencia.vue') },

  // Mantenimiento — nuevos
  { path: '/creaRoles',   component: () => import('../components/CrearRoles.vue') },
  { path: '/creaEtapas',  component: () => import('../components/CrearEtapas.vue') },
  { path: '/creaTurnos',  component: () => import('../components/CrearTurnos.vue') },
  { path: '/creaAlumnos', component: () => import('../components/CrearAlumnos.vue') },
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

// Guardia de navegación
router.beforeEach((to, from, next) => {
  const sesion = sessionStorage.getItem("usuario");

  if (!to.meta.publica && !sesion) {
    next('/login')
  } else if (to.path === '/login' && sesion) {
    next('/')
  } else {
    next()
  }
})

export default router

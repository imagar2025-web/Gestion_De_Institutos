// =============================================================================
// ARCHIVO: src/main.js — Punto de entrada de la aplicación Vue 3
// =============================================================================
// PROPÓSITO: Crea la instancia de Vue, le conecta el router y la monta
//   en el div#app del index.html.
//
// FLUJO DE ARRANQUE:
//   1. createApp(App) → crea la instancia con App.vue como componente raíz
//   2. .use(router)   → habilita vue-router (navegación entre componentes)
//   3. .mount('#app') → renderiza todo dentro de <div id="app"> en index.html
//
// NOTA: Este archivo NO cambia entre la versión con API y la versión mock.
//   El router y App.vue son los mismos, lo que cambia son los imports
//   dentro de cada componente (axios → fakeApi).
// =============================================================================

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

createApp(App).use(router).mount('#app')

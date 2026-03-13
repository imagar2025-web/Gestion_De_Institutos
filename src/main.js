// ─────────────────────────────────────────────────────────────
// main.js  —  Punto de entrada de la aplicación Vue 3
// Este archivo es el primero que ejecuta el bundler (Vue CLI).
// Su única responsabilidad es crear la instancia raíz de Vue,
// inyectarle el router y montarla en el DOM.
// ─────────────────────────────────────────────────────────────

// Importa la función factory de Vue 3 para crear la app
import { createApp } from 'vue'

// Importa el componente raíz que envuelve toda la aplicación
import App from './App.vue'

// Importa el router configurado en /router/index.js
import router from './router'

// createApp(App)  → crea la instancia de Vue con App como componente raíz
// .use(router)    → registra Vue Router para habilitar la navegación entre páginas
// .mount('#app')  → busca el <div id="app"> en index.html y renderiza la app dentro
createApp(App).use(router).mount('#app')

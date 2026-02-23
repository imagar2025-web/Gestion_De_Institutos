<template>
    <div class="page">
        <div class="card">
            <h2>🛠️ Resolver Incidencias</h2>

            <!-- Filtros -->
            <div class="filtros">
                <select v-model="filtroEstado">
                    <option value="todas">Todas</option>
                    <option value="Pendiente">Pendientes</option>
                    <option value="Resuelta">Resueltas</option>
                </select>
                <select v-model="filtroPrioridad">
                    <option value="todas">Todas las prioridades</option>
                    <option value="Alta">🔴 Alta</option>
                    <option value="Media">🟡 Media</option>
                    <option value="Baja">🟢 Baja</option>
                </select>
            </div>

            <!-- Sin incidencias -->
            <div v-if="incidenciasFiltradas.length === 0" class="vacio">
                <p>No hay incidencias con estos filtros</p>
            </div>

            <!-- Lista de incidencias -->
            <div v-for="inc in incidenciasFiltradas" :key="inc.id" class="incidencia-item" :class="inc.estado === 'Resuelta' ? 'resuelta' : 'pendiente'">
                <div class="inc-header">
                    <strong>{{ inc.titulo }}</strong>
                    <div class="badges">
                        <span class="badge" :class="'prioridad-' + inc.prioridad.toLowerCase()">⚡ {{ inc.prioridad }}</span>
                        <span class="badge" :class="inc.estado === 'Resuelta' ? 'badge-ok' : 'badge-pending'">{{ inc.estado }}</span>
                    </div>
                </div>

                <p class="descripcion">{{ inc.descripcion }}</p>
                <small>👤 {{ inc.creadaPor }} | 📍 Espacio: {{ inc.espacio_id }} | 📅 {{ inc.fecha }}</small>

                <!-- Ya resuelta -->
                <div v-if="inc.estado === 'Resuelta'" class="resolucion">
                    <strong>✅ Resolución:</strong> {{ inc.resolucion }}
                </div>

                <!-- Formulario para resolver -->
                <div v-else class="resolver-form">
                    <textarea
                        v-model="resoluciones[inc.id]"
                        placeholder="Describe cómo se resolvió la incidencia..."
                        rows="3"
                    ></textarea>
                    <button @click="resolver(inc.id)" :disabled="!resoluciones[inc.id]">
                        Marcar como resuelta
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { incidenciasStore } from "@/store/incidencias.js";

const filtroEstado = ref("todas");
const filtroPrioridad = ref("todas");
const resoluciones = ref({});

const incidenciasFiltradas = computed(() => {
    return incidenciasStore.lista.filter(inc => {
        const porEstado = filtroEstado.value === "todas" || inc.estado === filtroEstado.value;
        const porPrioridad = filtroPrioridad.value === "todas" || inc.prioridad === filtroPrioridad.value;
        return porEstado && porPrioridad;
    }).sort((a, b) => {
        const orden = { Alta: 0, Media: 1, Baja: 2 };
        return orden[a.prioridad] - orden[b.prioridad];
    });
});

const resolver = (id) => {
    if (resoluciones.value[id]) {
        incidenciasStore.resolver(id, resoluciones.value[id]);
        delete resoluciones.value[id];
    }
};
</script>

<style scoped>
.page {
    padding: 32px;
    display: flex;
    justify-content: center;
}

.card {
    background: white;
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    max-width: 720px;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    gap: 16px;
}

h2 { color: #2c3e50; }

.filtros {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
}

.filtros select {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
}

.vacio {
    text-align: center;
    color: #aaa;
    padding: 40px 0;
    font-size: 0.95rem;
}

.incidencia-item {
    border-radius: 8px;
    padding: 16px;
    border-left: 4px solid #ddd;
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.pendiente { border-left-color: #e67e22; background: #fff9f4; }
.resuelta  { border-left-color: #42b983; background: #f4fff9; }

.inc-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
}

.badges { display: flex; gap: 6px; }

.badge {
    font-size: 0.75rem;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: bold;
}

.badge-pending    { background: #ffecd2; color: #e67e22; }
.badge-ok         { background: #d4f5e9; color: #27ae60; }
.prioridad-alta   { background: #fde8e8; color: #e74c3c; }
.prioridad-media  { background: #fef9e7; color: #f39c12; }
.prioridad-baja   { background: #eafaf1; color: #27ae60; }

.descripcion { color: #555; font-size: 0.92rem; }
small { color: #888; font-size: 0.8rem; }

.resolucion {
    background: #eafaf1;
    padding: 10px 14px;
    border-radius: 6px;
    font-size: 0.88rem;
    color: #27ae60;
}

.resolver-form {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.resolver-form textarea {
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    font-family: inherit;
    resize: vertical;
    transition: border-color 0.2s;
}

.resolver-form textarea:focus {
    outline: none;
    border-color: #42b983;
}

.resolver-form button {
    align-self: flex-end;
    padding: 8px 20px;
    background-color: #42b983;
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.2s;
}

.resolver-form button:hover:not(:disabled) { background-color: #369870; }
.resolver-form button:disabled { background-color: #aaa; cursor: not-allowed; }
</style>

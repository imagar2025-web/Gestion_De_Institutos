import { reactive } from "vue";

export const incidenciasStore = reactive({
    lista: [],

    agregar(incidencia) {
        this.lista.push({
            id: Date.now(),
            titulo: incidencia.titulo,
            descripcion: incidencia.descripcion,
            espacio_id: incidencia.espacio_id,
            prioridad: incidencia.prioridad,
            creadaPor: incidencia.creadaPor,
            fecha: new Date().toLocaleDateString("es-ES"),
            estado: "Pendiente",
            resolucion: ""
        });
    },

    resolver(id, resolucion) {
        const inc = this.lista.find(i => i.id === id);
        if (inc) {
            inc.estado = "Resuelta";
            inc.resolucion = resolucion;
        }
    }
});

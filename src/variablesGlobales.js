// ─────────────────────────────────────────────────────────────
// variablesGlobales.js
// Centraliza la URL base de la API REST del backend.
// Al exportarla desde aquí, cualquier componente que la importe
// siempre apunta al mismo servidor; si cambia la IP o el puerto
// solo hay que tocarlo en este fichero.
// ─────────────────────────────────────────────────────────────

// Dirección IP pública del servidor Node/Express desplegado en AWS.
// Puerto 3000 = puerto en el que escucha Express dentro del contenedor Docker.
export const URL = "http://44.207.19.239:3000";

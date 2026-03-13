// =============================================================================
// ARCHIVO: src/variablesGlobales.js — URL original de la API REST
// =============================================================================
// PROPÓSITO ORIGINAL: Centralizar la URL del servidor para no repetirla
//   en cada componente. Todos los componentes hacían:
//     import { URL } from "@/variablesGlobales";
//     const API_URL = URL;
//
// ESTADO ACTUAL (rama pruebas-sin-api):
//   Este archivo ya NO se importa en ningún componente de la rama mock.
//   Los componentes ahora usan: const API_URL = "http://mock"
//   y fakeApi parsea solo el nombre del recurso, ignorando el dominio.
//
// Se mantiene como REFERENCIA de cuál era la URL real del servidor.
// =============================================================================

export const URL = "http://44.207.19.239:3000";

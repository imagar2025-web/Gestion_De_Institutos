// =============================================================================
// ARCHIVO: src/mock/fakeApi.js
// =============================================================================
// PROPÓSITO: Sustituye a axios (y a fetch nativo) para que los componentes
//   sigan haciendo sus llamadas exactamente igual, pero en vez de ir al
//   servidor HTTP, las operaciones se ejecutan sobre los arrays de datos.js.
//
// ¿CÓMO FUNCIONA?
//   Cada componente construye URLs como:
//     `${API_URL}/espacios?zusuario=ivan`
//     `${API_URL}/profesores/12345678A?zusuario=ivan`
//
//   fakeApi recibe esa URL, extrae el nombre del recurso ("espacios") y
//   opcionalmente el ID ("12345678A"), busca el array correspondiente en
//   datos.js, y ejecuta la operación (leer / insertar / actualizar / borrar).
//
// ¿POR QUÉ DEVUELVE PROMESAS?
//   Los componentes usan async/await. Si devolviéramos datos síncronos,
//   habría que cambiar el código de cada componente. Con Promesas,
//   el await sigue funcionando y el flujo no cambia.
//   Además, el delay de 100ms hace que los "⏳ Cargando..." se vean
//   brevemente, igual que pasaba con la API real.
//
// ESTRUCTURA DE RESPUESTA:
//   Axios devuelve { data: ... }. Nosotros también.
//   Así "res.data" funciona igual en los componentes.
// =============================================================================

import {
  roles, estados_usuario, estados_incidencia, etapas, turnos,
  horarios, departamentos, espacios, profesores, usuarios,
  alumnos, cursos, incidencias, reservas
} from "./datos.js";

// ─── MAPA DE TABLAS ─────────────────────────────────────────────────────────
// Asocia nombre del endpoint → { datos: array reactivo, clave: campo PK }
// Cuando llega una petición a "profesores", sabemos que:
//   - Los datos están en el array "profesores"
//   - La clave primaria es "dni_nie" (no "id" como el resto)
// ─────────────────────────────────────────────────────────────────────────────
const tablas = {
  roles:              { datos: roles,              clave: "id" },
  estados_usuario:    { datos: estados_usuario,    clave: "id" },
  estados_incidencia: { datos: estados_incidencia, clave: "id" },
  etapas:             { datos: etapas,             clave: "id" },
  turnos:             { datos: turnos,             clave: "id" },
  horarios:           { datos: horarios,           clave: "id" },
  departamentos:      { datos: departamentos,      clave: "id" },
  espacios:           { datos: espacios,           clave: "id" },
  profesores:         { datos: profesores,         clave: "dni_nie" },
  usuarios:           { datos: usuarios,           clave: "login" },
  alumnos:            { datos: alumnos,            clave: "nia" },
  cursos:             { datos: cursos,             clave: "id" },
  incidencias:        { datos: incidencias,        clave: "id" },
  reservas:           { datos: reservas,           clave: "id" },
};

// ─── UTILIDAD: Simular latencia de red ──────────────────────────────────────
const delay = (ms = 100) => new Promise(r => setTimeout(r, ms));

// ─── UTILIDAD: Extraer recurso e ID de una URL ─────────────────────────────
// Entrada: "http://mock/espacios/LAB1?zusuario=ivan"
// Salida:  { recurso: "espacios", id: "LAB1" }
// Entrada: "http://mock/auth/login?zusuario=ivan"
// Salida:  { recurso: "auth/login", id: null }
// ─────────────────────────────────────────────────────────────────────────────
function parsearRuta(url) {
  // Caso especial: el endpoint de login no es un CRUD normal
  if (url.includes("/auth/login")) return { recurso: "auth/login", id: null };

  // Quitar query params (?zusuario=ivan)
  const sinParams = url.split("?")[0];
  // Partir por "/" y buscar un segmento que sea nombre de tabla conocido
  const partes = sinParams.split("/").filter(Boolean);

  for (let i = 0; i < partes.length; i++) {
    if (tablas[partes[i]]) {
      return {
        recurso: partes[i],
        id: (i + 1 < partes.length) ? partes[i + 1] : null
      };
    }
  }
  return { recurso: null, id: null };
}

// ─── LOGIN SIMULADO ─────────────────────────────────────────────────────────
// Reproduce exactamente la lógica del endpoint POST /auth/login:
//   1. Buscar usuario por login
//   2. Comprobar contraseña
//   3. Verificar que el estado permite acceso
//   4. Devolver { usuario, rol, nombre, apellidos }
// ─────────────────────────────────────────────────────────────────────────────
function loginSimulado(body) {
  // 1. Buscar usuario
  const user = usuarios.find(u => u.login === body.login);
  if (!user) throw { response: { data: { error: "Usuario no encontrado" } } };

  // 2. Comprobar contraseña
  if (user.password_hash !== body.password)
    throw { response: { data: { error: "Contraseña incorrecta" } } };

  // 3. Comprobar estado (ACT permite, BLOQ/BAJ no)
  const estado = estados_usuario.find(e => e.id === user.estado_id);
  if (estado && !estado.permite_acceso)
    throw { response: { data: { motivo: `Tu cuenta está en estado "${estado.nombre}". Contacta con el administrador.` } } };

  // 4. Buscar nombre y apellidos en la tabla de profesores
  //    (ref_identidad_fk del usuario apunta al dni_nie del profesor)
  const profe = profesores.find(p => p.dni_nie === user.ref_identidad_fk);

  // 5. Devolver exactamente lo que devolvía la API real
  return {
    data: {
      usuario:   user.login,
      rol:       user.rol_id,
      nombre:    profe ? profe.nombre    : user.login,
      apellidos: profe ? profe.apellidos : ""
    }
  };
}

// =============================================================================
// OBJETO fakeApi — Reemplaza a axios en toda la aplicación
// Métodos: get(), post(), put(), delete() — misma firma que axios
// =============================================================================
export const fakeApi = {

  // ─── GET: Obtener todos los registros ───────────────────────────────────
  // ANTES: axios.get("http://44.207.19.239:3000/espacios?zusuario=ivan")
  //        → petición HTTP → servidor consulta PostgreSQL → devuelve JSON
  // AHORA: fakeApi.get("http://mock/espacios?zusuario=ivan")
  //        → busca "espacios" en tablas → devuelve copia del array
  // ────────────────────────────────────────────────────────────────────────
  async get(url) {
    await delay();
    const { recurso } = parsearRuta(url);
    if (!recurso || !tablas[recurso]) {
      console.warn(`[fakeApi] GET — recurso no encontrado: "${url}"`);
      return { data: [] };
    }
    // Devolvemos copias (spread) para que el componente no mute el original
    return { data: tablas[recurso].datos.map(item => ({ ...item })) };
  },

  // ─── POST: Crear un registro nuevo ──────────────────────────────────────
  // ANTES: axios.post("http://.../departamentos?zusuario=ivan", { id:"FIS", ... })
  //        → servidor hace INSERT INTO departamentos → devuelve el registro
  // AHORA: fakeApi.post(...) → push() al array reactivo
  // También simula el error "duplicate key" de PostgreSQL
  // ────────────────────────────────────────────────────────────────────────
  async post(url, body) {
    await delay();
    const { recurso } = parsearRuta(url);

    // Caso especial: login
    if (recurso === "auth/login") return loginSimulado(body);

    if (!recurso || !tablas[recurso])
      throw { response: { data: { error: `Recurso "${recurso}" no existe` } } };

    const tabla = tablas[recurso];

    // Simular error de clave duplicada
    const existe = tabla.datos.find(
      item => String(item[tabla.clave]) === String(body[tabla.clave])
    );
    if (existe) {
      throw { response: { data: {
        error: `duplicate key value violates unique constraint "${recurso}_pkey"`
      }}};
    }

    // Auto-ID para incidencias y reservas (la BD usaba secuencias)
    if ((recurso === "incidencias" || recurso === "reservas") && (!body.id || body.id === "")) {
      const maxId = tabla.datos.reduce((max, i) => Math.max(max, Number(i.id) || 0), 0);
      body.id = maxId + 1;
    }

    // Insertar en el array reactivo → Vue actualiza las vistas automáticamente
    tabla.datos.push({ ...body });
    return { data: { ...body } };
  },

  // ─── PUT: Actualizar un registro existente ──────────────────────────────
  // ANTES: axios.put("http://.../profesores/12345678A?zusuario=ivan", { nombre: "Nuevo", ... })
  //        → servidor hace UPDATE profesores SET ... WHERE dni_nie = '12345678A'
  // AHORA: fakeApi.put(...) → Object.assign() sobre el objeto reactivo
  // ────────────────────────────────────────────────────────────────────────
  async put(url, body) {
    await delay();
    const { recurso, id } = parsearRuta(url);
    if (!recurso || !tablas[recurso])
      throw { response: { data: { error: `Recurso "${recurso}" no existe` } } };

    const tabla = tablas[recurso];
    const index = tabla.datos.findIndex(
      item => String(item[tabla.clave]) === String(id)
    );
    if (index === -1)
      throw { response: { data: { error: `${tabla.clave}="${id}" no encontrado` } } };

    // Object.assign modifica el objeto existente (reactivo) → Vue lo detecta
    Object.assign(tabla.datos[index], body);
    return { data: { ...tabla.datos[index] } };
  },

  // ─── DELETE: Eliminar un registro ───────────────────────────────────────
  // ANTES: axios.delete("http://.../cursos/DAW2A?zusuario=ivan")
  //        → servidor hace DELETE FROM cursos WHERE id = 'DAW2A'
  // AHORA: fakeApi.delete(...) → splice() sobre el array reactivo
  // ────────────────────────────────────────────────────────────────────────
  async delete(url) {
    await delay();
    const { recurso, id } = parsearRuta(url);
    if (!recurso || !tablas[recurso])
      throw { response: { data: { error: `Recurso "${recurso}" no existe` } } };

    const tabla = tablas[recurso];
    const index = tabla.datos.findIndex(
      item => String(item[tabla.clave]) === String(id)
    );
    if (index === -1)
      throw { response: { data: { error: `${tabla.clave}="${id}" no encontrado` } } };

    // splice() elimina del array reactivo → Vue actualiza la vista
    tabla.datos.splice(index, 1);
    return { data: { ok: true } };
  }
};

// =============================================================================
// FETCH SIMULADO — Para InfoSistema.vue que usa fetch() nativo
// =============================================================================
// InfoSistema.vue es el único componente que usa fetch() en vez de axios.
// Hacía: const response = await fetch(`${API_URL}/${ruta}${Z}`)
//        variable.value = await response.json()
// Devolvemos un objeto con { ok: true, json() } igual que el fetch real.
// =============================================================================
export async function fakeFetch(url) {
  await delay();
  const { recurso } = parsearRuta(url);
  if (!recurso || !tablas[recurso])
    return { ok: false, json: async () => [] };

  return {
    ok: true,
    json: async () => tablas[recurso].datos.map(item => ({ ...item }))
  };
}

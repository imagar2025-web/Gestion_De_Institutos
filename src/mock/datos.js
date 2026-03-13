// =============================================================================
// ARCHIVO: src/mock/datos.js
// =============================================================================
// PROPÓSITO: Contiene TODOS los datos que antes devolvía la API REST.
//   Cada array aquí corresponde a una tabla de la base de datos PostgreSQL
//   que el servidor exponía mediante endpoints HTTP.
//
// ¿POR QUÉ EXISTE?
//   El profesor cierra la API → las llamadas axios fallan → la app no funciona.
//   Este archivo proporciona los mismos datos en memoria del navegador.
//
// ¿POR QUÉ reactive()?
//   Vue necesita saber cuándo cambian los datos para actualizar la interfaz.
//   reactive() convierte estos arrays en "observables": si un componente
//   añade/edita/borra un registro, Vue repinta automáticamente las tablas,
//   listas y formularios que muestren esos datos.
//
// LIMITACIÓN: Al recargar la página (F5), los datos vuelven al estado inicial
//   definido aquí. No hay persistencia real — todo vive en RAM.
//
// CAMPOS DE AUDITORÍA (zfecha, zusuario):
//   La API requería estos campos en cada registro para saber quién y cuándo
//   creó o modificó cada fila. Los mantenemos para que la estructura sea
//   100% idéntica a lo que devolvía el servidor.
// =============================================================================

import { reactive } from "vue";

// ─── ROLES ──────────────────────────────────────────────────────────────────
// Endpoint original: GET /roles  |  POST /roles  |  PUT /roles/:id  |  DELETE /roles/:id
// Usado por: CrearRoles.vue
// Clave primaria: id
// Cada rol define un nivel de privilegio (1=máximo, 4=mínimo) que controla
// qué secciones del navbar ve cada usuario en App.vue
// ─────────────────────────────────────────────────────────────────────────────
export const roles = reactive([
  { id: "ADMIN", nombre: "Administrador",   nivel_privilegio: 1, descripcion: "Acceso total al sistema. Puede gestionar todos los recursos.",                     zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "TIC",   nombre: "Responsable TIC", nivel_privilegio: 2, descripcion: "Gestiona incidencias técnicas y espacios tecnológicos del centro.",                 zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "PROF",  nombre: "Profesor",        nivel_privilegio: 3, descripcion: "Puede crear incidencias, reservar espacios y consultar información.",               zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "ALUM",  nombre: "Alumno",          nivel_privilegio: 4, descripcion: "Acceso limitado a consulta de información y creación de incidencias.",              zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── ESTADOS DE USUARIO ─────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /estados_usuario
// Usado por: CrearUsuario.vue (sección estados), CrearAlumnos.vue (selector)
// Clave primaria: id
// El campo permite_acceso es CLAVE: el Login comprueba este campo para
// decidir si un usuario puede entrar al sistema o no
// ─────────────────────────────────────────────────────────────────────────────
export const estados_usuario = reactive([
  { id: "ACT",  nombre: "Activo",        permite_acceso: true,  descripcion: "Usuario con acceso total a la plataforma.",               zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "BAJ",  nombre: "Baja",          permite_acceso: false, descripcion: "El usuario ya no pertenece al centro.",                   zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "BLOQ", nombre: "Bloqueado",     permite_acceso: false, descripcion: "Acceso restringido por seguridad o administrador.",       zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "GRAD", nombre: "Graduado",      permite_acceso: false, descripcion: "Alumno que terminó su ciclo formativo.",                  zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "TEMP", nombre: "Baja Temporal", permite_acceso: false, descripcion: "Usuario fuera del sistema temporalmente.",                zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── ESTADOS DE INCIDENCIA ──────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /estados_incidencia
// Usado por: CrearEstadosIncidencia.vue, CrearIncidencia.vue,
//            ResolverIncidencia.vue, GestionIncidencias.vue
// Clave primaria: id
// Ciclo de vida: PENT (nueva) → PROC (alguien la está arreglando) → REST (solucionada)
// ─────────────────────────────────────────────────────────────────────────────
export const estados_incidencia = reactive([
  { id: "PENT", nombre: "Pendiente",  zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "PROC", nombre: "En proceso", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "REST", nombre: "Resuelta",   zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── ETAPAS EDUCATIVAS ──────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /etapas
// Usado por: CrearEtapas.vue, referenciado por cursos (etapa_id)
// Clave primaria: id
// ─────────────────────────────────────────────────────────────────────────────
export const etapas = reactive([
  { id: "ESO",  nombre: "ESO",          descripcion: "Educación Secundaria Obligatoria",                                     zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "BACH", nombre: "Bachillerato", descripcion: "Bachillerato general",                                                 zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "DAW",  nombre: "DAW",          descripcion: "Ciclo Formativo de Grado Superior - Desarrollo de Aplicaciones Web",   zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "ASIR", nombre: "ASIR",         descripcion: "Administración de Sistemas Informáticos en Red",                       zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "SMR",  nombre: "SMR",          descripcion: "Sistemas Microinformáticos y Redes",                                   zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── TURNOS ─────────────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /turnos
// Usado por: CrearTurnos.vue, referenciado por horarios y cursos (turno_id)
// Clave primaria: id
// ─────────────────────────────────────────────────────────────────────────────
export const turnos = reactive([
  { id: "M", nombre: "Mañana", horario_referencia: "08:00 - 14:30", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "T", nombre: "Tarde",  horario_referencia: "15:00 - 21:00", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── HORARIOS ───────────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /horarios
// Usado por: CrearHorarios.vue, ReservarEspacio.vue (selector de franja)
// Clave primaria: id
// Cada horario es una franja del día. ReservarEspacio.vue los cruza con las
// reservas existentes para mostrar solo los horarios libres
// ─────────────────────────────────────────────────────────────────────────────
export const horarios = reactive([
  { id: "M1",  nombre: "1ª hora mañana", hora_inicio: "08:00", hora_fin: "08:55", turno_id: "M", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "M2",  nombre: "2ª hora mañana", hora_inicio: "08:55", hora_fin: "09:50", turno_id: "M", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "M3",  nombre: "3ª hora mañana", hora_inicio: "09:50", hora_fin: "10:45", turno_id: "M", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "REC", nombre: "Recreo",         hora_inicio: "10:45", hora_fin: "11:15", turno_id: "M", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "M4",  nombre: "4ª hora mañana", hora_inicio: "11:15", hora_fin: "12:10", turno_id: "M", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "M5",  nombre: "5ª hora mañana", hora_inicio: "12:10", hora_fin: "13:05", turno_id: "M", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "M6",  nombre: "6ª hora mañana", hora_inicio: "13:05", hora_fin: "14:00", turno_id: "M", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "T1",  nombre: "1ª hora tarde",  hora_inicio: "15:00", hora_fin: "15:55", turno_id: "T", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "T2",  nombre: "2ª hora tarde",  hora_inicio: "15:55", hora_fin: "16:50", turno_id: "T", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "T3",  nombre: "3ª hora tarde",  hora_inicio: "16:50", hora_fin: "17:45", turno_id: "T", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── DEPARTAMENTOS ──────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /departamentos
// Usado por: CrearDepartamento.vue, CrearProfesores.vue (selector)
// Clave primaria: id
// ─────────────────────────────────────────────────────────────────────────────
export const departamentos = reactive([
  { id: "INF", nombre: "Informática",         ubicacion: "Planta 2", correo_contacto: "informatica@scarlatti.es", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "MAT", nombre: "Matemáticas",         ubicacion: "Planta 1", correo_contacto: "matematicas@scarlatti.es", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "LEN", nombre: "Lengua y Literatura", ubicacion: "Planta 1", correo_contacto: "lengua@scarlatti.es",      zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "ING", nombre: "Inglés",              ubicacion: "Planta 0", correo_contacto: "ingles@scarlatti.es",      zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── ESPACIOS (Aulas, laboratorios, etc.) ───────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /espacios
// Usado por: CrearEspacios.vue, ReservarEspacio.vue, CrearIncidencia.vue,
//            GestionIncidencias.vue, CrearCursos.vue, InfoSistema.vue
// Clave primaria: id
// Es la tabla MÁS referenciada del proyecto (6 componentes la leen)
// El campo estado_operativo controla si se puede reservar o no
// ─────────────────────────────────────────────────────────────────────────────
export const espacios = reactive([
  { id: "12",   nombre: "VR",                         ubicacion_planta: "2", capacidad_max: 22,  equipamiento: "todo lo que ale prometio",         estado_operativo: "operativa",          zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "A101", nombre: "Aula 101",                   ubicacion_planta: "1", capacidad_max: 30,  equipamiento: "Proyector, pizarra digital",      estado_operativo: "operativa",          zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "A102", nombre: "Aula 102",                   ubicacion_planta: "1", capacidad_max: 28,  equipamiento: "Proyector, pizarra tradicional",  estado_operativo: "operativa",          zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "LAB1", nombre: "Laboratorio Informática 1",  ubicacion_planta: "2", capacidad_max: 20,  equipamiento: "20 PCs, proyector, servidor",     estado_operativo: "operativa",          zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "LAB2", nombre: "Laboratorio Informática 2",  ubicacion_planta: "2", capacidad_max: 18,  equipamiento: "18 PCs, impresora 3D",            estado_operativo: "mantenimiento",      zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "BIB",  nombre: "Biblioteca",                 ubicacion_planta: "0", capacidad_max: 50,  equipamiento: "Mesas de estudio, 5 PCs",         estado_operativo: "operativa",          zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "GIM",  nombre: "Gimnasio",                   ubicacion_planta: "0", capacidad_max: 40,  equipamiento: "Material deportivo completo",     estado_operativo: "operativa",          zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "SAL",  nombre: "Salón de actos",             ubicacion_planta: "0", capacidad_max: 200, equipamiento: "Sonido, proyector, escenario",    estado_operativo: "fuera_de_servicio",  zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── PROFESORES ─────────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /profesores
// Usado por: CrearProfesores.vue, CrearCursos.vue (selector tutor)
// Clave primaria: dni_nie (NO es "id" como el resto)
// El login simulado busca aquí el nombre/apellidos del profesor logueado
// ─────────────────────────────────────────────────────────────────────────────
export const profesores = reactive([
  { dni_nie: "12345678A", nombre: "Carlos",    apellidos: "García López",     correo_institucional: "carlos.garcia@scarlatti.es",    departamento_id: "INF", rol_id: "PROF", password_hash: "1234", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { dni_nie: "87654321B", nombre: "María",     apellidos: "Fernández Ruiz",   correo_institucional: "maria.fernandez@scarlatti.es",  departamento_id: "MAT", rol_id: "PROF", password_hash: "1234", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { dni_nie: "11111111C", nombre: "Alejandro", apellidos: "Martínez Soto",    correo_institucional: "alejandro.martinez@scarlatti.es", departamento_id: "INF", rol_id: "TIC",  password_hash: "1234", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { dni_nie: "22222222D", nombre: "Laura",     apellidos: "Sánchez Vega",     correo_institucional: "laura.sanchez@scarlatti.es",    departamento_id: "LEN", rol_id: "PROF", password_hash: "1234", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── USUARIOS ───────────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /usuarios  +  POST /auth/login
// Usado por: CrearUsuario.vue, GestionIncidencias.vue, ResolverIncidencia.vue, Login.vue
// Clave primaria: login
// Esta tabla es FUNDAMENTAL:
//   - Login.vue comprueba login + password_hash aquí
//   - ResolverIncidencia.vue busca ref_identidad_fk para saber el DNI del responsable
//   - El campo estado_id se cruza con estados_usuario para ver si permite_acceso
// ─────────────────────────────────────────────────────────────────────────────
export const usuarios = reactive([
  { login: "Adminivan",  password_hash: "1234", rol_id: "ADMIN", ref_identidad_fk: "11111",     estado_id: "ACT",  ultimo_acceso: "2026-02-10T00:00:00.000Z", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { login: "TICale",     password_hash: "1234", rol_id: "TIC",   ref_identidad_fk: "11111111C", estado_id: "ACT",  ultimo_acceso: "2026-03-01T00:00:00.000Z", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { login: "PROFcarlos", password_hash: "1234", rol_id: "PROF",  ref_identidad_fk: "12345678A", estado_id: "ACT",  ultimo_acceso: "2026-03-05T00:00:00.000Z", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { login: "ALUMpedro",  password_hash: "1234", rol_id: "ALUM",  ref_identidad_fk: "5001",      estado_id: "ACT",  ultimo_acceso: "2026-03-10T00:00:00.000Z", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { login: "BLOQuser",   password_hash: "1234", rol_id: "ALUM",  ref_identidad_fk: "9999",      estado_id: "BLOQ", ultimo_acceso: "2026-01-15T00:00:00.000Z", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── ALUMNOS ────────────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /alumnos
// Usado por: CrearAlumnos.vue, InfoSistema.vue
// Clave primaria: nia (número)
// ─────────────────────────────────────────────────────────────────────────────
export const alumnos = reactive([
  { nia: 5001, nombre: "Pedro",  apellidos: "López Martín",  correo_electronico: "pedro.lopez@alumno.scarlatti.es",  curso_id: "DAW2A", tutor_legal_contacto: "Ana Martín - 612345678",    estado_id: "ACT", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { nia: 5002, nombre: "Lucía",  apellidos: "Romero Gil",    correo_electronico: "lucia.romero@alumno.scarlatti.es", curso_id: "DAW2A", tutor_legal_contacto: "José Romero - 698765432",    estado_id: "ACT", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { nia: 5003, nombre: "Miguel", apellidos: "Torres Díaz",   correo_electronico: "miguel.torres@alumno.scarlatti.es", curso_id: "SMR1A", tutor_legal_contacto: "Carmen Díaz - 654321098",   estado_id: "ACT", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── CURSOS ─────────────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /cursos
// Usado por: CrearCursos.vue, CrearAlumnos.vue (selector), InfoSistema.vue
// Clave primaria: id
// Relaciones: etapa_id → etapas, turno_id → turnos, tutor_id → profesores, aula_id → espacios
// ─────────────────────────────────────────────────────────────────────────────
export const cursos = reactive([
  { id: "DAW2A",  nombre_curso: "2º DAW",  etapa_id: "DAW",  grupo: "A", turno_id: "M", anio_academico: "2025-2026", tutor_id: "12345678A", aula_id: "LAB1", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "DAW1A",  nombre_curso: "1º DAW",  etapa_id: "DAW",  grupo: "A", turno_id: "T", anio_academico: "2025-2026", tutor_id: "87654321B", aula_id: "LAB2", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "SMR1A",  nombre_curso: "1º SMR",  etapa_id: "SMR",  grupo: "A", turno_id: "M", anio_academico: "2025-2026", tutor_id: "22222222D", aula_id: "A101", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
  { id: "ASIR2A", nombre_curso: "2º ASIR", etapa_id: "ASIR", grupo: "A", turno_id: "M", anio_academico: "2025-2026", tutor_id: "11111111C", aula_id: "A102", zfecha: "2026-02-23T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── INCIDENCIAS ────────────────────────────────────────────────────────────
// Endpoint original: GET/POST/PUT/DELETE /incidencias
// Usado por: CrearIncidencia.vue, ResolverIncidencia.vue, GestionIncidencias.vue
// Clave primaria: id (numérico, autoincremental en la BD)
// Flujo completo:
//   1. Un usuario CREA la incidencia (estado PENT, sin responsable)
//   2. El TIC la pone en PROC y se asigna como responsable
//   3. El TIC la marca como REST, escribe comentarios_resolucion y fecha_resolucion
// ─────────────────────────────────────────────────────────────────────────────
export const incidencias = reactive([
  { id: 1, espacio_id: "LAB2", usuario_login: "PROFcarlos", descripcion_problema: "El proyector no enciende, parece que la lámpara está fundida",            estado_incidencia_id: "PENT", responsable_resolucion_id: "",          comentarios_resolucion: "",                                                           fecha_resolucion: "",                         zfecha: "2026-03-01T00:00:00.000Z", zusuario: "ivan" },
  { id: 2, espacio_id: "A101", usuario_login: "ALUMpedro",  descripcion_problema: "La pizarra digital no responde al tacto desde hace dos días",             estado_incidencia_id: "PROC", responsable_resolucion_id: "11111111C", comentarios_resolucion: "",                                                           fecha_resolucion: "",                         zfecha: "2026-03-03T00:00:00.000Z", zusuario: "ivan" },
  { id: 3, espacio_id: "12",   usuario_login: "Adminivan",  descripcion_problema: "Los cascos de VR del puesto 3 no conectan por bluetooth",                 estado_incidencia_id: "REST", responsable_resolucion_id: "11111111C", comentarios_resolucion: "Se cambió el adaptador bluetooth y se emparejaron de nuevo", fecha_resolucion: "2026-03-05T00:00:00.000Z", zfecha: "2026-02-28T00:00:00.000Z", zusuario: "ivan" },
  { id: 4, espacio_id: "LAB1", usuario_login: "PROFcarlos", descripcion_problema: "El PC del puesto 7 no arranca, se queda en pantalla negra",               estado_incidencia_id: "PENT", responsable_resolucion_id: "",          comentarios_resolucion: "",                                                           fecha_resolucion: "",                         zfecha: "2026-03-10T00:00:00.000Z", zusuario: "ivan" },
]);

// ─── RESERVAS DE ESPACIOS ───────────────────────────────────────────────────
// Endpoint original: GET/POST/DELETE /reservas (no hay PUT en este caso)
// Usado por: ReservarEspacio.vue
// Clave primaria: id (numérico, autoincremental)
// Vincula: usuario + espacio + horario + fecha → una reserva concreta
// ReservarEspacio.vue cruza esta tabla con horarios para calcular qué
// franjas están libres en una fecha+espacio determinados
// ─────────────────────────────────────────────────────────────────────────────
export const reservas = reactive([
  { id: 1, espacio_id: "LAB1", horario_id: "M1", usuario_login: "PROFcarlos", fecha_reserva: "2026-03-14", motivo_reserva: "Clase práctica de programación",  zfecha: "2026-03-10T00:00:00.000Z", zusuario: "ivan" },
  { id: 2, espacio_id: "A101", horario_id: "M3", usuario_login: "PROFcarlos", fecha_reserva: "2026-03-14", motivo_reserva: "Examen parcial de Bases de Datos", zfecha: "2026-03-10T00:00:00.000Z", zusuario: "ivan" },
  { id: 3, espacio_id: "BIB",  horario_id: "T1", usuario_login: "TICale",     fecha_reserva: "2026-03-15", motivo_reserva: "Taller de ciberseguridad",        zfecha: "2026-03-11T00:00:00.000Z", zusuario: "ivan" },
]);

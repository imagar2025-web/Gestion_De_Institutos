# Gestión de Institutos — Rama de Pruebas (Sin API)

## Qué es esta rama

Versión del proyecto que funciona **sin el servidor API REST**. Todos los datos
que antes venían del servidor ahora están en memoria del navegador dentro de
archivos JavaScript en la carpeta `src/mock/`.

## Qué ha cambiado

### Archivos NUEVOS (2 archivos en `src/mock/`)

| Archivo | Función |
|---------|---------|
| `src/mock/datos.js` | Arrays reactivos con los datos de las 14 tablas de la BD. Misma estructura JSON que devolvía cada endpoint. |
| `src/mock/fakeApi.js` | Servicio con métodos `get/post/put/delete` que opera sobre los arrays de datos.js. Reemplaza a axios. Incluye `fakeFetch` para InfoSistema.vue. |

### Archivos MODIFICADOS (17 componentes)

En cada `.vue` se hicieron 3 sustituciones + se añadió cabecera explicativa:

1. `import axios from "axios"` → `import { fakeApi } from "@/mock/fakeApi"`
2. `import { URL } from "@/variablesGlobales"` → comentado
3. `axios.get/post/put/delete` → `fakeApi.get/post/put/delete`
4. `const API_URL = URL` → `const API_URL = "http://mock"`

InfoSistema.vue: adicionalmente `fetch()` → `fakeFetch()`

### Archivos SIN CAMBIOS funcionales

App.vue, router/index.js, main.js, variablesGlobales.js, vistas — solo se
añadieron comentarios descriptivos.

## Estructura del proyecto

```
src/
├── mock/                          ← NUEVO
│   ├── datos.js                   ← Datos de las 14 tablas
│   └── fakeApi.js                 ← Servicio que reemplaza a axios
├── components/                    ← TODOS modificados y comentados
│   ├── Login.vue
│   ├── CrearIncidencia.vue
│   ├── ResolverIncidencia.vue
│   ├── GestionIncidencias.vue
│   ├── ReservarEspacio.vue
│   ├── CrearEspacios.vue
│   ├── CrearDepartamento.vue
│   ├── CrearProfesores.vue
│   ├── CrearUsuario.vue
│   ├── CrearCursos.vue
│   ├── CrearAlumnos.vue
│   ├── CrearRoles.vue
│   ├── CrearEtapas.vue
│   ├── CrearTurnos.vue
│   ├── CrearHorarios.vue
│   ├── CrearEstadosIncidencia.vue
│   ├── InfoSistema.vue
│   └── HelloWorld.vue
├── router/index.js                ← Comentado
├── views/                         ← Comentados
├── App.vue                        ← Comentado
├── main.js                        ← Comentado
└── variablesGlobales.js           ← Mantenido como referencia
```

## Usuarios de prueba

| Login | Password | Rol | Estado | Qué puede hacer |
|-------|----------|-----|--------|-----------------|
| `Adminivan` | `1234` | ADMIN | Activo | Todo: CRUD completo de todas las tablas |
| `TICale` | `1234` | TIC | Activo | Incidencias (crear + resolver) + Reservar aulas |
| `PROFcarlos` | `1234` | PROF | Activo | Crear incidencias + Reservar aulas |
| `ALUMpedro` | `1234` | ALUM | Activo | Solo crear incidencias |
| `BLOQuser` | `1234` | ALUM | Bloqueado | No puede entrar (para probar el rechazo) |

## Endpoints simulados

| Endpoint | Operaciones | Usado por |
|----------|-------------|-----------|
| `POST /auth/login` | Autenticación | Login.vue |
| `/roles` | CRUD | CrearRoles.vue |
| `/estados_usuario` | CRUD | CrearUsuario.vue, CrearAlumnos.vue |
| `/estados_incidencia` | CRUD | CrearEstadosIncidencia, CrearIncidencia, ResolverIncidencia, GestionIncidencias |
| `/etapas` | CRUD | CrearEtapas.vue |
| `/turnos` | CRUD | CrearTurnos.vue |
| `/horarios` | CRUD | CrearHorarios.vue, ReservarEspacio.vue |
| `/departamentos` | CRUD | CrearDepartamento.vue, CrearProfesores.vue |
| `/espacios` | CRUD | CrearEspacios, ReservarEspacio, CrearIncidencia, GestionIncidencias, CrearCursos, InfoSistema |
| `/profesores` | CRUD | CrearProfesores.vue, CrearCursos.vue |
| `/usuarios` | CRUD | CrearUsuario.vue, GestionIncidencias.vue, ResolverIncidencia.vue |
| `/alumnos` | CRUD | CrearAlumnos.vue, InfoSistema.vue |
| `/cursos` | CRUD | CrearCursos.vue, CrearAlumnos.vue, InfoSistema.vue |
| `/incidencias` | CRUD | CrearIncidencia, ResolverIncidencia, GestionIncidencias |
| `/reservas` | CRD | ReservarEspacio.vue |

## Cómo crear la rama en GitHub

```bash
# 1. Situarte en main y actualizar
cd Gestion_De_Institutos
git checkout main
git pull origin main

# 2. Crear la rama de pruebas
git checkout -b pruebas-sin-api

# 3. Copiar todo el contenido de src/ del ZIP descargado
#    sobreescribiendo el src/ actual

# 4. Commit y push
git add .
git commit -m "feat: version sin API con datos mock en memoria"
git push origin pruebas-sin-api
```

## Cómo alternar entre versiones

```bash
git checkout main              # Versión con API real
git checkout pruebas-sin-api   # Versión con mock
```

## Limitaciones

- Los datos no persisten al recargar la página
- No hay validaciones de foreign keys (solo duplicate key)
- El delay simulado es de 100ms (la API real podía tardar más)

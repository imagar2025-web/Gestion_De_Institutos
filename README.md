# 🏫 Gestión de Institutos — Cliente Vue.js

![Vue.js](https://img.shields.io/badge/Vue.js-3.x-42b983?style=flat-square&logo=vue.js)
![Node.js](https://img.shields.io/badge/Node.js-18.x-339933?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

Aplicación web para la **gestión integral de un instituto educativo**. Desarrollada con Vue.js 3 en el frontend y conectada a una API REST con base de datos PostgreSQL. Incluye autenticación por roles, gestión de incidencias, reserva de espacios y panel de administración.

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Uso](#-uso)
- [Roles y Permisos](#-roles-y-permisos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)
- [Contacto](#-contacto)

---

## ✨ Características

- 🔐 **Autenticación por roles** — Login con control de acceso según el perfil del usuario
- 🔧 **Gestión de incidencias** — Creación y resolución de incidencias por parte del personal TIC
- 🏫 **Reserva de espacios** — Sistema de reservas de aulas con detección de conflictos de horario
- 👥 **Panel de administración** — Alta de departamentos, profesores, usuarios y cursos
- 🛡️ **Auditoría ZUSUARIO/ZFECHA** — Registro de quién y cuándo realiza cada acción
- 📱 **Diseño responsive** — Adaptado a dispositivos móviles y escritorio

---

## 🛠️ Tecnologías

| Tecnología | Versión | Uso |
|---|---|---|
| Vue.js | 3.x | Framework frontend |
| Vue Router | 4.x | Navegación y guardias de ruta |
| Axios | 1.x | Llamadas a la API REST |
| Node.js | 18.x | Entorno de ejecución |
| PostgreSQL | 15 | Base de datos |

---

## 🚀 Instalación

### Requisitos previos

- Node.js 18 o superior
- npm 9 o superior
- Acceso a la API REST del proyecto

### Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/imagar2025-web/Gestion_De_Institutos.git

# 2. Entrar en la carpeta del proyecto
cd Gestion_De_Institutos

# 3. Instalar las dependencias
npm install

# 4. Arrancar el servidor de desarrollo
npm run serve
```

La aplicación estará disponible en `http://localhost:8080`

---

## 💻 Uso

### Primer acceso

Para acceder a la aplicación necesitas un usuario registrado en la base de datos. El orden correcto de creación de datos es:

1. Crear el **Rol** (ADMIN, TIC, PROF, ALUM)
2. Crear el **Departamento**
3. Insertar el **Profesor**
4. Crear el **Usuario** vinculado al profesor

### Navegación según rol

| Rol | Acceso |
|---|---|
| 🔴 Administrador | Todo el sistema |
| 🟠 TIC | Incidencias + Resolver + Reservas |
| 🟡 Profesor | Incidencias + Reservas |
| 🟢 Alumno | Solo Incidencias |

### Crear una incidencia

1. Inicia sesión con tus credenciales
2. Ve a **Incidencias → Crear**
3. Selecciona el espacio afectado, la prioridad y describe el problema
4. Pulsa **Enviar incidencia**

### Reservar un espacio

1. Ve a **Espacios → Reservar aula**
2. Selecciona el espacio del desplegable
3. Elige fecha y franja horaria
4. El sistema detecta automáticamente si hay conflicto de reservas

---

## 🔐 Roles y Permisos
```
ADMIN  → Acceso total: incidencias, espacios, resolución y mantenimiento
TIC    → Incidencias (crear + resolver) y reserva de espacios  
PROF   → Incidencias (crear) y reserva de espacios
ALUM   → Solo creación de incidencias
```

### Estados de usuario

| Estado | Acceso | Descripción |
|---|---|---|
| ACT | ✅ Sí | Activo — acceso total |
| BAJ | ❌ No | Baja — ya no pertenece al centro |
| BLOQ | ❌ No | Bloqueado por seguridad |
| GRAD | ❌ No | Graduado — ciclo completado |
| TEMP | ❌ No | Baja temporal |

> ⚠️ **Solo los usuarios con estado ACT pueden iniciar sesión.**

---

## 📁 Estructura del Proyecto
```
src/
├── components/
│   ├── Login.vue              # Pantalla de autenticación
│   ├── CrearIncidencia.vue    # Formulario de incidencias
│   ├── ResolverIncidencia.vue # Panel TIC/Admin
│   ├── ReservarEspacio.vue    # Reserva de aulas
│   ├── CrearDepartamento.vue  # Mantenimiento
│   ├── CrearProfesores.vue    # Mantenimiento
│   ├── CrearUsuario.vue       # Mantenimiento
│   └── CrearCursos.vue        # Mantenimiento
├── store/
│   └── incidencias.js         # Estado global reactivo
├── router/
│   └── index.js               # Rutas y guardias de navegación
├── views/
│   └── HomeView.vue
└── main.js
```

---

## 🤝 Contribuir

Las contribuciones son bienvenidas. Para contribuir:

1. Haz un **fork** del repositorio
2. Crea una rama con tu mejora:
```bash
   git checkout -b feature/nueva-funcionalidad
```
3. Haz commit de tus cambios:
```bash
   git commit -m "feat: descripcion de la mejora"
```
4. Sube la rama:
```bash
   git push origin feature/nueva-funcionalidad
```
5. Abre una **Pull Request** describiendo los cambios

### Convención de commits
```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     cambios en documentación
style:    cambios de formato
refactor: refactorización de código
```

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más información.

---

## 📬 Contacto

**Iván Martín García**

[![Email](https://img.shields.io/badge/Email-imagar2025%40gmail.com-D14836?style=flat-square&logo=gmail)](mailto:imagar2025@gmail.com)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-ivan--martin--garcia22-0077B5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/ivan-martin-garcia22)
[![GitHub](https://img.shields.io/badge/GitHub-imagar2025--web-181717?style=flat-square&logo=github)](https://github.com/imagar2025-web)

---

⭐ Si este proyecto te ha sido útil, ¡dale una estrella en GitHub!

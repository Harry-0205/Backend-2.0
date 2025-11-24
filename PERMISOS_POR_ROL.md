# 🔐 Permisos por Rol - Sistema Veterinaria

Este documento detalla los permisos y funcionalidades disponibles para cada rol de usuario en el sistema de gestión veterinaria, basado en las anotaciones `@PreAuthorize` del backend.

---

## 📋 Tabla de Contenidos

- [Roles del Sistema](#roles-del-sistema)
- [Autenticación](#autenticación)
- [Gestión de Usuarios](#gestión-de-usuarios)
- [Gestión de Mascotas](#gestión-de-mascotas)
- [Gestión de Citas](#gestión-de-citas)
- [Historias Clínicas](#historias-clínicas)
- [Gestión de Veterinarias](#gestión-de-veterinarias)
- [Reportes](#reportes)
- [Dashboard](#dashboard)
- [Búsquedas](#búsquedas)
- [Generación de PDFs](#generación-de-pdfs)
- [Matriz de Permisos](#matriz-de-permisos)

---

## 🎭 Roles del Sistema

El sistema cuenta con **4 roles principales**:

| Rol | Descripción | Nivel de Acceso |
|-----|-------------|----------------|
| **ADMIN** | Administrador del sistema | ⭐⭐⭐⭐⭐ Completo |
| **RECEPCIONISTA** | Personal de recepción | ⭐⭐⭐⭐ Alto |
| **VETERINARIO** | Médico veterinario | ⭐⭐⭐ Medio-Alto |
| **CLIENTE** | Propietario de mascotas | ⭐⭐ Básico |

---

## 🔑 Autenticación

### Endpoints Públicos (sin autenticación)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/auth/signin` | POST | Iniciar sesión |
| `/api/auth/signup` | POST | Registrar nuevo usuario |

> **Nota**: Estos endpoints no requieren autenticación y están disponibles para todos.

---

## 👥 Gestión de Usuarios

### 1️⃣ Listar Usuarios

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Obtener lista completa de usuarios del sistema.

---

### 2️⃣ Obtener Usuario por Documento

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/{documento}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟠 CLIENTE <br> 🟡 VETERINARIO |

**Descripción**: Consultar información de un usuario específico por su documento.

---

### 3️⃣ Listar Todos los Roles

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/roles/all` | GET | 🔵 ADMIN |

**Descripción**: Obtener lista de todos los roles disponibles en el sistema.

**⚠️ Exclusivo**: Solo ADMIN.

---

### 4️⃣ Crear Usuario

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios` | POST | 🔵 ADMIN <br> 🟢 RECEPCIONISTA |

**Descripción**: Registrar un nuevo usuario en el sistema.

---

### 5️⃣ Actualizar Usuario por Documento

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/{documento}` | PUT | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 👤 Propietario |

**Descripción**: Actualizar información de un usuario.

**🔐 Regla Especial**: El usuario puede editar su propia información aunque no sea ADMIN o RECEPCIONISTA.

---

### 6️⃣ Actualizar Usuario por Username

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/username/{username}` | PUT | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 👤 Propietario |

**Descripción**: Actualizar información de un usuario por su nombre de usuario.

**🔐 Regla Especial**: El usuario puede editar su propia información si el username coincide con su sesión.

---

### 7️⃣ Desactivar Usuario

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/{documento}/desactivar` | PATCH | 🔵 ADMIN <br> 🟢 RECEPCIONISTA |

**Descripción**: Desactivar un usuario (soft delete).

---

### 8️⃣ Activar Usuario

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/{documento}/activar` | PATCH | 🔵 ADMIN <br> 🟢 RECEPCIONISTA |

**Descripción**: Reactivar un usuario desactivado.

---

### 9️⃣ Eliminar Usuario

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/{documento}` | DELETE | 🔵 ADMIN |

**Descripción**: Eliminar permanentemente un usuario del sistema.

**⚠️ Exclusivo**: Solo ADMIN puede eliminar usuarios de forma permanente.

---

### 🔟 Cambiar Contraseña

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/{documento}/cambiar-password` | PUT | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 👤 Propietario |

**Descripción**: Cambiar la contraseña de un usuario.

**🔐 Regla Especial**: El usuario puede cambiar su propia contraseña.

---

### Listar Veterinarios

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/veterinarios` | GET | 🔵 ADMIN |
| `/api/usuarios/veterinarios/public` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA |

**Descripción**: Obtener lista de usuarios con rol VETERINARIO.

---

### Obtener Clientes

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/usuarios/clientes` | GET | 🔵 ADMIN |
| `/api/usuarios/clientes/public` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟠 CLIENTE |

**Descripción**: Obtener lista de usuarios con rol CLIENTE.

---

## 🐾 Gestión de Mascotas

### 1️⃣ Listar Todas las Mascotas

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Obtener lista completa de mascotas registradas.

---

### 2️⃣ Crear Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas` | POST | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Registrar una nueva mascota en el sistema.

---

### 3️⃣ Obtener Mascota por ID

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/{id}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO <br> 👤 Propietario |

**Descripción**: Consultar información de una mascota específica.

**🔐 Regla Especial**: El propietario puede ver la información de sus propias mascotas.

---

### 4️⃣ Obtener Mascotas por Propietario

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/propietario/{propietarioDocumento}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO <br> 👤 Propietario |

**Descripción**: Listar todas las mascotas de un propietario específico.

**🔐 Regla Especial**: Los clientes pueden listar sus propias mascotas.

---

### 5️⃣ Buscar Mascotas por Nombre

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/buscar/nombre` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO <br> 👤 Propietario |

**Descripción**: Buscar mascotas por nombre.

---

### 6️⃣ Buscar Mascotas por Especie

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/buscar/especie/{especie}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Filtrar mascotas por especie (perro, gato, etc.).

---

### 7️⃣ Buscar Mascotas por Raza

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/buscar/raza/{raza}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Filtrar mascotas por raza.

---

### 8️⃣ Buscar Mascotas por Estado

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/estado/{activo}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Filtrar mascotas activas o inactivas.

---

### 9️⃣ Obtener Mascotas Públicas (por Cliente)

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/public` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟠 CLIENTE |

**Descripción**: Endpoint público para que los clientes vean sus mascotas.

---

### 🔟 Actualizar Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/{id}` | PUT | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO <br> 👤 Propietario |

**Descripción**: Actualizar información de una mascota.

**🔐 Regla Especial**: El propietario puede editar sus propias mascotas.

---

### Eliminar Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/{id}` | DELETE | 🔵 ADMIN |

**Descripción**: Eliminar permanentemente una mascota.

**⚠️ Exclusivo**: Solo ADMIN.

---

### Desactivar Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/{id}/desactivar` | PATCH | 🔵 ADMIN <br> 🟢 RECEPCIONISTA |

**Descripción**: Desactivar una mascota (soft delete).

---

### Activar Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/mascotas/{id}/activar` | PATCH | 🔵 ADMIN |

**Descripción**: Reactivar una mascota desactivada.

**⚠️ Exclusivo**: Solo ADMIN.

---

## 📅 Gestión de Citas

### 1️⃣ Listar Todas las Citas

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Obtener lista completa de citas.

---

### 2️⃣ Crear Cita

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas` | POST | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Agendar una nueva cita médica.

---

### 3️⃣ Obtener Cita por ID

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/{id}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO <br> 👤 Cliente de la cita |

**Descripción**: Consultar información de una cita específica.

**🔐 Regla Especial**: El cliente puede ver sus propias citas.

---

### 4️⃣ Obtener Citas por Cliente

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/cliente/{clienteDocumento}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO <br> 👤 Propietario |

**Descripción**: Listar citas de un cliente específico.

**🔐 Regla Especial**: Los clientes pueden ver sus propias citas.

---

### 5️⃣ Obtener Citas por Veterinario

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/veterinario/{veterinarioDocumento}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 👤 Veterinario propietario |

**Descripción**: Listar citas asignadas a un veterinario.

**🔐 Regla Especial**: Los veterinarios pueden ver sus propias citas.

---

### 6️⃣ Obtener Citas por Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/mascota/{mascotaId}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO <br> 👤 Propietario de la mascota |

**Descripción**: Listar citas de una mascota específica.

**🔐 Regla Especial**: El propietario puede ver las citas de sus mascotas.

---

### 7️⃣ Obtener Citas por Veterinaria

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/veterinaria/{veterinariaId}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Listar citas de una veterinaria específica.

---

### 8️⃣ Obtener Citas por Fecha

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/fecha` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Filtrar citas por fecha específica.

---

### 9️⃣ Obtener Citas por Estado

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/estado/{estado}` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Filtrar citas por estado (PROGRAMADA, EN_CURSO, FINALIZADA, CANCELADA).

---

### 🔟 Obtener Próximas Citas

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/proximas` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟠 CLIENTE <br> 🟡 VETERINARIO |

**Descripción**: Listar próximas citas programadas.

---

### Actualizar Cita

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/{id}` | PUT | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Actualizar información de una cita existente.

---

### Eliminar Cita

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/{id}` | DELETE | 🔵 ADMIN |

**Descripción**: Eliminar permanentemente una cita.

**⚠️ Exclusivo**: Solo ADMIN.

---

### Cancelar Cita

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/{id}/cancelar` | PATCH | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 👤 Cliente de la cita |

**Descripción**: Cancelar una cita programada.

**🔐 Regla Especial**: El cliente puede cancelar sus propias citas.

---

### Confirmar Cita

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/{id}/confirmar` | PATCH | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Confirmar asistencia a una cita.

---

### Iniciar Cita

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/{id}/iniciar` | PATCH | 🔵 ADMIN <br> 🟡 VETERINARIO |

**Descripción**: Marcar una cita como "EN_CURSO".

---

### Finalizar Cita

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/citas/{id}/finalizar` | PATCH | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Marcar una cita como "FINALIZADA".

---

## 📋 Historias Clínicas

### 1️⃣ Listar Todas las Historias Clínicas

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas` | GET | 🔵 ADMIN <br> 🟡 VETERINARIO <br> 🟢 RECEPCIONISTA |

**Descripción**: Obtener lista completa de historias clínicas.

---

### 2️⃣ Crear Historia Clínica

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas` | POST | 🔵 ADMIN <br> 🟡 VETERINARIO <br> 🟢 RECEPCIONISTA |

**Descripción**: Crear una nueva historia clínica para una mascota.

---

### 3️⃣ Obtener Historia Clínica por ID

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas/{id}` | GET | 🔵 ADMIN <br> 🟡 VETERINARIO <br> 🟢 RECEPCIONISTA <br> 👤 Propietario de la mascota |

**Descripción**: Consultar una historia clínica específica.

**🔐 Regla Especial**: El propietario puede ver las historias clínicas de sus mascotas.

---

### 4️⃣ Obtener Historias Clínicas por Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas/mascota/{mascotaId}` | GET | 🔵 ADMIN <br> 🟡 VETERINARIO <br> 🟢 RECEPCIONISTA <br> 👤 Propietario de la mascota |

**Descripción**: Listar todas las historias clínicas de una mascota.

**🔐 Regla Especial**: El propietario puede ver las historias clínicas de sus mascotas.

---

### 5️⃣ Obtener Historias Clínicas por Veterinario

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas/veterinario/{veterinarioDocumento}` | GET | 🔵 ADMIN <br> 🟡 VETERINARIO <br> 🟢 RECEPCIONISTA |

**Descripción**: Listar historias clínicas creadas por un veterinario específico.

---

### 6️⃣ Buscar Historias Clínicas por Diagnóstico

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas/buscar/diagnostico` | GET | 🔵 ADMIN <br> 🟡 VETERINARIO <br> 🟢 RECEPCIONISTA |

**Descripción**: Buscar historias clínicas por texto en el diagnóstico.

---

### 7️⃣ Actualizar Historia Clínica

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas/{id}` | PUT | 🔵 ADMIN <br> 🟡 VETERINARIO <br> 🟢 RECEPCIONISTA |

**Descripción**: Actualizar información de una historia clínica existente.

---

### 8️⃣ Eliminar Historia Clínica

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/historias-clinicas/{id}` | DELETE | 🔵 ADMIN <br> 🟡 VETERINARIO |

**Descripción**: Eliminar permanentemente una historia clínica.

---

## 🏥 Gestión de Veterinarias

### 1️⃣ Listar Todas las Veterinarias

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/veterinarias` | GET | 🔓 **PÚBLICO** |

**Descripción**: Obtener lista completa de veterinarias.

> **Nota**: Endpoint público, no requiere autenticación.

---

### 2️⃣ Obtener Veterinaria por ID

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/veterinarias/{id}` | GET | 🔓 **PÚBLICO** |

**Descripción**: Consultar información de una veterinaria específica.

---

### 3️⃣ Crear Veterinaria

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/veterinarias` | POST | 🔵 ADMIN |

**Descripción**: Registrar una nueva veterinaria en el sistema.

**⚠️ Exclusivo**: Solo ADMIN.

---

### 4️⃣ Actualizar Veterinaria

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/veterinarias/{id}` | PUT | 🔵 ADMIN |

**Descripción**: Actualizar información de una veterinaria.

**⚠️ Exclusivo**: Solo ADMIN.

---

### 5️⃣ Desactivar Veterinaria

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/veterinarias/{id}/desactivar` | PATCH | 🔵 ADMIN |

**Descripción**: Desactivar una veterinaria (soft delete).

**⚠️ Exclusivo**: Solo ADMIN.

---

### 6️⃣ Activar Veterinaria

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/veterinarias/{id}/activar` | PATCH | 🔵 ADMIN |

**Descripción**: Reactivar una veterinaria desactivada.

**⚠️ Exclusivo**: Solo ADMIN.

---

### 7️⃣ Eliminar Veterinaria

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/veterinarias/{id}` | DELETE | 🔵 ADMIN |

**Descripción**: Eliminar permanentemente una veterinaria.

**⚠️ Exclusivo**: Solo ADMIN.

---

## 📊 Reportes

**⚠️ TODOS LOS ENDPOINTS DE REPORTES SON EXCLUSIVOS DE ADMIN**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/reportes/usuarios/total` | GET | Total de usuarios registrados |
| `/api/reportes/usuarios/activos` | GET | Usuarios activos |
| `/api/reportes/usuarios/inactivos` | GET | Usuarios inactivos |
| `/api/reportes/usuarios/rol` | GET | Usuarios por rol |
| `/api/reportes/mascotas/total` | GET | Total de mascotas registradas |
| `/api/reportes/mascotas/activas` | GET | Mascotas activas |
| `/api/reportes/mascotas/especie` | GET | Mascotas por especie |
| `/api/reportes/citas/estado` | GET | Citas por estado |
| `/api/reportes/citas/rango` | GET | Citas en rango de fechas |
| `/api/reportes/historias/veterinario` | GET | Historias clínicas por veterinario |
| `/api/reportes/historias/diagnostico` | GET | Historias clínicas por diagnóstico |
| `/api/reportes/estadisticas/completas` | GET | Estadísticas completas del sistema |

### Reportes de Gestión

| Endpoint | Método | Descripción | Permisos |
|----------|--------|-------------|----------|
| `/api/gestion-reportes/**` | GET | Reportes avanzados y estadísticas | 🔵 ADMIN |

**Descripción**: Todos los endpoints bajo `/api/gestion-reportes/` son exclusivos del ADMIN.

---

## 📈 Dashboard

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/dashboard/estadisticas` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Obtener estadísticas generales del sistema para el dashboard.

---

## 🔍 Búsquedas

### 1️⃣ Búsqueda Global de Usuarios

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/search/usuarios` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA |

**Descripción**: Búsqueda avanzada de usuarios por múltiples criterios.

---

### 2️⃣ Búsqueda Global de Mascotas

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/search/mascotas` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Búsqueda avanzada de mascotas por múltiples criterios.

---

### 3️⃣ Búsqueda Global de Citas

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/search/citas` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA <br> 🟡 VETERINARIO |

**Descripción**: Búsqueda avanzada de citas por múltiples criterios.

---

### 4️⃣ Búsqueda Global de Historias Clínicas

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/search/historias-clinicas` | GET | 🔵 ADMIN <br> 🟢 RECEPCIONISTA |

**Descripción**: Búsqueda avanzada de historias clínicas por múltiples criterios.

---

## 📄 Generación de PDFs

### 1️⃣ Generar Carnet de Mascota

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/pdf/carnet/{mascotaId}` | GET | 🔓 **PÚBLICO** (comentado en código) |

**Descripción**: Generar carnet en PDF de una mascota.

> **Nota**: Actualmente el `@PreAuthorize` está comentado, lo que lo hace público.

---

### 2️⃣ Generar Reporte de Historia Clínica

| Endpoint | Método | Permisos |
|----------|--------|----------|
| `/api/pdf/historia-clinica/{historiaId}` | GET | 🔵 ADMIN <br> 🟡 VETERINARIO |

**Descripción**: Generar PDF de una historia clínica completa.

---

## 📊 Matriz de Permisos

### Resumen por Módulo

| Módulo | ADMIN | RECEPCIONISTA | VETERINARIO | CLIENTE |
|--------|-------|---------------|-------------|---------|
| **Usuarios** | ✅ Completo | ✅ CRUD básico | ✅ Consulta | ⚠️ Propio perfil |
| **Mascotas** | ✅ Completo | ✅ CRUD básico | ✅ CRUD básico | ⚠️ Propias mascotas |
| **Citas** | ✅ Completo | ✅ CRUD + gestión | ✅ CRUD + atención | ⚠️ Propias citas |
| **Historias Clínicas** | ✅ Completo | ✅ Consulta | ✅ CRUD completo | ⚠️ Propias historias |
| **Veterinarias** | ✅ CRUD completo | ❌ | ❌ | ❌ |
| **Reportes** | ✅ Todos | ❌ | ❌ | ❌ |
| **Dashboard** | ✅ Completo | ✅ Estadísticas | ✅ Estadísticas | ❌ |
| **PDFs** | ✅ Todos | ❌ | ✅ Hist. Clínicas | ⚠️ Carnets |

### Leyenda

- ✅ **Acceso Completo**: Puede realizar todas las operaciones
- ⚠️ **Acceso Limitado**: Solo puede acceder a sus propios datos o funciones específicas
- ❌ **Sin Acceso**: No tiene permisos para este módulo

---

## 🔐 Reglas Especiales de Acceso

### 1. Acceso a Datos Propios

Los usuarios pueden acceder a sus propios datos aunque no tengan el rol requerido normalmente:

- ✅ **Clientes** pueden ver y editar:
  - Su propio perfil de usuario
  - Sus propias mascotas
  - Sus propias citas
  - Las historias clínicas de sus mascotas
  
- ✅ **Veterinarios** pueden ver:
  - Sus propias citas asignadas
  - Las historias clínicas que han creado

### 2. Jerarquía de Roles

```
ADMIN > RECEPCIONISTA > VETERINARIO > CLIENTE
```

- **ADMIN**: Acceso total sin restricciones
- **RECEPCIONISTA**: Gestión operativa diaria (usuarios, citas, mascotas)
- **VETERINARIO**: Enfocado en atención médica (citas, historias clínicas)
- **CLIENTE**: Acceso limitado a sus propios datos

### 3. Operaciones Exclusivas por Rol

#### Solo ADMIN puede:
- Eliminar permanentemente registros (usuarios, mascotas, citas, veterinarias)
- Gestionar veterinarias (CRUD completo)
- Acceder a todos los reportes del sistema
- Gestionar todos los roles de usuarios
- Activar/desactivar veterinarias

#### Solo ADMIN y VETERINARIO pueden:
- Eliminar historias clínicas
- Iniciar citas médicas
- Generar PDFs de historias clínicas

#### Solo ADMIN y RECEPCIONISTA pueden:
- Crear y gestionar usuarios
- Desactivar/activar usuarios
- Crear mascotas
- Desactivar mascotas

---

## 📝 Notas Importantes

1. **Autenticación Obligatoria**: Todos los endpoints requieren token JWT excepto:
   - `/api/auth/signin`
   - `/api/auth/signup`
   - `/api/veterinarias/**` (endpoints públicos)
   - `/api/pdf/carnet/**` (actualmente público)

2. **Soft Delete**: El sistema utiliza desactivación (soft delete) en lugar de eliminación física en la mayoría de entidades.

3. **Validación de Propietario**: Muchos endpoints verifican si el usuario autenticado es el propietario del recurso mediante expresiones SpEL en `@PreAuthorize`.

4. **Roles en Base de Datos**: Los roles se almacenan con prefijo `ROLE_` en la base de datos (ej: `ROLE_ADMIN`, `ROLE_CLIENTE`).

5. **Frontend**: El frontend debe manejar la normalización de roles (remover prefijo `ROLE_` para display).

---

## 🚀 Ejemplos de Uso

### Ejemplo 1: ADMIN creando un usuario

```http
POST /api/usuarios
Authorization: Bearer {token_admin}

{
  "documento": "123456789",
  "nombre": "Juan Pérez",
  "rol": "VETERINARIO",
  "username": "jperez",
  "password": "password123"
}
```

✅ **Permitido** - ADMIN tiene permisos de creación.

---

### Ejemplo 2: CLIENTE consultando sus mascotas

```http
GET /api/mascotas/propietario/987654321
Authorization: Bearer {token_cliente}
```

✅ **Permitido** - El cliente puede ver sus propias mascotas si el documento coincide.

---

### Ejemplo 3: VETERINARIO intentando eliminar una mascota

```http
DELETE /api/mascotas/5
Authorization: Bearer {token_veterinario}
```

❌ **Denegado** - Solo ADMIN puede eliminar mascotas.

---

### Ejemplo 4: RECEPCIONISTA generando reporte

```http
GET /api/reportes/usuarios/total
Authorization: Bearer {token_recepcionista}
```

❌ **Denegado** - Solo ADMIN puede acceder a reportes.

---

## 📧 Contacto y Soporte

Para más información sobre permisos o solicitar cambios en los roles, contactar al administrador del sistema.

---

**Última actualización**: 29 de Octubre de 2025
**Versión del documento**: 1.0
**Sistema**: Veterinaria Management System v2.0

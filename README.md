sistema de gestion

# Sistema de Gestión Veterinaria

Sistema completo de gestión veterinaria con Spring Boot (backend) y React (frontend), incluyendo autenticación JWT, gestión de roles y funcionalidades específicas por tipo de usuario.

## 🚀 Características

### Roles de Usuario
- **Admin**: CRUD completo en todas las entidades, gestión de usuarios y desactivación
- **Recepcionista**: Crear, modificar, consultar y desactivar citas y clientes
- **Veterinario**: Modificar y consultar citas, gestionar historias clínicas
- **Cliente**: Registrarse, gestionar perfil, mascotas, agendar/cancelar citas, consultar historia clínica

### Funcionalidades
- 🔐 Autenticación JWT
- 👥 Gestión de usuarios con roles
- 📅 Sistema de citas médicas
- 🐕 Gestión de mascotas
- 📋 Historia clínica digital
- 🏥 Gestión de veterinarias
- 📊 Sistema de reportes
- 🌐 API REST completa
- 📱 Interfaz web responsiva con Bootstrap

## 🛠️ Tecnologías

### Backend
- Spring Boot 3.4.0
- Spring Security + JWT
- Spring Data JPA
- MySQL 8.0
- Maven

### Frontend
- React 18 + TypeScript
- React Bootstrap
- React Router DOM
- Axios
- JWT Authentication

## 📋 Requisitos Previos

- Java 21 LTS o superior
- Node.js 16 o superior
- MySQL 8.0 (XAMPP)
- Maven 3.6 o superior

## 🚀 Instalación y Configuración

### 1. Configurar la Base de Datos

1. **Iniciar XAMPP**:
   - Iniciar Apache y MySQL desde el panel de control de XAMPP

2. **Crear la base de datos**:
   ```sql
   CREATE DATABASE IF NOT EXISTS veterinaria;
   ```

### 2. Configurar el Backend

1. **Navegar al directorio del backend**:
   ```bash
   cd c:\xampp\htdocs\pet\backend
   ```

2. **Compilar el proyecto**:
   ```bash
   mvn clean install
   ```

3. **Ejecutar la aplicación**:
   ```bash
   mvn spring-boot:run
   ```

   O ejecutar directamente:
   ```bash
   java -jar target/veterinaria-backend-0.0.1-SNAPSHOT.jar
   ```

4. **Verificar que el backend esté funcionando**:
   - Abrir http://localhost:8080
   - Debería mostrar un error 404 (normal, es una API)

### 3. Configurar el Frontend

1. **Navegar al directorio del frontend**:
   ```bash
   cd c:\xampp\htdocs\pet\frontend
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación**:
   ```bash
   npm start
   ```

4. **Abrir en el navegador**:
   - http://localhost:3000

## 👤 Usuarios de Prueba

El sistema se inicializa con un usuario administrador:

- **Usuario**: `admin`
- **Contraseña**: `admin123`
- **Rol**: Administrador

## 📡 API Endpoints

### Autenticación
- `POST /api/auth/signin` - Iniciar sesión
- `POST /api/auth/signup` - Registrar usuario

### Usuarios
- `GET /api/usuarios` - Listar usuarios (Admin/Recepcionista)
- `GET /api/usuarios/{id}` - Obtener usuario por ID
- `GET /api/usuarios/activos` - Usuarios activos
- `PUT /api/usuarios/{id}` - Actualizar usuario
- `PATCH /api/usuarios/{id}/desactivar` - Desactivar usuario

### Mascotas
- `GET /api/mascotas` - Listar mascotas
- `POST /api/mascotas` - Crear mascota
- `GET /api/mascotas/propietario/{id}` - Mascotas por propietario
- `PUT /api/mascotas/{id}` - Actualizar mascota

### Citas
- `GET /api/citas` - Listar citas
- `POST /api/citas` - Crear cita
- `GET /api/citas/cliente/{id}` - Citas por cliente
- `GET /api/citas/hoy` - Citas de hoy
- `PATCH /api/citas/{id}/confirmar` - Confirmar cita
- `PATCH /api/citas/{id}/cancelar` - Cancelar cita

### Historia Clínica
- `GET /api/historias-clinicas` - Listar historias
- `POST /api/historias-clinicas` - Crear historia
- `GET /api/historias-clinicas/mascota/{id}` - Historias por mascota

## 🧪 Pruebas con Postman

1. **Importar la colección**:
   - Abrir Postman
   - Importar el archivo `Veterinaria_API_Collection.json`

2. **Configurar variables**:
   - `base_url`: `http://localhost:8080/api`
   - `jwt_token`: (se configura automáticamente al hacer login)

3. **Flujo de pruebas**:
   1. Ejecutar "Login" para obtener el token
   2. Probar los demás endpoints según los permisos del usuario

## 🗂️ Estructura del Proyecto

```
pet/
├── backend/
│   ├── src/main/java/com/veterinaria/veterinaria/
│   │   ├── controller/     # Controladores REST
│   │   ├── entity/         # Entidades JPA
│   │   ├── repository/     # Repositorios
│   │   ├── service/        # Servicios de negocio
│   │   ├── security/       # Configuración JWT
│   │   ├── dto/           # DTOs
│   │   └── config/        # Configuraciones
│   ├── src/main/resources/
│   │   ├── application.properties
│   │   └── data.sql
│   └── pom.xml
├── frontend/
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── pages/         # Páginas principales
│   │   ├── services/      # Servicios API
│   │   ├── types/         # Tipos TypeScript
│   │   └── App.tsx
│   ├── public/
│   └── package.json
└── Veterinaria_API_Collection.json
```

## 🔧 Configuración

### Base de Datos (application.properties)
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/veterinaria
spring.datasource.username=root
spring.datasource.password=
```

### JWT
```properties
app.jwtSecret=[Base64-encoded-secret]
app.jwtExpirationInMs=604800000
```

## 🎯 Funcionalidades por Rol

### Cliente
- ✅ Registrarse en el sistema
- ✅ Consultar y modificar perfil
- ✅ Gestionar mascotas
- ✅ Agendar citas
- ✅ Cancelar citas
- ✅ Consultar historia clínica

### Recepcionista
- ✅ Crear, modificar y consultar usuarios
- ✅ Gestionar citas
- ✅ Desactivar usuarios/mascotas
- ✅ Consultar información general

### Veterinario
- ✅ Modificar y consultar citas asignadas
- ✅ Gestionar historias clínicas
- ✅ Consultar información de mascotas
- ✅ Completar citas

### Administrador
- ✅ CRUD completo en todas las entidades
- ✅ Gestión de usuarios y roles
- ✅ Desactivación/activación de registros
- ✅ Acceso a reportes del sistema

## 🚨 Solución de Problemas

### Backend no inicia
1. Verificar que MySQL esté ejecutándose
2. Comprobar credenciales de base de datos
3. Verificar que el puerto 8080 esté disponible

### Frontend no conecta con Backend
1. Verificar que el backend esté ejecutándose en puerto 8080
2. Comprobar configuración de CORS
3. Revisar URLs en los servicios de frontend

### Errores de autenticación
1. Verificar que el token JWT sea válido
2. Comprobar permisos de usuario
3. Revisar configuración de Spring Security

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contactar al equipo de desarrollo.

## 📄 Licencia

Este proyecto está desarrollado para fines educativos y de demostración.
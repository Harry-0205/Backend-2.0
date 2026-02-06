# 🐾 Sistema de Gestión Veterinaria PET

> Sistema integral de gestión para clínicas veterinarias con soporte web y móvil

[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.1.12-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://reactjs.org/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-purple.svg)](https://reactnative.dev/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-orange.svg)](https://www.mysql.com/)

---

## 📋 Descripción

Sistema completo de gestión veterinaria que permite administrar:
- 👥 Usuarios con 4 roles diferentes (Admin, Veterinario, Recepcionista, Cliente)
- 🐶 Mascotas y sus propietarios
- 📅 Citas médicas
- 📋 Historias clínicas con generación de PDF
- 🏥 Múltiples veterinarias
- 📊 Reportes y estadísticas

---

## 🏗️ Stack Tecnológico

### Backend
- **Java 17** - Lenguaje de programación
- **Spring Boot 3.1.12** - Framework principal
- **Spring Security 6.x** - Autenticación y autorización
- **Spring Data JPA** - Persistencia de datos
- **MySQL 8.0** - Base de datos
- **JWT (jjwt 0.12.3)** - Tokens de autenticación
- **iText7** - Generación de PDFs
- **Maven** - Gestión de dependencias

### Frontend Web
- **React 19.2.0** - Librería de UI
- **TypeScript 4.9.5** - Tipado estático
- **React Router 7.9.4** - Navegación
- **Bootstrap 5.3.8** - Estilos y componentes
- **Axios 1.12.2** - Cliente HTTP

### Frontend Móvil
- **React Native 0.81.5** - Framework móvil
- **Expo 54.0.0** - Plataforma de desarrollo
- **React Navigation 7.0.13** - Navegación
- **TypeScript 5.1.3** - Tipado estático
- **Axios 1.6.2** - Cliente HTTP

---

## 📂 Estructura del Proyecto

```
Backend-2.0/
├── backend/                          # API REST Spring Boot
│   ├── src/main/java/               # Código fuente Java
│   │   └── com/veterinaria/
│   │       ├── config/              # Configuración (CORS, Security)
│   │       ├── controller/          # Controladores REST
│   │       ├── dto/                 # Data Transfer Objects
│   │       ├── entity/              # Entidades JPA
│   │       ├── repository/          # Repositorios JPA
│   │       ├── security/            # JWT y seguridad
│   │       └── service/             # Lógica de negocio
│   ├── src/main/resources/
│   │   └── application.properties   # Configuración de la app
│   └── pom.xml                      # Dependencias Maven
│
├── frontend/                         # Aplicación web React
│   ├── public/                      # Archivos estáticos
│   ├── src/
│   │   ├── components/              # Componentes reutilizables
│   │   ├── pages/                   # Páginas principales
│   │   ├── services/                # Servicios API
│   │   ├── styles/                  # Estilos CSS
│   │   └── types/                   # Tipos TypeScript
│   └── package.json                 # Dependencias npm
│
├── frontend-appMovil/               # Aplicación móvil React Native
│   ├── screens/                     # Pantallas de la app
│   ├── services/                    # Servicios API
│   ├── assets/                      # Imágenes e iconos
│   ├── App.tsx                      # Componente principal
│   ├── app.json                     # Configuración Expo
│   ├── README.md                    # Guía de la app móvil
│   ├── EXPO_GO.md                   # Despliegue con Expo Go
│   └── DESPLIEGUE_ANDROID.md        # Despliegue en Android
│
├── DATABASE_DDL.sql                 # Estructura de la BD
├── DATABASE_DML.sql                 # Datos de prueba
├── DOCUMENTACION_COMPLETA_PET.md    # Documentación técnica completa
├── PRUEBA_POSTMAN.md                # Guía de testing con Postman
├── iniciar-proyecto.bat             # Script para iniciar todo
└── README.md                        # Este archivo
```

---

## 🚀 Requisitos Previos

### Software Necesario
- ✅ **Java JDK 17** o superior
- ✅ **Maven 3.8+**
- ✅ **Node.js 16+** y npm
- ✅ **MySQL 8.0+** (XAMPP recomendado)
- ✅ **Git** (opcional)

### Para Desarrollo Móvil (adicional)
- ✅ **Expo CLI** (`npm install -g expo-cli`)
- ✅ **Expo Go** app en dispositivo móvil
- ✅ **Android Studio** (para emuladores Android)

---

## ⚙️ Instalación y Configuración

### 1️⃣ Clonar o Descargar el Proyecto

```bash
git clone <url-del-repositorio>
cd Backend-2.0
```

### 2️⃣ Configurar la Base de Datos

#### Iniciar MySQL (XAMPP)
- Abrir XAMPP Control Panel
- Iniciar **Apache** y **MySQL**

#### Crear la Base de Datos
```bash
# Abrir phpMyAdmin: http://localhost/phpmyadmin
# Ejecutar en orden:
1. DATABASE_DDL.sql    # Crea la estructura
2. DATABASE_DML.sql    # Inserta datos de prueba
```

O desde MySQL CLI:
```bash
mysql -u root -p < DATABASE_DDL.sql
mysql -u root -p < DATABASE_DML.sql
```

#### Verificar Configuración
Editar `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/veterinaria
spring.datasource.username=root
spring.datasource.password=        # Tu password de MySQL (vacío si es XAMPP)
```

### 3️⃣ Configurar e Iniciar el Backend

```bash
cd backend

# Instalar dependencias (primera vez)
mvn clean install

# Iniciar el servidor
mvn spring-boot:run
```

El backend estará disponible en: `http://localhost:8080`

### 4️⃣ Configurar e Iniciar el Frontend Web

```bash
cd frontend

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

El frontend estará disponible en: `http://localhost:3000`

### 5️⃣ Configurar e Iniciar la App Móvil (opcional)

```bash
cd frontend-appMovil

# Instalar dependencias
npm install

# Configurar IP del backend en services/apiClient.ts
# Cambiar: 'http://TU_IP:8080/api'
# Ejemplo: 'http://192.168.1.100:8080/api'

# Iniciar Expo
npm start
```

📱 Escanea el código QR con **Expo Go** en tu dispositivo móvil.

Para más detalles, consulta:
- [frontend-appMovil/README.md](frontend-appMovil/README.md) - Guía rápida
- [frontend-appMovil/EXPO_GO.md](frontend-appMovil/EXPO_GO.md) - Despliegue con Expo Go

---

## 🎮 Inicio Rápido (Windows)

### Opción Automática
Ejecutar el archivo batch incluido:
```bash
iniciar-proyecto.bat
```

Este script:
1. ✅ Verifica e inicia MySQL (XAMPP)
2. ✅ Inicia el backend Spring Boot
3. ✅ Inicia el frontend React
4. ✅ Abre las URLs en el navegador

### Opción Manual
Abrir 3 terminales:

**Terminal 1 - Backend:**
```bash
cd backend
mvn spring-boot:run
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - App Móvil (opcional):**
```bash
cd frontend-appMovil
npm start
```

---

## 👥 Usuarios de Prueba

| Usuario | Contraseña | Documento | Rol | Descripción |
|---------|------------|-----------|-----|-------------|
| `admin` | `123456` | 12345678 | ADMIN | Acceso total al sistema |
| `dr.garcia` | `123456` | 87654321 | VETERINARIO | Gestión de citas e historias clínicas |
| `dra.martinez` | `123456` | 11111111 | VETERINARIO | Gestión de citas e historias clínicas |
| `recepcionista1` | `123456` | 22222222 | RECEPCIONISTA | Gestión de citas y clientes |
| `cliente1` | `123456` | 33333333 | CLIENTE | Ver sus mascotas y citas |
| `cliente2` | `123456` | 44444444 | CLIENTE | Ver sus mascotas y citas |

---

## 🌐 URLs del Sistema

| Servicio | URL | Puerto |
|----------|-----|--------|
| Backend API | `http://localhost:8080` | 8080 |
| Frontend Web | `http://localhost:3000` | 3000 |
| phpMyAdmin | `http://localhost/phpmyadmin` | 80 |
| MySQL | `localhost` | 3306 |

### Endpoints Principales
- **API Base:** `http://localhost:8080/api`
- **Login:** `POST /api/auth/login`
- **Usuarios:** `GET /api/usuarios`
- **Mascotas:** `GET /api/mascotas`
- **Citas:** `GET /api/citas`
- **Historias:** `GET /api/historias-clinicas`

---

## 📚 Documentación Adicional

### Documentación Técnica
- 📖 [DOCUMENTACION_COMPLETA_PET.md](DOCUMENTACION_COMPLETA_PET.md) - Documentación técnica completa del sistema
  - Arquitectura detallada
  - Seguridad y permisos por rol
  - Funcionalidades específicas
  - Correcciones implementadas

### Testing y API
- 🧪 [PRUEBA_POSTMAN.md](PRUEBA_POSTMAN.md) - Guía completa de pruebas con Postman
  - Colecciones de endpoints
  - Casos de prueba por rol
  - Validación de errores
  - Scripts de testing automatizado

### Base de Datos
- 🗄️ [DATABASE_DDL.sql](DATABASE_DDL.sql) - Estructura de tablas, índices y relaciones
- 📊 [DATABASE_DML.sql](DATABASE_DML.sql) - Datos de prueba y usuarios iniciales

### App Móvil
- 📱 [frontend-appMovil/README.md](frontend-appMovil/README.md) - Guía de inicio rápido
- 🚀 [frontend-appMovil/EXPO_GO.md](frontend-appMovil/EXPO_GO.md) - Despliegue con Expo Go
- 🤖 [frontend-appMovil/DESPLIEGUE_ANDROID.md](frontend-appMovil/DESPLIEGUE_ANDROID.md) - Compilación para Android

---

## 🎯 Funcionalidades Principales

### Por Rol de Usuario

#### 👑 ADMINISTRADOR
- ✅ Gestión completa de usuarios
- ✅ Administración de veterinarias
- ✅ Acceso total a mascotas, citas e historias clínicas
- ✅ Generación de reportes y estadísticas
- ✅ Configuración del sistema

#### 🩺 VETERINARIO
- ✅ Gestión de citas médicas
- ✅ Creación y edición de historias clínicas
- ✅ Acceso completo a información de mascotas
- ✅ Generación de PDF de historias clínicas
- ✅ Consulta de información de clientes

#### 📋 RECEPCIONISTA
- ✅ Programación y gestión de citas
- ✅ Registro de nuevos clientes y mascotas
- ✅ Consulta de historias clínicas
- ✅ Administración de datos de veterinarias

#### 👤 CLIENTE
- ✅ Registro y gestión de sus mascotas
- ✅ Programación de citas para sus mascotas
- ✅ Visualización de historias clínicas de sus mascotas
- ✅ Descarga de PDF de historias clínicas
- ✅ Gestión de su perfil personal

### Características Técnicas
- 🔐 **Autenticación JWT** con tokens seguros
- 🔒 **Encriptación BCrypt** para contraseñas
- 🛡️ **Spring Security** con control de acceso por roles
- 📄 **Generación de PDFs** para historias clínicas
- 🌐 **API REST** completamente documentada
- 📱 **Diseño Responsivo** para web y móvil
- ⚡ **Optimización de Base de Datos** con índices

---

## 🔧 Solución de Problemas

### Backend no inicia
```bash
# Verificar Java
java -version    # Debe ser 17+

# Verificar Maven
mvn -version

# Limpiar y recompilar
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend no inicia
```bash
# Limpiar caché npm
cd frontend
rm -rf node_modules package-lock.json
npm install
npm start
```

### Error de conexión a MySQL
1. Verificar que MySQL esté corriendo:
   ```bash
   netstat -ano | findstr :3306
   ```
2. Verificar credenciales en `application.properties`
3. Verificar que la base de datos `veterinaria` exista

### Error CORS
Verificar en `application.properties`:
```properties
app.cors.allowed-origins=http://localhost:3000,http://localhost:3001
```

### App móvil no conecta
1. Verificar que PC y celular estén en la **misma WiFi**
2. Cambiar IP en `frontend-appMovil/services/apiClient.ts`
3. Actualizar CORS en backend con tu IP local
4. Reiniciar el servidor backend

---

## 🧪 Testing

### Pruebas con Postman
1. Importar colecciones desde `PRUEBA_POSTMAN.md`
2. Seguir la guía paso a paso
3. Verificar todos los endpoints por rol

### Pruebas Manuales
1. Login con cada tipo de usuario
2. Verificar funcionalidades según rol
3. Probar generación de PDFs
4. Validar restricciones de acceso

---

## 📦 Tecnologías y Librerías

### Backend Dependencies
```xml
- spring-boot-starter-web
- spring-boot-starter-data-jpa
- spring-boot-starter-security
- spring-boot-starter-validation
- mysql-connector-j
- jjwt (api, impl, jackson)
- itext7-core
- opencsv
```

### Frontend Dependencies
```json
- react + react-dom
- typescript
- react-router-dom
- axios
- bootstrap + react-bootstrap
- react-icons
```

### Mobile Dependencies
```json
- expo
- react-native
- @react-navigation/native
- @react-navigation/stack
- axios
- @react-native-async-storage/async-storage
```

---

## 🤝 Contribución

### Estándares de Código
- **Backend:** Seguir convenciones de Java y Spring Boot
- **Frontend:** Usar TypeScript estricto
- **Componentes:** Reutilizables y modulares
- **Git:** Commits descriptivos en español

### Proceso de Desarrollo
1. Crear rama desde `main`
2. Implementar cambios
3. Probar localmente
4. Actualizar documentación
5. Crear Pull Request

---

## 📄 Licencia

Este proyecto es parte del programa de formación SENA.

---

## 📞 Soporte y Contacto

### Documentación
- Leer [DOCUMENTACION_COMPLETA_PET.md](DOCUMENTACION_COMPLETA_PET.md) para detalles técnicos
- Consultar [PRUEBA_POSTMAN.md](PRUEBA_POSTMAN.md) para testing de API

### Problemas Comunes
Revisar la sección [Solución de Problemas](#-solución-de-problemas) en este documento.

---

## 📊 Estado del Proyecto

- ✅ **Backend:** Completamente funcional
- ✅ **Frontend Web:** Operativo y responsivo
- ✅ **App Móvil:** Funcional con Expo Go
- ✅ **Base de Datos:** Optimizada con datos de prueba
- ✅ **Documentación:** Completa y actualizada
- ✅ **Testing:** Documentado con Postman

---

## 🎓 Proyecto Desarrollado

**Institución:** SENA  
**Fecha de Actualización:** 6 de febrero de 2026  
**Estado:** ✅ Sistema 100% Funcional y Documentado  
**Versión:** 1.0.0

---

## 🚀 Quick Start Command

```bash
# Iniciar todo el sistema (Windows)
iniciar-proyecto.bat

# O manualmente:
# Terminal 1: cd backend && mvn spring-boot:run
# Terminal 2: cd frontend && npm start
# Terminal 3: cd frontend-appMovil && npm start
```

**¡Sistema listo para usar! 🎉**

# 📋 MANUAL TÉCNICO Y DE OPERACIÓN DEL SISTEMA

## **Sistema de Gestión Veterinaria PET**

---

## 📑 **TABLA DE CONTENIDO**

1. [Portada](#portada)
2. [Resumen Ejecutivo](#resumen-ejecutivo)
3. [Introducción](#introducción)
4. [Descripción General del Sistema](#descripción-general-del-sistema)
5. [Arquitectura del Sistema](#arquitectura-del-sistema)
6. [Especificaciones Técnicas](#especificaciones-técnicas)
7. [Instalación y Configuración](#instalación-y-configuración)
8. [Estructura del Código Fuente](#estructura-del-código-fuente)
9. [Base de Datos](#base-de-datos)
10. [Autenticación y Seguridad](#autenticación-y-seguridad)
11. [API REST - Endpoints](#api-rest---endpoints)
12. [Manual de Operación](#manual-de-operación)
13. [Procedimientos de Mantenimiento](#procedimientos-de-mantenimiento)
14. [Troubleshooting y Resolución de Problemas](#troubleshooting-y-resolución-de-problemas)
15. [Apéndices](#apéndices)

---

# **PORTADA**

<div align="center">

## 🐾 **SISTEMA DE GESTIÓN VETERINARIA PET**

### Manual Técnico y de Operación del Sistema

**Versión:** 2.0  
**Fecha de Elaboración:** 11 de febrero de 2026  
**Estado:** Producción  
**Clasificación:** Documento Técnico Interno

---

#### Información del Proyecto
- **Nombre:** Sistema de Gestión Veterinaria PET
- **Desarrollador:** Equipo de Desarrollo
- **Institución:** SENA - Formación Técnica
- **Tecnologías:** Java, Spring Boot, React, MySQL
- **Ambiente:** Web y Móvil

#### Aprobaciones
| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Desarrollador Principal | | | |
| Analista de Calidad | | | |
| Administrador de Sistemas | | | |

</div>

---

# **RESUMEN EJECUTIVO**

## 1.1 Descripción General

El **Sistema de Gestión Veterinaria PET** es una solución integral desarrollada con tecnologías modernas y escalables que permite la administración completa de clínicas veterinarias. El sistema proporciona funcionalidades de gestión de usuarios, mascotas, citas médicas, historias clínicas y reportes estadísticos.

## 1.2 Alcance

- **Usuarios Objetivo:** Administradores, Veterinarios, Recepcionistas y Clientes
- **Plataformas:** Web (React) y Móvil (React Native)
- **Entorno de Ejecución:** Backend (Java/Spring Boot), Frontend (TypeScript/React)
- **Base de Datos:** MySQL 8.0+
- **Status:** 100% Funcional y Operativo ✅

## 1.3 Funcionalidades Principales

✅ Gestión de Usuarios con 4 Roles diferentes  
✅ Administración de Mascotas y Propietarios  
✅ Programación y Control de Citas Médicas  
✅ Registro de Historias Clínicas Digital  
✅ Generación de Reportes en PDF  
✅ Sistema de Múltiples Veterinarias  
✅ Autenticación Segura con JWT  
✅ Control de Acceso por Roles (RBAC)  
✅ API REST Documentada y Protegida  
✅ Sincronización Web-Móvil  

## 1.4 Tecnologías Utilizadas

| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| **Backend** | Java | 17 |
| **Framework Backend** | Spring Boot | 3.1.12 |
| **Framework Frontend** | React | 19.2.0 |
| **Lenguaje Frontend** | TypeScript | 4.9.5 |
| **Framework Móvil** | React Native | 0.81.5 |
| **Base de Datos** | MySQL | 8.0+ |
| **Autenticación** | JWT | jjwt 0.12.3 |
| **Herramienta Build** | Maven | 3.x+ |

---

# **INTRODUCCIÓN**

## 2.1 Propósito

Este manual proporciona documentación técnica y operacional completa del Sistema de Gestión Veterinaria PET dirigida a:

- Administradores de sistemas
- Desarrolladores de mantenimiento
- Personal operativo
- Usuarios finales del sistema

## 2.2 Audiencia

- **Personal Técnico:** Desarrolladores, Administradores de BD, Administradores de Sistema
- **Personal Operativo:** Veterinarios, Recepcionistas, Clientes
- **Gestión:** Supervisores y Administradores

## 2.3 Documentos Relacionados

- `README.md` - Descripción general del proyecto
- `DOCUMENTACION_COMPLETA_PET.md` - Documentación funcional completa
- `DATABASE_DDL.sql` - Estructura de la base de datos
- `DATABASE_DML.sql` - Datos iniciales y de prueba
- `PRUEBA_POSTMAN.md` - Guía de testing de API
- `EXPO_GO.md` - Despliegue de app móvil

## 2.4 Convenciones utilizadas

```
⚠️  = Advertencia importante
✅  = Completado / Funcional
❌  = Error / No funcional
📌  = Nota importante
💡  = Sugerencia
→   = Acción a seguir
```

---

# **DESCRIPCIÓN GENERAL DEL SISTEMA**

## 3.1 Visión General

El Sistema de Gestión Veterinaria PET es una plataforma web y móvil que centraliza todas las operaciones de una clínica veterinaria, permitiendo:

- Control integral de pacientes (mascotas)
- Gestión de citas médicas
- Registro digital de historias clínicas
- Administración de usuarios por roles
- Generación de reportes estadísticos
- Facturación y control administrativo

## 3.2 Objetivos del Sistema

### Objetivos Funcionales
- Automatizar procesos manuales de clínicas veterinarias
- Proporcionar acceso rápido a información de mascotas y propietarios
- Facilitar la programación de citas
- Mantener registros médicos digitales seguros
- Generar reportes para análisis de negocio

### Objetivos No Funcionales
- Garantizar disponibilidad del sistema 99%+
- Respuesta de API < 500ms
- Soporte para 100+ usuarios concurrentes
- Seguridad con encriptación de datos
- Escalabilidad horizontal

## 3.3 Actores del Sistema

| Actor | Rol | Descripción |
|-------|-----|-------------|
| **Administrador** | ROLE_ADMIN | Control total del sistema, gestión de usuarios y configuración |
| **Veterinario** | ROLE_VETERINARIO | Diagnóstico, tratamiento y registro de historias clínicas |
| **Recepcionista** | ROLE_RECEPCIONISTA | Programación de citas y atención al cliente |
| **Cliente** | ROLE_CLIENTE | Propietario de mascotas, consulta de citas y expedientes |
| **Sistema** | - | Componentes automáticos (reportes, sincronización) |

## 3.4 Casos de Uso Principales

### Cliente - Gestión de Mascotas
```
1. Usuario Cliente inicia sesión
2. Visualiza lista de sus mascotas
3. Accede a detalles de cada mascota
4. Visualiza historial de citas
5. Descarga reportes médicos en PDF
```

### Veterinario - Consulta Médica
```
1. Veterinario accede al dashboard
2. Consulta citas del día
3. Atiende mascota y crea historia clínica
4. Registra diagnóstico y medicamentos
5. Genera reporte en PDF
```

### Recepcionista - Programación de Cita
```
1. Recepcionista inicia sesión
2. Accede a calendarios de veterinarios
3. Busca mascota por propietario
4. Programa cita disponible
5. Envía confirmación al cliente
```

### Administrador - Gestión de Sistema
```
1. Admin accede a panel administrativo
2. Crea nuevos veterinarios o recepcionistas
3. Asigna veterinarios a veterinarias
4. Revisa reportes de sistema
5. Configura parámetros globales
```

---

# **ARQUITECTURA DEL SISTEMA**

## 4.1 Architetura de Capas

```
┌─────────────────────────────────────────┐
│       FRONTEND (Presentación)           │
├─────────────────────────────────────────┤
│  React (Web)    │  React Native (Móvil) │
│  UI Components  │  Mobile Screens       │
└────────────────┬────────────────────────┘
                 │ HTTPS
                 ▼
┌─────────────────────────────────────────┐
│    API GATEWAY / SEGURIDAD (CORS)       │
│    Validación JWT, AuthFilter           │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│     BACKEND (Lógica de Negocios)        │
├─────────────────────────────────────────┤
│  Spring Boot 3.1.12                     │
│  ├─ Controllers (REST Endpoints)        │
│  ├─ Services (Lógica de Negocio)        │
│  ├─ Repositories (Acceso a Datos)       │
│  └─ Security (JWT, BCrypt)              │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   DATA ACCESS LAYER (ORM - Spring JPA)  │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│   BASE DE DATOS                         │
│   MySQL 8.0                             │
│   ├─ Usuarios y Roles                   │
│   ├─ Mascotas                           │
│   ├─ Citas                              │
│   ├─ Historias Clínicas                 │
│   └─ Reportes                           │
└─────────────────────────────────────────┘
```

## 4.2 Arquitectura de Microservicios Potencial

El sistema está diseñado para evolucionar hacia una arquitectura de microservicios:

```
┌──────────────────────────────────────────┐
│        API Gateway (Kong / Zuul)         │
└────┬─────────┬──────────┬────────────────┘
     │         │          │
     ▼         ▼          ▼
┌─────────┐ ┌──────────┐ ┌──────────┐
│ Auth    │ │ Chat     │ │ PDF      │
│Service  │ │Service   │ │Service   │
└─────────┘ └──────────┘ └──────────┘
     │         │          │
     ▼         ▼          ▼
  [BBDD]    [BBDD]     [BBDD]
```

## 4.3 Flujo de Autenticación

```
Usuario         Frontend                Backend                JWT Token
  │                │                        │                       │
  ├─Login────────►│                        │                       │
  │                ├─POST /auth/login──────►│                       │
  │                │   (credenciales)       ├─Validar Credenciales  │
  │                │                        ├─Generar JWT───────────┤
  │                │◄────Response + JWT─────┤                       │
  │◄───Session────┤                        │                       │
  │                │                        │                       │
  │──Solicitud────►│                        │                       │
  │ protegida      ├─GET /api/resource────►│                       │
  │                │   + Bearer Token       ├─Validar Token         │
  │                │                        │──────────────────┐    │
  │                │                        │                  │    │
  │                │                        │  Token Válido? ◄─┘    │
  │                │◄────Response + Data────┤                       │
  │◄───Recurso─────┤                        │                       │
```

## 4.4 Patrón de Seguridad (RBAC)

```
┌────────────────────┐
│  Usuario Autenticado│
│  JWT Token válido   │
└──────────┬──────────┘
           │
           ▼
    ┌─────────────┐
    │ Verificar   │
    │ Rol/Permisos│
    └──────┬──────┘
           │
     ┌─────┴─────┐
     │           │
     ▼           ▼
 [Permitido] [Denegado]
     │           │
     ▼           ▼
  Ejecutar   HttpStatus
  Endpoint    403 Forbidden
```

---

# **ESPECIFICACIONES TÉCNICAS**

## 5.1 Requisitos del Sistema

### Hardware Mínimo (Desarrollo)
- **Procesador:** Intel Core i5 o equivalente
- **RAM:** 8 GB mínimo
- **Almacenamiento:** 50 GB disponibles
- **Red:** Conexión a Internet para dependencias

### Hardware Recomendado (Producción)
- **Procesador:** Intel Xeon o equivalente
- **RAM:** 32 GB mínimo
- **Almacenamiento:** 500 GB SSD
- **Servidor:** Linux (Ubuntu 20.04 LTS o superior)

### Software Requerido

| Software | Versión | Propósito |
|----------|---------|----------|
| Java Development Kit | 17+ | Compilación y ejecución de código Java |
| Maven | 3.8+ | Gestión de dependencias y build |
| MySQL | 8.0+ | Base de datos relacional |
| Node.js | 16+ | Ejecución de npm para dependencias |
| npm | 8+ | Gestor de paquetes JavaScript |
| Git | 2.26+ | Control de versiones |
| Visual Studio Code / IntelliJ | Actual | Desarrollo |

## 5.2 Dependencias Principales

### Backend (pom.xml)
```xml
<!-- Spring Boot Web (REST API) -->
spring-boot-starter-web 3.1.12

<!-- Spring Data JPA (Persistencia) -->
spring-boot-starter-data-jpa

<!-- Spring Security (Autenticación) -->
spring-boot-starter-security

<!-- MySQL Connector -->
mysql-connector-j 8.x

<!-- JWT (jjwt) -->
io.jsonwebtoken:jjwt-api 0.12.3

<!-- iText7 (Generación PDF) -->
com.itextpdf:itext7-core 7.x

<!-- Lombok (Generación de código) -->
projectlombok:lombok 1.18.x

<!-- Spring Boot Devtools -->
spring-boot-devtools
```

### Frontend (package.json)
```json
{
  "react": "19.2.0",
  "react-dom": "19.2.0",
  "typescript": "4.9.5",
  "react-router-dom": "7.9.4",
  "axios": "1.12.2",
  "bootstrap": "5.3.8",
  "react-bootstrap": "2.10.0"
}
```

### Front Mobile (package.json)
```json
{
  "react": "18.3.1",
  "react-native": "0.81.5",
  "expo": "54.0.0",
  "axios": "1.6.2",
  "react-native-safe-area-context": "4.12.0",
  "@react-navigation/native": "7.0.13"
}
```

## 5.3 Puertos y Servicios

### Puertos por Defecto (Desarrollo)

| Servicio | Puerto | URL |
|----------|--------|-----|
| Backend Spring Boot | 8080 | http://localhost:8080 |
| Frontend React | 3000 | http://localhost:3000 |
| Frontend Mobile | 3001 | http://localhost:3001 |
| MySQL | 3306 | localhost:3306 |
| phpMyAdmin | 80 | http://localhost/phpmyadmin |

⚠️ **Nota:** En producción cambiar puertos y usar HTTPS

## 5.4 Variables de Entorno

### Backend (.env o application.properties)
```properties
# Base de Datos
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/veterinaria
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=

# JWT
APP_JWT_SECRET=dGVzdFNlY3JldEtleUZvclZldGVyaW5hcmlhU3lzdGVtMjAyNFVzaW5nSldUVG9rZW5zRm9yQXV0aGVudGljYXRpb25BbmRBdXRob3JpemF0aW9u
APP_JWT_EXPIRATION_MS=604800000

# CORS
APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Spring
SERVER_PORT=8080
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=30000
REACT_APP_VERSION=2.0
```

---

# **INSTALACIÓN Y CONFIGURACIÓN**

## 6.1 Instalación del Backend

### Paso 1: Clonar el Repositorio
```bash
cd c:\xampp\htdocs
git clone <repositorio-url>
cd Backend-2.0
```

### Paso 2: Configurar Base de Datos MySQL

```bash
# Abrir CMD o PowerShell
mysql -u root

# En MySQL console:
CREATE DATABASE veterinaria CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE veterinaria;

# Ejecutar scripts SQL
SOURCE path/to/DATABASE_DDL.sql;
SOURCE path/to/DATABASE_DML.sql;

# Verificar
SHOW TABLES;
SELECT * FROM roles;
```

### Paso 3: Compilar y Ejecutar Backend

```bash
# Navegar a directorio backend
cd backend

# Compilar con Maven
mvn clean package

# Ejecutar la aplicación
mvn spring-boot:run

# O ejecutar el JAR generado
java -jar target/veterinaria-backend-0.0.1-SNAPSHOT.jar
```

✅ Si todo funciona: `http://localhost:8080` retorna estado 200

### Paso 4: Verificar Salud del Backend
```bash
curl http://localhost:8080/health
# Respuesta esperada: {"status":"UP"}
```

## 6.2 Instalación del Frontend Web

### Paso 1: Instalar Dependencias
```bash
cd frontend
npm install
```

### Paso 2: Configurar Variables de Entorno
```bash
# Crear archivo .env
echo REACT_APP_API_URL=http://localhost:8080 > .env
```

### Paso 3: Ejecutar Frontend en Desarrollo
```bash
npm start
# Se abre automáticamente: http://localhost:3000
```

### Paso 4: Build para Producción
```bash
npm run build
# Genera carpeta build/ lista para deployment
```

## 6.3 Instalación del Frontend Móvil (Expo)

### Paso 1: Instalar Dependencias
```bash
cd frontend-appMovil
npm install

# O usar yarn
yarn install
```

### Paso 2: Instalar Expo CLI global
```bash
npm install -g expo-cli
```

### Paso 3: Ejecutar Aplicación
```bash
# Opción 1: Expo Go (Recomendado para desarrollo)
expo start

# Opción 2: Emulador Android
expo start --android

# Opción 3: Simulador iOS
expo start --ios
```

### Paso 4: Usar Expo Go en Dispositivo
1. Instalar app "Expo Go" desde Play Store / App Store
2. Escanear código QR desde terminal
3. App se ejecuta en dispositivo

## 6.4 Script de Inicio Rápido

### Windows (iniciar-proyecto.bat)
```batch
@echo off
echo ========================================
echo Iniciando Sistema Veterinaria PET v2.0
echo ========================================

REM Terminal 1: Backend
start cmd /k "cd backend && mvn spring-boot:run"
timeout /t 3

REM Terminal 2: Frontend Web
start cmd /k "cd frontend && npm start"
timeout /t 3

REM Terminal 3: Frontend Móvil (opcional)
echo.
echo Para iniciar app móvil ejecutar:
echo cd frontend-appMovil && expo start

echo.
echo ========================================
echo Servicios en ejecución:
echo Backend:     http://localhost:8080
echo Frontend:    http://localhost:3000
echo ========================================
pause
```

## 6.5 Verificación Post-Instalación

Ejecutar esta checklist para confirmar que todo funciona:

```
✅ CHECKLIST DE INSTALACIÓN

[ ] Base de Datos
    [ ] MySQL ejecutándose en puerto 3306
    [ ] Base de datos 'veterinaria' creada
    [ ] Tablas principales: usuarios, mascotas, citas, etc.
    [ ] Datos de prueba cargados

[ ] Backend
    [ ] Java 17+ instalado (java -version)
    [ ] Maven compilando sin errores (mvn clean package)
    [ ] Aplicación iniciada en puerto 8080
    [ ] GET /health retorna {"status":"UP"}
    [ ] POST /auth/login funciona con credenciales válidas

[ ] Frontend Web
    [ ] Node.js 16+ instalado (node -version)
    [ ] npm 8+ instalado (npm -version)
    [ ] Dependencias instaladas (npm install)
    [ ] React ejecutándose en puerto 3000
    [ ] Página Login carga correctamente
    [ ] Login con admin/admin123 funciona

[ ] Frontend Móvil (opcional)
    [ ] Expo CLI global instalado
    [ ] Dependencias instaladas (npm install)
    [ ] Expo start compila sin errores
    [ ] Expo Go abre la app en dispositivo

[ ] Conectividad
    [ ] Frontend conecta a Backend (revisar Network en DevTools)
    [ ] No hay errores de CORS
    [ ] Tokens JWT se envían correctamente
```

---

# **ESTRUCTURA DEL CÓDIGO FUENTE**

## 7.1 Estructura Backend (Spring Boot)

```
backend/
├── src/main/java/com/veterinaria/veterinaria/
│   ├── VeterinariaApplication.java          # Clase principal
│   │
│   ├── config/                              # Configuración
│   │   ├── CorsConfig.java                  # Configuración CORS
│   │   ├── SecurityConfig.java              # Configuración de seguridad
│   │   └── JwtConfig.java                   # Configuración JWT
│   │
│   ├── controller/                          # Controladores REST
│   │   ├── AuthController.java              # Autenticación (login, registro)
│   │   ├── UsuarioController.java           # CRUD de usuarios
│   │   ├── VeterinariaController.java       # CRUD de veterinarias
│   │   ├── MascotaController.java           # CRUD de mascotas
│   │   ├── CitaController.java              # CRUD y gestión de citas
│   │   ├── HistoriaClinicaController.java   # CRUD de historias clínicas
│   │   ├── ReporteController.java           # Generación de reportes
│   │   ├── PdfController.java               # Generación de PDFs
│   │   ├── DashboardController.java         # Datos para dashboard
│   │   ├── SearchController.java            # Búsquedas avanzadas
│   │   ├── HealthController.java            # Health check
│   │   └── GestionReporteController.java    # Gestión de reportes
│   │
│   ├── dto/                                 # Data Transfer Objects
│   │   ├── LoginRequest.java
│   │   ├── LoginResponse.java
│   │   ├── UsuarioDTO.java
│   │   ├── MascotaDTO.java
│   │   ├── CitaDTO.java
│   │   ├── HistoriaClinicaDTO.java
│   │   └── ReporteDTO.java
│   │
│   ├── entity/                              # Entidades JPA
│   │   ├── Usuario.java                     # Tabla usuarios
│   │   ├── Rol.java                         # Tabla roles
│   │   ├── Veterinaria.java                 # Tabla veterinarias
│   │   ├── Mascota.java                     # Tabla mascotas
│   │   ├── Cita.java                        # Tabla citas
│   │   ├── HistoriaClinica.java             # Tabla historias_clínicas
│   │   ├── Reporte.java                     # Tabla reportes
│   │   └── BaseEntity.java                  # Clase base (ids, timestamps)
│   │
│   ├── repository/                          # Repositorios JPA
│   │   ├── UsuarioRepository.java
│   │   ├── RolRepository.java
│   │   ├── VeterinariaRepository.java
│   │   ├── MascotaRepository.java
│   │   ├── CitaRepository.java
│   │   ├── HistoriaClinicaRepository.java
│   │   ├── ReporteRepository.java
│   │   └── CustomQueryRepository.java       # Queries personalizadas
│   │
│   ├── service/                             # Servicios (Lógica de Negocio)
│   │   ├── UsuarioService.java
│   │   ├── VeterinariaService.java
│   │   ├── MascotaService.java
│   │   ├── CitaService.java
│   │   ├── HistoriaClinicaService.java
│   │   ├── ReporteService.java
│   │   ├── PdfService.java
│   │   ├── AuthService.java
│   │   ├── EmailService.java               # Envío de emails (opcional)
│   │   └── DashboardService.java            # Estadísticas para dashboard
│   │
│   ├── security/                            # Seguridad JWT
│   │   ├── JwtTokenProvider.java            # Generación/Validación de JWT
│   │   ├── JwtAuthenticationFilter.java     # Filtro de autenticación
│   │   ├── JwtAuthenticationEntryPoint.java # Manejo de excepciones JWT
│   │   └── CustomUserDetailsService.java    # Cargar detalles de usuario
│   │
│   └── util/                                # Utilidades
│       ├── Constants.java
│       ├── DateUtils.java
│       ├── ValidationUtils.java
│       └── FileUtils.java
│
├── src/main/resources/
│   ├── application.properties               # Configuración de la aplicación
│   └── messages.properties                  # Mensajes internacionalizados
│
└── pom.xml                                  # Dependencias Maven
```

### Descripción de Componentes Principales

#### 7.1.1 Controllers (Controladores REST)

Los controladores manejan las peticiones HTTP y retornan respuestas JSON.

**Ejemplo: AuthController**
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        // Autenticar usuario
        // Generar JWT
        // Retornar token
    }
    
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegistroRequest request) {
        // Validar datos
        // Crear nuevo usuario
        // Retornar confirmación
    }
}
```

#### 7.1.2 Services (Servicios)

Los servicios contienen la lógica de negocio y orquestación de datos.

**Ejemplo: MascotaService**
```java
@Service
@Transactional
public class MascotaService {
    
    @Autowired
    private MascotaRepository mascotaRepository;
    
    public Mascota crearMascota(MascotaDTO dto) {
        // Validar datos
        // Crear entidad
        // Guardar en BD
        // Retornar resultados
    }
    
    public List<Mascota> obtenerMascotasPorPropietario(String documento) {
        // Buscar mascotas del propietario
        // Validar permisos
        // Retornar lista
    }
}
```

#### 7.1.3 Repositories (Repositorios)

Los repositorios proporcionan acceso a datos usando Spring Data JPA.

**Ejemplo: MascotaRepository**
```java
@Repository
public interface MascotaRepository extends JpaRepository<Mascota, Long> {
    
    List<Mascota> findByPropietarioDocumento(String documento);
    
    List<Mascota> findByEspecieIgnoreCase(String especie);
    
    Optional<Mascota> findByNombreAndPropietarioDocumento(
        String nombre, 
        String documento
    );
}
```

#### 7.1.4 DTOs (Data Transfer Objects)

Los DTOs modelan los datos transferidos entre frontend y backend.

**Ejemplo: MascotaDTO**
```java
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MascotaDTO {
    private Long id;
    private String nombre;
    private String especie;
    private String raza;
    private String color;
    private String sexo;
    private String propietarioDocumento;
    private Float peso;
    private String observaciones;
}
```

#### 7.1.5 Entities (Entidades)

Las entidades mapean las tablas de la base de datos usando JPA.

**Ejemplo: Mascota Entity**
```java
@Entity
@Table(name = "mascotas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Mascota {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(length = 50)
    private String especie;
    
    @Column(length = 50)
    private String raza;
    
    @ManyToOne
    @JoinColumn(name = "propietario_documento")
    private Usuario propietario;
    
    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL)
    private List<Cita> citas;
    
    @OneToMany(mappedBy = "mascota", cascade = CascadeType.ALL)
    private List<HistoriaClinica> historias;
}
```

#### 7.1.6 Security (Seguridad)

Implementación de JWT y Spring Security.

**Ejemplo: JwtTokenProvider**
```java
@Component
public class JwtTokenProvider {
    
    @Value("${app.jwtSecret}")
    private String jwtSecret;
    
    @Value("${app.jwtExpirationInMs}")
    private long jwtExpirationInMs;
    
    public String generateToken(Authentication authentication) {
        // Generar JWT con información del usuario
    }
    
    public boolean validateToken(String token) {
        // Validar firma y fecha de expiración
    }
    
    public String getUsernameFromToken(String token) {
        // Extraer username del token
    }
}
```

## 7.2 Estructura Frontend Web (React)

```
frontend/
├── public/
│   ├── index.html                   # HTML principal
│   ├── favicon.ico
│   ├── manifest.json                # Configuración PWA
│   └── robots.txt                   # Para indexación
│
├── src/
│   ├── index.tsx                    # Punto de entrada React
│   ├── App.tsx                      # Componente raíz
│   ├── App.css                      # Estilos globales
│   ├── reportWebVitals.ts           # Métricas de desempeño
│   │
│   ├── components/                  # Componentes reutilizables
│   │   ├── NavigationBar.tsx        # Barra de navegación
│   │   ├── ProtectedRoute.tsx       # Rutas protegidas por rol
│   │   ├── UserManagement.tsx       # Gestión de usuarios
│   │   ├── MascotaManagement.tsx    # Gestión de mascotas
│   │   ├── CitaManagement.tsx       # Gestión de citas
│   │   ├── HistoriaClinicaManagement.tsx # Historias clínicas
│   │   ├── ReporteManagement.tsx    # Reportes
│   │   ├── VeterinariaManagement.tsx# Gestión veterinarias
│   │   ├── UserProfile.tsx          # Perfil de usuario
│   │   ├── SearchableSelect.tsx     # Select especializado
│   │   ├── DashboardHome.tsx        # Dashboard principal
│   │   └── *.css                    # Estilos de componentes
│   │
│   ├── pages/                       # Páginas principales
│   │   ├── Dashboard.tsx            # Dashboard con rol
│   │   ├── Home.tsx                 # Página de inicio
│   │   ├── Login.tsx                # Pantalla login
│   │   ├── Register.tsx             # Pantalla registro
│   │   └── *.css                    # Estilos de páginas
│   │
│   ├── services/                    # Servicios de API
│   │   ├── apiClient.ts             # Cliente HTTP (Axios)
│   │   ├── authService.ts           # Servicio de autenticación
│   │   ├── usuarioService.ts        # Servicio de usuarios
│   │   ├── mascotaService.ts        # Servicio de mascotas
│   │   ├── citaService.ts           # Servicio de citas
│   │   ├── historiaClinicaService.ts# Servicio historias clínicas
│   │   ├── veterinariaService.ts    # Servicio veterinarias
│   │   └── reporteService.ts        # Servicio reportes
│   │
│   ├── styles/                      # Estilos adicionales
│   │   ├── Dashboard.css
│   │   ├── variables.css
│   │   └── responsive.css
│   │
│   └── types/                       # Tipos TypeScript
│       └── index.ts                 # Interfaces compartidas
│
├── package.json                     # Dependencias npm
├── tsconfig.json                    # Configuración TypeScript
├── setupProxy.js                    # Proxy para desarrollo
└── setupTests.ts                    # Configuración de tests
```

### Descripción de Componentes Frontend

#### 7.2.1 Services (Servicios API)

**Ejemplo: apiClient.ts**
```typescript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token JWT
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
```

#### 7.2.2 Componentes

**Ejemplo: UserManagement.tsx**
```typescript
const UserManagement: React.FC = () => {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      const response = await usuarioService.obtenerTodos();
      setUsuarios(response.data);
    } catch (error) {
      console.error('Error: ', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Gestión de Usuarios</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Documento</th>
              <th>Nombres</th>
              <th>Email</th>
              <th>Rol</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.documento}>
                <td>{usuario.documento}</td>
                <td>{usuario.nombres}</td>
                <td>{usuario.email}</td>
                <td>{usuario.rol}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
```

#### 7.2.3 Rutas Protegidas

**Ejemplo: ProtectedRoute.tsx**
```typescript
const ProtectedRoute: React.FC<{
  component: React.ComponentType;
  requiredRoles?: string[];
}> = ({ component: Component, requiredRoles = [] }) => {
  const isAuthenticated = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('userRole');

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole || '')) {
    return <Navigate to="/unauthorized" />;
  }

  return <Component />;
};
```

---

# **BASE DE DATOS**

## 8.1 Esquema de Datos

### 8.1.1 Diagrama Entidad-Relación

```
┌─────────────┐     ┌──────────────┐
│   ROLES     │     │   USUARIOS   │
├─────────────┤     ├──────────────┤
│ id (PK)     │────→│ documento(PK)│
│ nombre      │◄────│ username     │
│ descripcion │  1:N│ password     │
│ activo      │     │ email        │
└─────────────┘     │ telefono     │
       ▲            │ veterinaria  │
       │            │ activo       │
       │            └──┬───────────┘
       │ M:N           │ 1:N
  ┌────┴────────┐      │
  │USUARIOS_    │      │
  │  ROLES      │      ▼
  └─────────────┘   ┌──────────────┐
                    │  MASCOTAS    │
  ┌──────────────┐  ├──────────────┤
  │VETERINARIAS  │  │ id(PK)       │
  ├──────────────┤  │ nombre       │
  │ id(PK)       │  │ especie      │
  │ nombre       │  │ propietario  │──→fecha_nacimiento
  │ direccion    │  │ peso         │
  │ telefono     │  │ activo       │
  │ email        │  └──┬───────────┘
  └─────────────tz      │ 1:N
                       │
                       ▼
                  ┌───────────────┐
                  │    CITAS      │
                  ├───────────────┤
                  │ id(PK)        │
                  │ fecha_hora    │
                  │ cliente       │
                  │ mascota       │
                  │ veterinario   │
                  │ estado        │
                  │ motivo        │
                  └───┬───────────┘
                      │ 1:N
                      ▼
            ┌─────────────────────┐
            │ HISTORIAS_CLINICAS  │
            ├─────────────────────┤
            │ id(PK)              │
            │ fecha_consulta      │
            │ diagnostico         │
            │ tratamiento         │
            │ medicamentos        │
            │ veterinario         │
            └─────────────────────┘
```

### 8.1.2 Descripción de Tablas

#### Tabla: ROLES
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | INT | PK, AUTO_INCREMENT | Identificador único |
| nombre | VARCHAR(50) | UNIQUE, NOT NULL | Nombre del rol |
| descripcion | TEXT | | Descripción |
| activo | BOOLEAN | DEFAULT true | Estado del rol |

#### Tabla: USUARIOS
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| documento | VARCHAR(20) | PK | Documento de identidad |
| tipo_documento | ENUM | | CC, CE, NIT, etc. |
| username | VARCHAR(50) | UNIQUE, NOT NULL | Usuario para login |
| password | VARCHAR(255) | NOT NULL | Hash BCrypt |
| nombres | VARCHAR(100) | NOT NULL | Nombres completos |
| apellidos | VARCHAR(100) | NOT NULL | Apellidos |
| email | VARCHAR(100) | UNIQUE | Email |
| telefono | VARCHAR(20) | | Teléfono |
| direccion | TEXT | | Dirección |
| veterinaria_id | INT | FK | Veterinaria asignada |
| creado_por_documento | VARCHAR(20) | FK | Quién creó el usuario |
| activo | BOOLEAN | DEFAULT true | Estado del usuario |
| fecha_registro | DATETIME | DEFAULT CURRENT | Fecha de creación |

#### Tabla: MASCOTAS
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| nombre | VARCHAR(100) | NOT NULL | Nombre de mascota |
| especie | VARCHAR(50) | | Perro, Gato, Ave, etc. |
| raza | VARCHAR(100) | | Raza del animal |
| color | VARCHAR(100) | | Color/marcas |
| sexo | ENUM | | Macho/Hembra |
| fecha_nacimiento | DATE | | Fecha de nacimiento |
| peso | FLOAT | | Peso en kg |
| observaciones | TEXT | | Notas sobre el animal |
| propietario_documento | VARCHAR(20) | FK, NOT NULL | Usuario propietario |
| activo | BOOLEAN | DEFAULT true | Si está activa |
| fecha_registro | DATETIME | | Cuando se registró |

#### Tabla: CITAS
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| fecha_hora | DATETIME | NOT NULL | Fecha y hora de cita |
| motivo | VARCHAR(255) | | Motivo de consulta |
| observaciones | TEXT | | Observaciones |
| estado | ENUM | | PROGRAMADA, CONFIRMADA, COMPLETADA, CANCELADA |
| cliente_documento | VARCHAR(20) | FK, NOT NULL | Usuario cliente |
| mascota_id | BIGINT | FK, NOT NULL | Mascota que visita |
| veterinario_documento | VARCHAR(20) | FK, NOT NULL | Veterinario asignado |
| veterinaria_id | INT | FK | Veterinaria donde se realiza |
| fecha_creacion | DATETIME | | Cuando se creó la cita |

#### Tabla: HISTORIAS_CLINICAS
| Columna | Tipo | Restricciones | Descripción |
|---------|------|---------------|-------------|
| id | BIGINT | PK, AUTO_INCREMENT | Identificador único |
| mascota_id | BIGINT | FK, NOT NULL | Mascota |
| veterinario_documento | VARCHAR(20) | FK | Veterinario que atiende |
| fecha_consulta | DATE | NOT NULL | Fecha de consulta |
| motivo_consulta | TEXT | | Motivo de la consulta |
| diagnostico | TEXT | | Diagnóstico realizado |
| tratamiento | TEXT | | Plan de tratamiento |
| medicamentos | TEXT | | Medicamentos prescritos |
| observaciones | TEXT | | Observaciones adicionales |
| recomendaciones | TEXT | | Recomendaciones |
| peso | FLOAT | | Peso en kg |
| temperatura | FLOAT | | Temperatura corporal |
| frecuencia_cardiaca | INT | | Pulsaciones por minuto |
| frecuencia_respiratoria | INT | | Respiraciones por minuto |
| activo | BOOLEAN | | Activa o archivada |
| fecha_creacion | DATETIME | | Cuando se registró |

## 8.2 Datos Iniciales (DML)

El archivo `DATABASE_DML.sql` contiene datos de prueba:

### Usuarios Iniciales
```sql
-- 15 usuarios predefinidos
- 1 Administrador
- 6 Veterinarios
- 3 Recepcionistas
- 5 Clientes
```

### Mascotas de Prueba
```sql
-- 15 mascotas asociadas a clientes
- 9 Perros
- 6 Gatos
```

### Citas de Ejemplo
```sql
-- 15 citas en diferentes estados
- Completadas (pasadas)
- Programadas (futuras)
- Confirmadas
```

### Historias Clínicas
```sql
-- 15 historias clínicas con datos médicos reales
```

## 8.3 Consultas SQL Útiles

### Buscar usuarios por rol
```sql
SELECT u.documento, u.nombres, u.email, r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_VETERINARIO';
```

### Obtener mascotas del cliente
```sql
SELECT m.* 
FROM mascotas m
WHERE m.propietario_documento = '33333333'
AND m.activo = true;
```

### Listar citas del veterinario hoy
```sql
SELECT c.* 
FROM citas c
WHERE c.veterinario_documento = '87654321'
AND DATE(c.fecha_hora) = CURDATE()
ORDER BY c.fecha_hora ASC;
```

### Historial médico completoode mascota
```sql
SELECT hc.*, m.nombre, u.nombres as veterinario
FROM historias_clinicas hc
JOIN mascotas m ON hc.mascota_id = m.id
JOIN usuarios u ON hc.veterinario_documento = u.documento
WHERE m.id = 1
ORDER BY hc.fecha_consulta DESC;
```

### Estadísticas de citas por veterinario
```sql
SELECT 
  u.nombres,
  COUNT(c.id) as total_citas,
  SUM(CASE WHEN c.estado = 'COMPLETADA' THEN 1 ELSE 0 END) as completadas,
  SUM(CASE WHEN c.estado = 'CANCELADA' THEN 1 ELSE 0 END) as canceladas
FROM citas c
JOIN usuarios u ON c.veterinario_documento = u.documento
GROUP BY c.veterinario_documento
ORDER BY total_citas DESC;
```

## 8.4 Backup y Restore

### Crear Backup de Base de Datos
```bash
# Windows
mysqldump -u root -p veterinaria > backup_veterinaria.sql

# Linux/Mac
mysqldump -u root -p'password' veterinaria > backup_veterinaria.sql
```

### Restaurar desde Backup
```bash
mysql -u root -p veterinaria < backup_veterinaria.sql
```

### Script de Backup Automático (Windows)
```batch
@echo off
setlocal enabledelayedexpansion

REM Variables
set MYSQL_USER=root
set MYSQL_PASS=
set DB_NAME=veterinaria
set BACKUP_DIR=C:\backups\veterinaria
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%
set TIME=%time:~0,2%%time:~3,2%%time:~6,2%
set BACKUP_FILE=%BACKUP_DIR%\backup_%DATE%_%TIME%.sql

REM Crear directorio si no existe
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

REM Crear backup
mysqldump -u %MYSQL_USER% -p%MYSQL_PASS% %DB_NAME% > %BACKUP_FILE%

echo Backup completado: %BACKUP_FILE%
```

---

# **AUTENTICACIÓN Y SEGURIDAD**

## 9.1 Sistema de Autenticación JWT

### 9.1.1 Flujo de Autenticación

```
1. Usuario ingresa credenciales (usuario/contraseña)
   ↓
2. Backend valida contra BD
   ↓
3. Contraseña se compara con hash BCrypt almacenado
   ↓
4. Si es válido:
   - Se extrae roles del usuario
   - Se genera JWT con claims de usuario y roles
   - Se retorna JWT al frontend
   ↓
5. Frontend almacena JWT en localStorage
   ↓
6. Para cada petición posterior:
   - Frontend incluye Authorization: Bearer <JWT>
   - Backend verifica firma del token
   - Backend extrae usuario y roles
   - Se valida autorización basada en rol
```

### 9.1.2 Estructura del JWT

```
Formato: <header>.<payload>.<signature>

Header:
{
  "typ": "JWT",
  "alg": "HS256"
}

Payload:
{
  "sub": "12345678",
  "username": "admin",
  "email": "admin@veterinaria.com",
  "roles": ["ROLE_ADMIN"],
  "iat": 1707567890,  // Issued at
  "exp": 1708172690   // Expiration (7 días)
}

Signature:
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret_key
)
```

### 9.1.3 Configuración JWT

**application.properties:**
```properties
# JWT Secret Key (debe ser muy seguro en producción)
app.jwtSecret=dGVzdFNlY3JldEtleUZvclZldGVyaW5hcmlhU3lzdGVtMjAyNFVzaW5nSldUVG9rZW5zRm9yQXV0aGVudGljYXRpb25BbmRBdXRob3JpemF0aW9u

# Expiración en milisegundos (604800000 = 7 días)
app.jwtExpirationInMs=604800000
```

⚠️ **Importante:** En producción, usar jwtSecret más seguro y mantenerlo secreto.

## 9.2 Control de Acceso Basado en Roles (RBAC)

### 9.2.1 Roles del Sistema

| Rol | ID | Descripción | Permisos |
|-----|----|-------------|----------|
| **ROLE_ADMIN** | 1 | Administrador | Acceso total |
| **ROLE_VETERINARIO** | 2 | Veterinario | Consultas, historias clínicas, reportes |
| **ROLE_RECEPCIONISTA** | 4 | Recepcionista | Citas, clientes, mascotas (lectura) |
| **ROLE_CLIENTE** | 3 | Cliente/Propietario | Sus mascotas, sus citas |

### 9.2.2 Matriz de Permisos

```
MÓDULO              ADMIN  VETERINARIO  RECEPCIONISTA  CLIENTE
─────────────────────────────────────────────────────────────
Usuarios            CRUD      R          R              -
Veterinarias        CRUD      R          R              -
Mascotas            CRUD      CRUD       R              R(Propias)
Citas               CRUD      CRUD       CRUD           R(Propias)
Historias Clínicas  CRUD      CRUD       R              R(Propias)
Reportes            CRUD      R          R              -
Dashboard           ADMIN     VETERINARIO RECEPCION     CLIENTE
```

### 9.2.3 Anotaciones de Seguridad

**En Controllers:**
```java
// Solo ADMIN
@PreAuthorize("hasRole('ADMIN')")
@PostMapping("/usuarios")
public ResponseEntity<?> crearUsuario(@RequestBody UsuarioDTO dto) { }

// Admin o Veterinario
@PreAuthorize("hasAnyRole('ADMIN', 'VETERINARIO')")
@GetMapping("/historias-clinicas")
public ResponseEntity<?> obtenerHistorias() { }

// Solo si es dueño o ADMIN
@PreAuthorize("hasRole('ADMIN') or @usuarioService.esOwner(#documento)")
@GetMapping("/mascotas/{documento}")
public ResponseEntity<?> obtenerMascotas(@PathVariable String documento) { }
```

## 9.3 Protección de Contraseñas

### 9.3.1 Hash BCrypt

Las contraseñas se almacenan hasheadas con BCrypt:

```java
@Configuration
public class SecurityConfig {
    
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // strength = 10
    }
}
```

### 9.3.2 Fuerzas del Hash

- **Strength = 10:** ~10ms por hash (balance seguridad/rendimiento)
- **Strength = 12:** ~40ms (más seguro, más lento)
- **Strength = 15:** ~1 segundo (muy seguro, muy lento)

**En desarrollo:** Strength 10
**En producción:** Strength 12+

### 9.3.3 Verificación de Contraseña

```java
PasswordEncoder encoder = new BCryptPasswordEncoder();

// Al crear usuario
String rawPassword = "miPassword123";
String hashedPassword = encoder.encode(rawPassword);
usuario.setPassword(hashedPassword);

// Al login
String inputPassword = "miPassword123";
boolean matches = encoder.matches(inputPassword, usuario.getPassword());
if (matches) {
  // Login exitoso
}
```

## 9.4 CORS (Cross-Origin Resource Sharing)

### 9.4.1 Configuración CORS

**CorsConfig.java:**
```java
@Configuration
public class CorsConfig {
    
    @Bean
    public WebMvcConfigurer corsConfigurer() {
        return new WebMvcConfigurer() {
            @Override
            public void addCorsMappings(CorsRegistry registry) {
                registry
                  .addMapping("/api/**")
                  .allowedOrigins(
                      "http://localhost:3000",
                      "http://localhost:3001",
                      "http://10.0.2.2:3001",
                      "https://produccion.com"
                  )
                  .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                  .allowedHeaders("*")
                  .allowCredentials(true)
                  .maxAge(3600);
            }
        };
    }
}
```

### 9.4.2 Variables en application.properties

```properties
# Orígenes permitidos (separados por comas)
app.cors.allowed-origins=http://localhost:3000,http://localhost:3001,https://produccion.com
```

## 9.5 Certificados HTTPS (TLS/SSL)

### 9.5.1 Crear Certificado Autofirmado (Desarrollo)

```bash
# Generar keystore
keytool -genkeypair -alias veterinaria -keyalg RSA \
  -keysize 2048 -keystore keystore.p12 \
  -keypass password123 -storepass password123 \
  -storetype PKCS12

# Colocar en src/main/resources/
```

### 9.5.2 Configurar HTTPS en Spring Boot

**application.properties:**
```properties
server.ssl.key-store=classpath:keystore.p12
server.ssl.key-store-password=password123
server.ssl.key-store-type=PKCS12
server.ssl.key-alias=veterinaria
server.port=8443
```

⚠️ **En producción:** Usar certificados emitidos por CA confiable (Let's Encrypt, DigiCert, etc.)

---

# **API REST - ENDPOINTS**

## 10.1 Documentación de Endpoints

### 10.1.1 Authentication Endpoints

#### POST /api/auth/login
Autentica usuario y retorna JWT token

**Request:**
```http
POST /api/auth/login HTTP/1.1
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "documento": "12345678",
    "nombres": "Administrador",
    "email": "admin@veterinaria.com",
    "rol": "ROLE_ADMIN"
  }
}
```

**Response (401 Unauthorized):**
```json
{
  "error": "Credenciales inválidas",
  "timestamp": "2026-02-11T10:30:00Z"
}
```

---

#### POST /api/auth/register
Registra nuevo usuario cliente

**Request:**
```http
POST /api/auth/register HTTP/1.1
Content-Type: application/json

{
  "documento": "12345678",
  "tipoDocumento": "CC",
  "nombres": "Juan",
  "apellidos": "Pérez",
  "username": "juan123",
  "email": "juan@email.com",
  "password": "SecurePass123!",
  "telefono": "3001234567",
  "direccion": "Calle 10 #20-30"
}
```

**Response (201 Created):**
```json
{
  "message": "Usuario registrado exitosamente",
  "usuario": {
    "documento": "12345678",
    "nombres": "Juan",
    "email": "juan@email.com"
  }
}
```

---

### 10.1.2 Usuario Endpoints

#### GET /api/usuarios
Obtiene listado de usuarios (solo ADMIN)

**Request:**
```http
GET /api/usuarios HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "documento": "12345678",
    "nombres": "Administrador",
    "apellidos": "Sistema",
    "email": "admin@veterinaria.com",
    "rol": "ROLE_ADMIN",
    "activo": true
  },
  ...
]
```

---

#### GET /api/usuarios/{documento}
Obtiene datos de usuario específico

**Request:**
```http
GET /api/usuarios/12345678 HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "documento": "12345678",
  "nombres": "Administrador",
  "apellidos": "Sistema",
  "email": "admin@veterinaria.com",
  "telefono": "3001234567",
  "direccion": "Oficina Principal",
  "rol": "ROLE_ADMIN",
  "veterinaria": {
    "id": 1,
    "nombre": "Veterinaria Pet Care"
  },
  "activo": true,
  "fechaRegistro": "2025-12-01T08:00:00Z"
}
```

---

#### POST /api/usuarios
Crea nuevo usuario (solo ADMIN o RECEPCIONISTA)

**Request:**
```http
POST /api/usuarios HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "documento": "99999999",
  "tipoDocumento": "CC",
  "nombres": "Dr. Nuevo",
  "apellidos": "Veterinario",
  "username": "dr.nuevo",
  "email": "drnuevo@veterinaria.com",
  "password": "SecurePass123!",
  "telefono": "3009999999",
  "direccion": "Consultorio 10",
  "rol": "ROLE_VETERINARIO",
  "veterinariaId": 1
}
```

**Response (201 Created):**
```json
{
  "documento": "99999999",
  "nombres": "Dr. Nuevo",
  "email": "drnuevo@veterinaria.com",
  "rol": "ROLE_VETERINARIO"
}
```

---

### 10.1.3 Mascota Endpoints

#### GET /api/mascotas
Obtiene mascotas (filtradas por rol)

**Request:**
```http
GET /api/mascotas HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "nombre": "Max",
    "especie": "Perro",
    "raza": "Golden Retriever",
    "color": "Dorado",
    "sexo": "Macho",
    "peso": 28.5,
    "propietarioDocumento": "33333333",
    "propietarioNombre": "Pedro Pérez",
    "activo": true
  },
  ...
]
```

---

#### GET /api/mascotas/{id}
Obtiene detalles de una mascota

**Request:**
```http
GET /api/mascotas/1 HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "id": 1,
  "nombre": "Max",
  "especie": "Perro",
  "raza": "Golden Retriever",
  "color": "Dorado",
  "sexo": "Macho",
  "fechaNacimiento": "2022-02-11",
  "peso": 28.5,
  "observaciones": "Muy juguetón y amigable",
  "propietarioDocumento": "33333333",
  "propietarioNombre": "Pedro Pérez",
  "activo": true,
  "citas": [
    {
      "id": 1,
      "fechaHora": "2026-02-12T10:00:00Z",
      "motivo": "Revisión general",
      "estado": "PROGRAMADA"
    }
  ],
  "historias": [...]
}
```

---

#### POST /api/mascotas
Crea nueva mascota

**Request:**
```http
POST /api/mascotas HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "nombre": "Luna",
  "especie": "Gato",
  "raza": "Siamés",
  "color": "Crema con puntos oscuros",
  "sexo": "Hembra",
  "fechaNacimiento": "2023-05-15",
  "peso": 4.5,
  "observaciones": "Tranquila y cariñosa",
  "propietarioDocumento": "33333333"
}
```

**Response (201 Created):**
```json
{
  "id": 2,
  "nombre": "Luna",
  "especie": "Gato",
  "raza": "Siamés",
  "propietarioDocumento": "33333333"
}
```

---

### 10.1.4 Cita Endpoints

#### GET /api/citas
Obtiene citas (filtradas por rol)

**Request:**
```http
GET /api/citas?estado=PROGRAMADA&fechaDesde=2026-02-01 HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "fechaHora": "2026-02-12T10:00:00Z",
    "motivo": "Revisión general",
    "clienteDocumento": "33333333",
    "clienteNombre": "Pedro Pérez",
    "mascotaId": 1,
    "mascotaNombre": "Max",
    "veterinarioDocumento": "87654321",
    "veterinarioNombre": "Dr. Carlos García",
    "estado": "PROGRAMADA",
    "observaciones": null
  },
  ...
]
```

---

#### POST /api/citas
Crea nueva cita

**Request:**
```http
POST /api/citas HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "fechaHora": "2026-02-15T14:30:00Z",
  "motivo": "Vacunación anual",
  "observaciones": "Llevar historial médico",
  "clienteDocumento": "33333333",
  "mascotaId": 1,
  "veterinarioDocumento": "87654321",
  "veterinariaId": 1
}
```

**Response (201 Created):**
```json
{
  "id": 10,
  "fechaHora": "2026-02-15T14:30:00Z",
  "motivo": "Vacunación anual",
  "estado": "PROGRAMADA",
  "mascotaNombre": "Max"
}
```

---

#### PUT /api/citas/{id}
Actualiza cita existente

**Request:**
```http
PUT /api/citas/1 HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "estado": "CONFIRMADA",
  "observaciones": "Cliente confirmó"
}
```

**Response (200 OK):**
```json
{
  "id": 1,
  "estado": "CONFIRMADA",
  "observaciones": "Cliente confirmó"
}
```

---

### 10.1.5 Historia Clínica Endpoints

#### GET /api/historias-clinicas/{mascotaId}
Obtiene historial médico de mascota

**Request:**
```http
GET /api/historias-clinicas/1 HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "mascotaId": 1,
    "mascotaNombre": "Max",
    "fechaConsulta": "2026-02-01",
    "motivo": "Vacunación anual",
    "diagnostico": "Animal en buen estado",
    "tratamiento": "Vacuna séxtuple",
    "medicamentos": "Vacuna antirrábica",
    "observaciones": "Sin hallazgos patológicos",
    "peso": 28.5,
    "temperatura": 38.5,
    "frecuenciaCardiaca": 80,
    "frecuenciaRespiratoria": 25,
    "veterinarioNombre": "Dr. Carlos García"
  },
  ...
]
```

---

#### POST /api/historias-clinicas
Crea nueva historia clínica

**Request:**
```http
POST /api/historias-clinicas HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "mascotaId": 1,
  "fechaConsulta": "2026-02-11",
  "motivo": "Consulta de rutina",
  "diagnostico": "Infección en oído",
  "tratamiento": "Antibiótico local",
  "medicamentos": "Gotas óticas",
  "observaciones": "Aplicar 2 veces al día",
"recomendaciones": "Revisión en 1 semana",
  "peso": 28.5,
  "temperatura": 38.7,
  "frecuenciaCardiaca": 82,
  "frecuenciaRespiratoria": 24
}
```

**Response (201 Created):**
```json
{
  "id": 15,
  "mascotaNombre": "Max",
  "diagnostico": "Infección en oído",
  "fechaConsulta": "2026-02-11"
}
```

---

### 10.1.6 PDF Endpoints

#### GET /api/pdf/historia-clinica/{id}
Descarga historia clínica en PDF

**Request:**
```http
GET /api/pdf/historia-clinica/1 HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```
Content-Type: application/pdf
Content-Disposition: attachment; filename="historia_clinica_1.pdf"
<binary PDF content>
```

---

#### GET /api/pdf/cita/{id}
Descarga comprobante de cita en PDF

**Request:**
```http
GET /api/pdf/cita/1 HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```
Content-Type: application/pdf
<binary PDF content>
```

---

### 10.1.7 Reporte Endpoints

#### GET /api/reportes
Obtiene listado de reportes (solo ADMIN/VETERINARIO)

**Request:**
```http
GET /api/reportes?tipo=CITAS_MENSUALES HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "tipo": "CITAS_MENSUALES",
    "titulo": "Reporte de Citas - Diciembre 2025",
    "descripcion": "Reporte mensual de citas",
    "fechaGeneracion": "2026-02-11T10:30:00Z",
    "generadoPor": "admin",
    "contenido": {
      "totalCitas": 10,
      "completadas": 5,
      "canceladas": 0,
      "programadas": 5
    }
  },
  ...
]
```

---

#### POST /api/reportes/generar
Genera nuevo reporte

**Request:**
```http
POST /api/reportes/generar HTTP/1.1
Authorization: Bearer <TOKEN>
Content-Type: application/json

{
  "tipo": "CITAS_MENSUALES",
  "fechaInicio": "2026-01-01",
  "fechaFin": "2026-01-31"
}
```

**Response (201 Created):**
```json
{
  "id": 16,
  "tipo": "CITAS_MENSUALES",
  "titulo": "Reporte de Citas - Enero 2026",
  "contenido": {...}
}
```

---

### 10.1.8 Dashboard Endpoints

#### GET /api/dashboard/stats
Obtiene estadísticas del dashboard

**Request:**
```http
GET /api/dashboard/stats HTTP/1.1
Authorization: Bearer <TOKEN>
```

**Response (200 OK):**
```json
{
  "totalUsuarios": 15,
  "totalMascotas": 15,
  "totalCitasHoy": 3,
  "citasPendientes": 7,
  "historiasClinicasHoy": 2,
  "usuariosPorRol": {
    "ADMIN": 1,
    "VETERINARIO": 4,
    "RECEPCIONISTA": 3,
    "CLIENTE": 5
  },
  "citasEstadisticas": {
    "programadas": 5,
    "completadas": 38,
    "canceladas": 4
  }
}
```

---

### 10.1.9 Códigos de Respuesta HTTP

| Código | Significado | Descripción |
|--------|------------|-------------|
| **200** | OK | Petición exitosa |
| **201** | Created | Recurso creado exitosamente |
| **204** | No Content | Éxito sin contenido de respuesta |
| **400** | Bad Request | Solicitud inválida (validación) |
| **401** | Unauthorized | No autenticado o token inválido |
| **403** | Forbidden | Autenticado pero sin permisos |
| **404** | Not Found | Recurso no encontrado |
| **409** | Conflict | Conflicto (ej: documento duplicado) |
| **500** | Internal Server Error | Error del servidor |
| **503** | Service Unavailable | Servicio no disponible |

---

## 10.2 Testing de API

### 10.2.1 Usando cURL

```bash
# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Guardar token (resultado de login)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# GET usuarios
curl -X GET http://localhost:8080/api/usuarios \
  -H "Authorization: Bearer $TOKEN"

# POST mascota
curl -X POST http://localhost:8080/api/mascotas \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre":"Bella",
    "especie":"Perro",
    "raza":"Labrador",
    "propietarioDocumento":"33333333"
  }'
```

### 10.2.2 Usando Postman

Consultar archivo: `PRUEBA_POSTMAN.md`

1. Importar colección de Postman
2. Configurar base URL: `http://localhost:8080`
3. Ejecutar endpoint de login
4. Copiar token a variable de entorno
5. Ejecutar endpoints protegidos

---

# **MANUAL DE OPERACIÓN**

## 11.1 Operaciones de Usuario

### 11.1.1 Login al Sistema

**Pasos:**
1. Acceder a `http://localhost:3000`
2. Ingresar Usuario: `admin` / Contraseña: `admin123`
3. Click en "Inicia Sesión"
4. Se cargará el dashboard según el rol

**Credenciales de Prueba:**

```
ADMINISTRADOR
├─ Usuario: admin
├─ Contraseña: admin123
├─ Documento: 12345678
└─ Acceso: Total

VETERINARIO
├─ Usuario: dr.garcia
├─ Contraseña: admin123
├─ Documento: 87654321
└─ Acceso: Consultas, historias clínicas

RECEPCIONISTA
├─ Usuario: recepcion1
├─ Contraseña: admin123
├─ Documento: 22222222
└─ Acceso: Citas, clientes, mascotas

CLIENTE
├─ Usuario: cliente1
├─ Contraseña: admin123
├─ Documento: 33333333
└─ Acceso: Sus mascotas, sus citas
```

### 11.1.2 Crear Nuevo Usuario (ADMIN)

**Pasos:**
1. Ingresar como ADMIN
2. Ir a módulo "Gestión de Usuarios"
3. Click en "Nuevo Usuario"
4. Completar formulario:
   - Documento
   - Nombres y Apellidos
   - Email
   - Username
   - Contraseña (mín. 8 caracteres)
   - Seleccionar Rol
   - Seleccionar Veterinaria (si aplica)
5. Click en "Guardar"

**Validaciones:**
- ✅ Documento único (no repetir)
- ✅ Email válido
- ✅ Username único
- ✅ Contraseña fuerte (mín. 8 chars, mayúscula, número, especial)

### 11.1.3 Cambiar Contraseña

**Desde Perfil:**
1. Click en icono perfil (arriba derecha)
2. Seleccionar "Mi Perfil"
3. Click en "Cambiar Contraseña"
4. Ingresar contraseña actual
5. Ingresar nueva contraseña (2 veces)
6. Click en "Actualizar"

⚠️ La contraseña se encripta con BCrypt y nunca se almacena en texto plano.

---

## 11.2 Operaciones de Mascotas

### 11.2.1 Registrar Nueva Mascota (CLIENTE o RECEPCIONISTA)

**Pasos:**
1. Ir a módulo "Mascotas"
2. Click en "Registrar Mascota"
3. Completar datos:
   - Nombre de la mascota
   - Especie (Perro, Gato, Ave, Reptil, etc.)
   - Raza
   - Color/marcas
   - Sexo
   - Fecha de nacimiento
   - Peso (kg)
   - Observaciones (opcional)
4. Click en "Guardar"

**Ejemplo:**
```
Nombre: Max
Especie: Perro
Raza: Golden Retriever
Sexo: Macho
Peso: 28.5 kg
Observaciones: Muy activo, le encanta nadar
```

### 11.2.2 Consultar Historial de Mascota

**Pasos:**
1. Ir a módulo "Mascotas"
2. Buscar mascota por nombre o propietario
3. Click en mascota para ver detalles
4. Visualizar:
   - Datos básicos
   - Citas programadas y pasadas
   - Histórico médico
   - Reportes disponibles

### 11.2.3 Actualizar Datos de Mascota

**Pasos:**
1. Abrir detalles de mascota
2. Click en botón "Editar"
3. Modificar campos necesarios
4. Guardar cambios

⚠️ Solo ADMIN, VETERINARIO y RECEPCIONISTA pueden editar

---

## 11.3 Operaciones de Citas

### 11.3.1 Programar Nueva Cita (RECEPCIONISTA)

**Paso 1: Seleccionar Cliente**
- Buscar cliente por documento o nombre
- Validar que esté activo

**Paso 2: Seleccionar Mascota**
- Elegir mascota del cliente
- Verificar que esté activa

**Paso 3: Elegir Veterinario y Hora**
- Seleccionar veterinario disponible
- Elegir fecha y hora disponible
- El sistema muestra ocupación del veterinario

**Paso 4: Ingreso de Datos**
```
Mascota: Max
Motivo: Vacunación anual
Observaciones: Llevar cédula del propietario
Fecha: 2026-02-15
Hora: 14:30
Veterinario: Dr. Carlos García
Veterinaria: Pet Care
```

**Paso 5: Confirmación**
- Revisar datos
- Click en "Programar Cita"
- Sistema genera confirmación

**Notificación al Cliente:**
- Email con detalles de cita (si email está configurado)
- Recordatorio por SMS (si SMS está habilitado)

### 11.3.2 Confirmar Asistencia a Cita

**Desde Dashboard del Recepcionista:**
1. Ver citas del día
2. Cuando cliente llega:
   - Verificar documento
   - Confirmar asistencia
   - Estado pasa a "CONFIRMADA"

### 11.3.3 Completar Cita (VETERINARIO)

**Pasos:**
1. Abrir cita asignada
2. Revisar historial de mascota
3. Atender mascota
4. Registrar historia clínica
5. Cambiar estado a "COMPLETADA"

### 11.3.4 Cancelar Cita

**Razones de Cancelación:**
- Cliente no asistió
- Emergencia del veterinario
- Solicitud del cliente

**Pasos:**
1. Abrir cita
2. Click en "Cancelar"
3. Seleccionar razón
4. Ingresar observaciones (opcional)
5. Confirmar cancelación

---

## 11.4 Operaciones de Historias Clínicas

### 11.4.1 Crear Historia Clínica (VETERINARIO)

**Al completar una cita:**
1. Ingresar datos del paciente
   - Peso actual
   - Temperatura
   - Frecuencia cardíaca
   - Frecuencia respiratoria
   - Observaciones generales

2. Diagnóstico
   - Describir síntomas observados
   - Diagnóstico principal y secundarios
   - Hallazgos físicos

3. Plan de Tratamiento
   - Medicamentos prescritos
   - Dosis y frecuencia
   - Duración del tratamiento
   - Cambios en dieta

4. Recomendaciones
   - Cuidados en casa
   - Actividad física permitida
   - Próxima cita de seguimiento
   - Restricciones

**Ejemplo:**
```
HISTORIA CLÍNICA
═══════════════
Mascota: Max
Fecha: 2026-02-11
Veterinario: Dr. Carlos García

SÍNTOMAS Y EXAMEN:
- Tos seca intermitente
- Temperatura: 38.5°C (Normal)
- Frecuencia cardíaca: 82 ppm
- Peso: 28.5 kg

DIAGNÓSTICO:
Bronquitis leve, probablemente alérgica

TRATAMIENTO:
- Amoxicilina 500mg c/12h por 10 días
- Miel y té de jengibre
- Reposo en ambiente húmedo

RECOMENDACIONES:
- Evitar humo y contaminantes
- Ejercicio moderado
- Próxima revisión en 1 semana
```

### 11.4.2 Descargar Historia Clínica en PDF

**Pasos:**
1. Abrir detalles de mascota
2. Ir a pestaña "Historias Clínicas"
3. Seleccionar historia deseada
4. Click en botón "Descargar PDF"
5. Se descarga archivo: `historia_clinica_MAX_2026-02-11.pdf`

**Contenido del PDF:**
- ✅ Datos de mascota
- ✅ Datos del veterinario
- ✅ Examen físico
- ✅ Diagnóstico
- ✅ Tratamiento prescrito
- ✅ Firma digital del veterinario
- ✅ Código QR con enlace de verificación

### 11.4.3 Archivar Historia Clínica

**Pasos:**
1. Abrir historia clínica
2. Click en opciones (⋮)
3. Seleccionar "Archivar"
4. Confirmar acción
5. Historia se rastrea pero no aparece en listado activo

---

## 11.5 Operaciones de Reportes

### 11.5.1 Generar Reporte de Citas Mensuales (ADMIN/VETERINARIO)

**Pasos:**
1. Ir a módulo "Reportes"
2. Seleccionar tipo: "Citas Mensuales"
3. Seleccionar mes y año
4. Configurar filtros:
   - Por veterinario (opcional)
   - Por veterinaria (opcional)
   - Por estado (opcional)
5. Click en "Generar Reporte"

**Información Incluida:**
- Total de citas programadas
- Citas completadas
- Citas canceladas
- Citas sin asistencia
- Tasa de ocupación
- Veterinarios con más citas

### 11.5.2 Generar Reporte de Mascotas Activas

**Pasos:**
1. Ir a módulo "Reportes"
2. Seleccionar tipo: "Mascotas Registradas"
3. Configurar parámetros:
   - Rango de fechas
   - Por especie (opcional)
   - Por veterinaria (opcional)
4. Click en "Generar"

**Información Incluida:**
- Total de mascotas
- Mascotas por especie
- Mascotas por veterinaria
- Mascotas activas vs inactivas
- Top de razas más comunes

### 11.5.3 Generar Reporte de Ingresos (ADMIN)

**Pasos:**
1. Ir a módulo "Reportes Financieros"
2. Seleccionar período
3. Configurar:
   - Mes/Trimestre/Año
   - Por veterinaria
   - Por servicio
4. Generar reporte

**Información Incluida:**
- Ingresos totales
- Ingresos por servicio
- Tickets promedio
- Comparativa período anterior

### 11.5.4 Exportar Reporte

**Formatos disponibles:**
- PDF: Presentación formal con diseño profesional
- Excel: Datos tabulados para análisis
- CSV: Importación a otros sistemas

**Pasos:**
1. Abrir reporte generado
2. Click en "Exportar"
3. Seleccionar formato
4. Confirmar descarga

---

## 11.6 Dashboard Según Rol

### 11.6.1 ADMIN Dashboard

**Widgets Disponibles:**
- 📊 Total de usuarios por rol
- 🐾 Total de mascotas registradas
- 📅 Citas del mes actual
- 👨‍⚕️ Veterinarios activos
- 💰 Ingresos del mes
- ⚠️ Alertas del sistema

**Gráficos:**
- Citas completadas vs canceladas
- Distribución de mascotas por especie
- Ingresos por veterinaria

### 11.6.2 VETERINARIO Dashboard

**Widgets Disponibles:**
- 📋 Citas de hoy
- 👥 Total de pacientes atendidos
- 📈 Historias clínicas del mes
- 💊 Medicamentos más prescritos
- ⭐ Calificación de pacientes

**Acciones Rápidas:**
- Ver citas del día
- Crear nueva historia clínica
- Buscar mascota por propietario
- Generar PDF de historia clínica

### 11.6.3 RECEPCIONISTA Dashboard

**Widgets Disponibles:**
- 📅 Citas hoy
- ⏰ Próximas citas (próximas 24h)
- 👥 Clientes nuevos del mes
- ✅ Citas confirmadas hoy
- ❌ Cancelaciones mensuales

**Acciones Rápidas:**
- Programar nueva cita
- Confirmar asistencia
- Buscar cliente
- Ver disponibilidad de veterinarios

### 11.6.4 CLIENTE Dashboard

**Widgets Disponibles:**
- 🐾 Mis mascotas
- 📅 Mis citas (próximas)
- 📋 Histórico de citas
- 💊 Últimas consultas
- 🔔 Recordatorios

**Acciones:**
- Ver detalles de mis mascotas
- Descargar reportes médicos
- Ver próximas citas
- Contactar veterinaria

---

# **PROCEDIMIENTOS DE MANTENIMIENTO**

## 12.1 Backup y Recuperación

### 12.1.1 Estrategia de Backup

**Frecuencia Recomendada:**
- **Diario:** Base de datos
- **Semanal:** Código y configuración
- **Mensual:** Backup completo del sistema

### 12.1.2 Backup Manual de Base de Datos

**Windows:**
```batch
@echo off
set MYSQL_BIN=C:\xampp\mysql\bin
set BACKUP_DIR=C:\backups
set DB_NAME=veterinaria
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%

%MYSQL_BIN%\mysqldump -u root %DB_NAME% > %BACKUP_DIR%\backup_%DATE%.sql

echo Backup completado a: %BACKUP_DIR%\backup_%DATE%.sql
```

**Linux/Mac:**
```bash
#!/bin/bash
BACKUP_DIR="/home/usuario/backups"
DB_NAME="veterinaria"
DATE=$(date +%Y%m%d_%H%M%S)

mysqldump -u root -p veterinaria > $BACKUP_DIR/backup_$DATE.sql

echo "Backup completado: $BACKUP_DIR/backup_$DATE.sql"
```

### 12.1.3 Restauración desde Backup

**Paso 1: Verificar integridad del backup**
```bash
# Verificar que el archivo SQL es válido
mysql -u root -p veterinaria < backup_20260211_143022.sql
```

**Paso 2: Restaurar en BD diferente (verificación)**
```sql
CREATE DATABASE veterinaria_backup;
USE veterinaria_backup;
SOURCE backup_20260211_143022.sql;

-- Verificar datos
SELECT COUNT(*) FROM usuarios;
SELECT COUNT(*) FROM mascotas;
```

**Paso 3: Si verificación es OK, restaurar en BD principal**
```sql
-- Respaldar datos actuales
mysqldump -u root -p veterinaria > backup_before_restore.sql

-- Restaurar
USE veterinaria;
SOURCE backup_20260211_143022.sql;
```

### 12.1.4 Automatizar Backups (Windows Task Scheduler)

**Crear archivo backup.bat:**
```batch
@echo off
REM Configuración
set XAMPP_DIR=C:\xampp
set BACKUP_DIR=C:\backups\veterinaria
set DB_NAME=veterinaria
set DATE=%date:~-4,4%%date:~-10,2%%date:~-7,2%_%time:~0,2%%time:~3,2%
set BACKUP_FILE=%BACKUP_DIR%\backup_%DATE%.sql

REM Crear directorio si no existe
if not exist %BACKUP_DIR% mkdir %BACKUP_DIR%

REM Realizar backup
%XAMPP_DIR%\mysql\bin\mysqldump -u root %DB_NAME% > %BACKUP_FILE%

REM Verificar éxito
if %ERRORLEVEL% EQU 0 (
    echo Backup exitoso: %BACKUP_FILE% >> %BACKUP_DIR%\log.txt
    REM Limpiar backups anteriores a 30 días
    forfiles /S /D +30 /P %BACKUP_DIR% /M *.sql /C "cmd /c del @path"
) else (
    echo Error en backup >> %BACKUP_DIR%\log.txt
)

REM Enviar email (opcional - requiere configuración SMTP)
REM powershell -Command "..."
```

**Programar en Task Scheduler de Windows:**
1. Abrir "Programador de tareas"
2. "Crear tarea básica"
3. Nombre: "Backup Veterinaria"
4. Desencadenador: Diariamente a las 2:00 AM
5. Acción: Ejecutar backup.bat
6. Condiciones: Solo si está plugeado

---

## 12.2 Monitoreo del Sistema

### 12.2.1 Métricas Importantes

**Base de Datos:**
```sql
-- Tamaño de la base de datos
SELECT 
    ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'veterinaria';

-- Tabla más grande
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb
FROM information_schema.tables
WHERE table_schema = 'veterinaria'
ORDER BY (data_length + index_length) DESC;

-- Número de registros por tabla
SELECT 
    table_name,
    table_rows
FROM information_schema.tables
WHERE table_schema = 'veterinaria'
ORDER BY table_rows DESC;
```

**Backend (Spring Boot):**
```
GET http://localhost:8080/actuator/health
GET http://localhost:8080/actuator/metrics
```

### 12.2.2 Logs del Sistema

**Backend logs:**
```
Ubicación: {PROJECT_DIR}/backend/logs/

Niveles de log:
- DEBUG: Información detallada para desarrollo
- INFO: Eventos normales del sistema
- WARN: Posibles problemas
- ERROR: Errores que requieren atención
```

**Configurar nivel de logs:**
```properties
# application.properties
logging.level.com.veterinaria.veterinaria=DEBUG
logging.level.org.springframework.web=INFO
logging.level.org.hibernate.SQL=DEBUG

logging.file.name=logs/veterinaria.log
logging.file.max-size=10MB
logging.file.max-history=30
```

### 12.2.3 Monitoreo de Rendimiento

```java
// Spring Boot Actuator (agregar dependencia)
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

**Endpoints de monitoreo:**
```
http://localhost:8080/actuator/health      # Health check
http://localhost:8080/actuator/metrics     # Todas las métricas
http://localhost:8080/actuator/prometheus  # Formato Prometheus
http://localhost:8080/actuator/threaddump  # Dump de threads
http://localhost:8080/actuator/heapdump    # Dump de memoria
```

---

## 12.3 Actualización del Sistema

### 12.3.1 Procedimiento de Actualización de Dependencias

**Paso 1: Backup completo**
```bash
git stash  # Guardar cambios locales
git push   # Empujar cambios a repo
mysqldump -u root veterinaria > backup_pre_update.sql
```

**Paso 2: Actualizar dependencias Backend**
```bash
cd backend
mvn versions:display-dependency-updates
mvn versions:update-properties
mvn clean install
```

**Paso 3: Actualizar dependencias Frontend**
```bash
cd frontend
npm outdated  # Ver actualizaciones disponibles
npm update    # Actualizar todas
npm install   # Reinstalar con nuevas versiones
npm run build # Compilar para verificar
```

**Paso 4: Testing**
```bash
# Backend
mvn test

# Frontend
npm test

# Manual testing en desarrollo
```

**Paso 5: Deploy**
```bash
git commit -m "Update dependencies"
git push
# Desplegar en producción
```

### 12.3.2 Actualización de Base de Datos

**Si hay cambios de schema:**

```bash
# Crear script de migración
git show origin/main:DATABASE_DDL.sql > DATABASE_DDL_NEW.sql

# Generar diferencias
diff DATABASE_DDL.sql DATABASE_DDL_NEW.sql > migration.sql

# Aplicar cambios (con backup previo)
mysql -u root veterinaria < migration.sql

# Verificar
mysql -u root veterinaria -e "SHOW TABLES;"
```

---

## 12.4 Optimización de Base de Datos

### 12.4.1 Análisis de Índices

```sql
-- Mostrar índices
SELECT * FROM information_schema.STATISTICS 
WHERE TABLE_SCHEMA = 'veterinaria';

-- Índices no utilizados
SELECT * FROM performance_schema.table_io_waits_summary_global_by_index_usage
WHERE OBJECT_SCHEMA = 'veterinaria'
AND COUNT_READ = 0;

-- Agregar índices faltantes
ALTER TABLE usuarios ADD INDEX idx_documento (documento);
ALTER TABLE mascotas ADD INDEX idx_propietario (propietario_documento);
ALTER TABLE citas ADD INDEX idx_fecha (fecha_hora);
ALTER TABLE citas ADD INDEX idx_estado (estado);
```

### 12.4.2 Mantenimiento Regular

```sql
-- Analizar tablas para estadísticas
ANALYZE TABLE usuarios;
ANALYZE TABLE mascotas;
ANALYZE TABLE citas;

-- Optimizar tablas
OPTIMIZE TABLE usuarios;
OPTIMIZE TABLE mascotas;
OPTIMIZE TABLE citas;

-- Verificar integridad
CHECK TABLE usuarios;
CHECK TABLE mascotas;
CHECK TABLE citas;

-- Reparar tablas (si es necesario)
REPAIR TABLE usuarios;
```

### 12.4.3 Limpiar Datos Antiguos

```sql
-- Eliminar citas cancela​das hace más de 6 meses
DELETE FROM citas 
WHERE estado = 'CANCELADA' 
AND fecha_creacion < DATE_SUB(NOW(), INTERVAL 6 MONTH);

-- Archivar historias clínicas antiguas (opcional)
INSERT INTO historias_clinicas_archive 
SELECT * FROM historias_clinicas 
WHERE fecha_consulta < DATE_SUB(NOW(), INTERVAL 1 YEAR);

DELETE FROM historias_clinicas 
WHERE fecha_consulta < DATE_SUB(NOW(), INTERVAL 1 YEAR);
```

---

# **TROUBLESHOOTING Y RESOLUCIÓN DE PROBLEMAS**

## 13.1 Problemas Comunes del Backend

### Problema: "Port 8080 already in use"

**Causa:** Otra aplicación usa el puerto 8080

**Solución 1: Cambiar puerto**
```properties
# application.properties
server.port=8081
```

**Solución 2: Liberar puerto**
```bash
# Windows - Encontrar proceso en puerto 8080
netstat -ano | findstr :8080
# Terminar proceso
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :8080
kill -9 <PID>
```

---

### Problema: "Connection refused" a base de datos

**Síntoma:** `java.sql.SQLException: Connection refused`

**Verificaciones:**
```bash
# 1. ¿MySQL está ejecutándose?
mysql -u root -p -e "SELECT 1;"

# 2. ¿Credenciales correctas?
# Revisar application.properties:
# spring.datasource.url=jdbc:mysql://localhost:3306/veterinaria
# spring.datasource.username=root
# spring.datasource.password=

# 3. ¿Base de datos existe?
mysql -u root -p -e "SHOW DATABASES;"

# 4. ¿Puerto correcto?
mysql -u root -p -P 3306 -e "SELECT 1;"
```

**Solución:**
```properties
# Verificar y corregir application.properties
spring.datasource.url=jdbc:mysql://localhost:3306/veterinaria?allowPublicKeyRetrieval=true&useSSL=false
spring.datasource.username=root
spring.datasource.password=contraseña_correcta
```

---

### Problema: "JWT token expired"

**Síntoma:** Login OK pero después error 401 en APIs

**Causa:** Token JWT expiró (por defecto 7 días)

**Solución:**
```java
// Opción 1: Aumentar expiración
// application.properties
app.jwtExpirationInMs=1209600000  // 14 días

// Opción 2: Implementar refresh token
// Agregar endpoint POST /api/auth/refresh-token
```

---

### Problema: "CORS error" en navegador

**Síntoma:** `Access to XMLHttpRequest blocked by CORS`

**Causa:** Frontend no en lista de orígenes permitidos

**Solución:**
```properties
# application.properties - Agregar origen
app.cors.allowed-origins=http://localhost:3000,http://localhost:3001,http://nuevaURL.com
```

---

### Problema: "Hibernate: Unknown entity"

**Síntoma:** `MappingException: Unknown entity`

**Causa:** Entidad no registrada en Spring

**Solución:**
```java
// En application.properties, asegurar que el escaneo de componentes funciona
// O especificar en @SpringBootApplication
@SpringBootApplication(scanBasePackages = "com.veterinaria.veterinaria")
```

---

## 13.2 Problemas Comunes del Frontend

### Problema: "Blank page" o white screen

**Causa:** Error de JavaScript sin capturar

**Debugging:**
```bash
# 1. Abrir DevTools (F12)
# 2. Ver pestaña "Console" para errores
# 3. Ver pestaña "Network" para peticiones fallidas

# En terminal de desarrollo
npm start  # Ver mensajes de compilación
```

**Soluciones comunes:**
```bash
# Limpiar cache y reinstalar
rm -rf node_modules package-lock.json
npm install
npm start

# Revisar versiones
npm list react
npm list react-router-dom
```

---

### Problema: "Cannot find module" errores

**Síntoma:** `Module not found: Can't resolve...`

**Solución:**
```bash
# Reinstalar dependencias
npm install

# Verificar que existen los archivos
# src/components/NombreComponente.tsx debe existir

# Revisar path relativo
// ❌ import Home from './page/Home'  // Mal, directorio incorrecto
// ✅ import Home from './pages/Home'  // Bien
```

---

### Problema: "API call fails" pero Backend funciona

**Síntoma:** Network error en call a localhost:8080

**Debugging:**
```typescript
// Agregar logs
console.log('Llamando a:', apiClient.defaults.baseURL);
console.log('Token:', localStorage.getItem('token'));

// Verificar CORS en response
// En DevTools > Network > Seleccionar request > Headers
// Buscar: Access-Control-Allow-Origin
```

**Soluciones:**
```bash
# 1. Verificar que Backend está corriendo
curl http://localhost:8080/health

# 2. Verificar token en localStorage
# En DevTools > Application > Local Storage

# 3. Revisar CORS config
# Ver sección Autenticación > CORS
```

---

## 13.3 Problemas Comunes de Seguridad

### Problema: "401 Unauthorized" en endpoint protegido

**Causa:** Token no válido o expirado

**Debugging:**
```typescript
// En DevTools Console
const token = localStorage.getItem('token');
console.log(token);

// Decodificar JWT (en https://jwt.io)
{
  "sub": "12345678",
  "exp": 1707567890,  // ← Verificar expiración
  ...
}
```

**Soluciones:**
1. Login nuevamente
2. Aumentar expiración de JWT
3. Implementar Auto-refresh de token

---

### Problema: "403 Forbidden" aunque estoy autenticado

**Causa:** Rol del usuario no tiene permiso

**Debugging:**
```typescript
// Verificar rol
const rol = localStorage.getItem('userRole');
console.log('Mi rol:', rol);

// Verificar permisos en @PreAuthorize
// Backend: @PreAuthorize("hasRole('ADMIN')")
// Frontend: requiredRoles={['ROLE_ADMIN']}
```

---

## 13.4 Problemas de Rendimiento

### Lenitud en carga de datos

**Problema:** Página tarda mucho en cargar listas grandes

**Soluciones:**

1. **Implementar Paginación:**
```java
// Backend
@GetMapping("/mascotas")
public ResponseEntity<?> obtenerMascotas(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size
) {
    return ResponseEntity.ok(mascotaService.obtener(page, size));
}

// Frontend
const [page, setPage] = useState(0);
const [mascotas, setMascotas] = useState([]);

useEffect(() => {
    mascotaService.obtenerMascotas(page, 20).then(res => {
        setMascotas(res.data.content);
    });
}, [page]);
```

2. **Agregar Índices SQL:**
```sql
ALTER TABLE citas ADD INDEX idx_veterinario (veterinario_documento);
ALTER TABLE citas ADD INDEX idx_cliente (cliente_documento);
ALTER TABLE mascotas ADD INDEX idx_propietario (propietario_documento);
```

3. **Lazy Loading en Frontend:**
```typescript
const MascotaLazy = React.lazy(() => import('./Mascota'));

// En componente
<Suspense fallback={<div>Cargando...</div>}>
  <MascotaLazy />
</Suspense>
```

---

## 13.5 Errores de Validación

### Validación fallida en formulario

**Síntoma:** Error 400 Bad Request

**Debug response:**
```json
{
  "timestamp": "2026-02-11T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "errors": {
    "email": "Email debe ser válido",
    "password": "Mínimo 8 caracteres"
  }
}
```

**Solución - Agregar validaciones DTO:**
```java
@Data
public class UsuarioDTO {
    @NotBlank(message = "Documento requerido")
    private String documento;
    
    @Email(message = "Email debe ser válido")
    private String email;
    
    @Size(min = 8, max = 50, message = "Contraseña: 8 a 50 caracteres")
    private String password;
}
```

---

## 13.6 Logs para Debugging

### Ubicación de Logs

**Backend:**
```
{PROJECT}/backend/logs/veterinaria.log
{PROJECT}/backend/target/logs/application.log
```

**Frontend:**
```
DevTools > Console (F12)
Browser DevTools > Sources para breakpoints
```

### Ver Logs en Tiempo Real

```bash
# Backend
tail -f backend/logs/veterinaria.log

# Con filtro
grep "ERROR" backend/logs/veterinaria.log | tail -20

# Frontend
npm start  # Ya muestra logs en consola
```

---

# **APÉNDICES**

## 14.1 Glosario de Términos

| Término | Significado |
|---------|-------------|
| **RBAC** | Role-Based Access Control - Control de acceso basado en roles |
| **JWT** | JSON Web Token - Token de autenticación sin estado |
| **ORM** | Object Relational Mapping - MapeoAutomático Objetos ↔ BD |
| **DTO** | Data Transfer Object - Objeto para transferencia de datos |
| **REST** | Representational State Transfer - Arquitectura de API |
| **CRUD** | Create, Read, Update, Delete - Operaciones básicas |
| **CORS** | Cross-Origin Resource Sharing - Compartir recursos entre dominios |
| **BCrypt** | Algoritmo de hash seguro para contraseñas |
| **Middleware** | Software intermedio entre cliente y servidor |
| **Entidad** | Clase que mapea una tabla de la BD con JPA |
| **Repositorio** | Interfaz para acceder a datos de la BD |
| **Controlador** | Clase que maneja peticiones HTTP |
| **Servicio** | Clase con lógica de negocio |

---

## 14.2 Acrónimos Utilizados

| Acrónimo | Significado |
|----------|------------|
| **API** | Application Programming Interface |
| **BD/DB** | Base de Datos |
| **HTTP** | HyperText Transfer Protocol |
| **HTTPS** | HTTP Secure |
| **JSON** | JavaScript Object Notation |
| **SQL** | Structured Query Language |
| **XML** | Extensible Markup Language |
| **SSL** | Secure Sockets Layer |
| **TLS** | Transport Layer Security |
| **UTC** | Coordinated Universal Time |
| **PDT** | Portable Document Format |
| **CSV** | Comma-Separated Values |
| **SMS** | Short Message Service |
| **URL** | Uniform Resource Locator |
| **UI** | User Interface |
| **UX** | User Experience |

---

## 14.3 Referencias Externas Útiles

### Documentación Oficial

- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Spring Security](https://spring.io/projects/spring-security)
- [React Documentation](https://react.dev)
- [MySQL Documentation](https://dev.mysql.com/doc/)
- [JWT.io](https://jwt.io)
- [iText PDF Generator](https://itextpdf.com/)

### Tutoriales Recomendados

- Spring Boot REST API: https://spring.io/guides/gs/rest-service/
- React Hooks: https://react.dev/reference/react/hooks
- MySQL Optimization: https://dev.mysql.com/doc/refman/8.0/en/optimization.html
- JWT Authentication: https://tools.ietf.org/html/rfc7519

### Herramientas Útiles

- **Postman:** https://postman.com - Testing de APIs
- **JWT.io:** https://jwt.io - Decodificar tokens
- **DevTools:** F12 en navegador - Debugging
- **HeidiSQL:** https://heidisql.com - Cliente MySQL GUI
- **Visual Studio Code:** https://code.visualstudio.com - IDE

---

## 14.4 Contacto y Soporte

**Para reportar problemas o sugerencias:**

```
Equipo Técnico
Institución: SENA
Correo: desarrollo@veterinaria-pet.com
  
Horario de Soporte:
- Lunes a Viernes: 8:00 AM - 5:00 PM
- Para emergencias: Contactar administrador
```

---

## 14.5 Historial de Cambios

| Versión | Fecha | Cambios |
|---------|-------|---------|
| **2.0** | 2026-02-11 | Manual técnico completo, API documentada, guías de operación |
| **1.5** | 2026-01-30 | Agregar endpoints de reportes, mejoras en seguridad |
| **1.0** | 2025-12-01 | Versión inicial del sistema |

---

## 14.6 Notas de Desarrollo

### TODOs Futuro

- [ ] Implementar 2FA (Two Factor Authentication)
- [ ] WhatsApp integration para recordatorios
- [ ] Sistema de chat en tiempo real
- [ ] Análisis predictivo con Machine Learning
- [ ] App nativa en iOS/Android
- [ ] Dashboard en tiempo real con WebSockets
- [ ] Integración con laboratorios externos

### Consideraciones Técnicas

- ⚠️ En producción, cambiar jwtSecret a valores seguro
- ⚠️ Configurar HTTPS con certificados válidos
- ⚠️ Establecer política de backup automático
- ⚠️ Monitorear logs regularmente
- ⚠️ Realizar testing de carga antes de producción

---

**FIN DEL DOCUMENTO**

---

*Documento confidencial - Sistema de Gestión Veterinaria PET*  
*Última actualización: 11 de febrero de 2026*  
*Versión: 2.0*


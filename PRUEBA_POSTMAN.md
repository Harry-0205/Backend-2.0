# 🧪 GUÍA COMPLETA DE PRUEBAS POSTMAN - Sistema Veterinaria PET

> **📅 Fecha:** 3 de diciembre de 2025  
> **🎯 Propósito:** Guía paso a paso para probar todas las funcionalidades del sistema  
> **🔧 Herramienta:** Postman con colecciones preconfiguradas  
> **🔄 Última Actualización:** Sistema con documento como PK y creado_por_documento

---

## 📋 **ÍNDICE**
1. [Configuración Inicial](#configuración-inicial)
2. [Importar Colecciones](#importar-colecciones)  
3. [Configurar Variables](#configurar-variables)
4. [Pruebas de Autenticación](#pruebas-de-autenticación)
5. [Pruebas por Rol](#pruebas-por-rol)

   - 5.1 [Administrador (11 pruebas)](#1-administrador)
   - 5.2 [Veterinario (14 pruebas)](#2-veterinario)
   - 5.3 [Recepcionista (10 pruebas)](#3-recepcionista)
   - 5.4 [Cliente (6 pruebas)](#4-cliente)
6. [Pruebas Específicas con Documento como PK](#-pruebas-específicas-con-documento-como-pk)
   - 6.1 [Creación de Veterinaria por Admin](#escenario-1-creación-de-veterinaria-por-admin)
   - 6.2 [Veterinario Accede a Clientes Atendidos](#escenario-2-veterinario-accede-a-clientes-atendidos)
   - 6.3 [Cliente Gestiona Sus Mascotas](#escenario-3-cliente-gestiona-sus-mascotas)
   - 6.4 [Relaciones Basadas en Documento](#escenario-4-relaciones-basadas-en-documento)
   - 6.5 [Filtros por Documento](#escenario-5-filtros-por-documento)
7. [Casos de Prueba Específicos](#-casos-de-prueba-específicos)
8. [Validación de Errores (15 pruebas)](#-validación-de-errores)
9. [Pruebas de Funcionalidad PDF (7 pruebas)](#-pruebas-de-funcionalidad-pdf)
10. [Validación de Respuestas](#-validación-de-respuestas)
11. [Checklist de Pruebas Completas](#-checklist-de-pruebas-completas)
12. [Scripts de Validación Postman](#-scripts-de-validación-postman)
13. [Mejores Prácticas](#-mejores-prácticas)
14. [Resumen de Pruebas por Rol](#-resumen-de-pruebas-por-rol)
15. [Recursos Adicionales](#-recursos-adicionales)


---

## ⚙️ **CONFIGURACIÓN INICIAL**

### **1. Requisitos Previos**
- ✅ Postman instalado (versión 10.x o superior)
- ✅ Backend ejecutándose en `http://localhost:8080`
- ✅ Base de datos `veterinaria_db` configurada con `dataBasePet.sql`
- ✅ Datos de prueba cargados correctamente

### **2. Verificar Estado del Backend**
Antes de comenzar, verificar que el backend esté funcionando:

**Endpoint de Health Check:**
```
GET http://localhost:8080/api/health
```

**Respuesta Esperada:**
```json
{
  "status": "UP",
  "timestamp": "2025-10-27T20:30:00.000Z",
  "sistema": "Sistema Veterinaria PET",
  "version": "1.0.0"
}
```

---

## 📦 **IMPORTAR COLECCIONES**

### **Archivos de Postman Disponibles:**
1. `Veterinaria_API_Collection_Updated.json` - Colección principal con todos los endpoints
2. `Veterinaria_Environment.postman_environment.json` - Variables de entorno

### **Pasos para Importar:**

#### **1. Importar Colección**
1. Abrir Postman
2. Clic en **"Import"** (botón superior izquierdo)
3. Seleccionar **"File"** 
4. Navegar a `c:\xampp\htdocs\pet\Veterinaria_API_Collection_Updated.json`
5. Clic en **"Import"**

#### **2. Importar Environment**
1. Clic en **"Import"** nuevamente
2. Seleccionar **"File"**
3. Navegar a `c:\xampp\htdocs\pet\Veterinaria_Environment.postman_environment.json`
4. Clic en **"Import"**

#### **3. Activar Environment**
1. En la esquina superior derecha, seleccionar **"Veterinaria Environment"**
2. Verificar que aparezca activo (marcado en verde)

---

## 🔧 **CONFIGURAR VARIABLES**

### **Variables Predefinidas en Environment:**
```
base_url: http://localhost:8080/api
jwt_token: (se actualiza automáticamente tras login)
admin_token: (token del administrador)
vet_token: (token del veterinario)
client_token: (token del cliente)
recep_token: (token del recepcionista)

# Datos de Usuarios (Contraseña: admin123)
admin_username: admin
admin_password: admin123
veterinario_username: dr.garcia
veterinario_password: admin123
cliente_username: cliente1
cliente_password: admin123
recepcionista_username: recepcion1
recepcionista_password: admin123

# IDs de Prueba (basados en DATABASE_DML.sql)
veterinaria_id: 1
mascota_id: 1
cita_id: 1
historia_id: 1

# Documentos de Usuarios (PK = documento)
admin_documento: 12345678
vet_documento: 87654321
cliente_documento: 33333333
cliente2_documento: 44444444
cliente3_documento: 55555555
recep_documento: 22222222
```

### **Verificar Variables:**
1. Clic en el ícono **"Environments"** (ojo) en la esquina superior derecha
2. Seleccionar **"Veterinaria Environment"**
3. Verificar que todas las variables tengan valores asignados

---

## 🔐 **PRUEBAS DE AUTENTICACIÓN**

### **PASO 1: Login como Administrador**

#### **Request:**
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "{{admin_username}}",
    "password": "{{admin_password}}"
}
```

#### **Respuesta Esperada:**
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "username": "admin",
    "documento": "12345678",
    "email": "admin@veterinaria.com",
    "roles": ["ROLE_ADMIN"]
}
```

#### **Validaciones:**
- ✅ Status Code: `200 OK`
- ✅ Token JWT presente y válido
- ✅ Rol correcto: `ROLE_ADMIN`
- ✅ Variable `jwt_token` actualizada automáticamente

#### **Script de Post-Response (automático):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.token);
    pm.environment.set("admin_token", response.token);
    console.log("✅ Admin login exitoso - Token guardado");
} else {
    console.log("❌ Error en login admin:", pm.response.text());
}
```

### **PASO 2: Login como Veterinario**

#### **Request:**
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "{{veterinario_username}}",
    "password": "{{veterinario_password}}"
}
```

#### **Validaciones:**
- ✅ Status Code: `200 OK`
- ✅ Rol correcto: `ROLE_VETERINARIO`
- ✅ Variable `vet_token` actualizada

### **PASO 3: Login como Cliente**

#### **Request:**
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "{{cliente_username}}",
    "password": "{{cliente_password}}"
}
```

#### **Validaciones:**
- ✅ Status Code: `200 OK`
- ✅ Rol correcto: `ROLE_CLIENTE`
- ✅ Variable `client_token` actualizada

### **PASO 4: Login como Recepcionista**

#### **Request:**
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "{{recepcionista_username}}",
    "password": "{{recepcionista_password}}"
}
```

#### **Validaciones:**
- ✅ Status Code: `200 OK`
- ✅ Rol correcto: `ROLE_RECEPCIONISTA`
- ✅ Variable `recep_token` actualizada

#### **Script de Post-Response (automático):**
```javascript
if (pm.response.code === 200) {
    const response = pm.response.json();
    pm.environment.set("jwt_token", response.token);
    pm.environment.set("recep_token", response.token);
    console.log("✅ Recepcionista login exitoso - Token guardado");
} else {
    console.log("❌ Error en login recepcionista:", pm.response.text());
}
```

---

## 👥 **PRUEBAS POR ROL**

> **⚠️ IMPORTANTE - RESTRICCIONES POR ROL:**  
> 
> **VETERINARIO:**
> - ✅ **Pueden ver:** Solo clientes que han atendido (tienen citas programadas)
> - ✅ **Pueden consultar:** Su propio perfil
> - ❌ **NO pueden ver:** Administradores, recepcionistas u otros veterinarios
> - ❌ **NO pueden ver:** Clientes que no han atendido
> - ✅ **Endpoint `/usuarios/rol/CLIENTE`:** Solo retorna sus clientes atendidos
> - ❌ **Endpoint `/usuarios/rol/{OTRO_ROL}`:** Acceso denegado (403)
> - ✅ **Veterinarias:** Solo la veterinaria donde trabajan
>
> **RECEPCIONISTA:**
> - ✅ **Pueden ver:** Todos los usuarios de su veterinaria
> - ✅ **Pueden gestionar:** Mascotas, citas, clientes de su veterinaria
> - ✅ **Pueden crear:** Clientes, veterinarios para su veterinaria
> - ❌ **NO pueden:** Crear o modificar veterinarias
> - ❌ **NO pueden:** Ver datos de otras veterinarias
> - ✅ **Veterinarias:** Solo la veterinaria donde trabajan
>
> **RESTRICCIONES DE VETERINARIAS (VETERINARIO Y RECEPCIONISTA):**
> - ✅ **Pueden ver:** Solo la veterinaria donde trabajan
> - ❌ **NO pueden ver:** Otras veterinarias del sistema
> - ✅ **Endpoint `/veterinarias`:** Solo retorna su veterinaria asignada
> - ❌ **Endpoint `/veterinarias/{id}`:** Solo puede ver su veterinaria (403 para otras)

### **🔴 ADMINISTRADOR - Acceso Total**

#### **1. Ver Todas las Veterinarias (Filtradas por Creador)**
```
GET {{base_url}}/veterinarias
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Solo muestra veterinarias creadas por este admin (`creado_por_documento = 12345678`)
- ✅ Cada veterinaria incluye datos completos

**Nota:** El admin solo ve las veterinarias que él creó (campo `creado_por_documento`)

#### **2. Crear Nueva Veterinaria**
```
POST {{base_url}}/veterinarias
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "nombre": "Veterinaria Test Postman",
    "direccion": "Calle de Prueba 123",
    "telefono": "+57 300 1234567",
    "email": "test@veterinaria.com",
    "ciudad": "Bogotá",
    "descripcion": "Veterinaria de prueba creada desde Postman",
    "servicios": "Consulta general, Vacunación, Emergencias",
    "horarioAtencion": "Lunes a Viernes: 8:00 AM - 6:00 PM",
    "activo": true
}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Veterinaria creada exitosamente
- ✅ Campo `creado_por_documento` se asigna automáticamente al admin
- ✅ Respuesta incluye el ID de la nueva veterinaria

#### **3. Actualizar Veterinaria**
```
PUT {{base_url}}/veterinarias/{{veterinaria_id}}
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "nombre": "Veterinaria Pet Care Actualizada",
    "direccion": "Nueva Dirección 456",
    "telefono": "+57 1 234-5678",
    "email": "info@petcare.com",
    "ciudad": "Bogotá",
    "descripcion": "Clínica veterinaria actualizada",
    "servicios": "Consulta general, Vacunación, Cirugía, Grooming",
    "horarioAtencion": "Lunes a Sábado: 9:00 AM - 7:00 PM",
    "activo": true
}
```

#### **4. Gestión de Usuarios**
```
GET {{base_url}}/usuarios
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Lista completa de usuarios (9 usuarios: 1 admin, 3 veterinarios, 4 clientes, 1 recepcionista)
- ✅ Cada usuario incluye: documento, username, nombres, apellidos, email, roles

#### **5. Crear Nuevo Usuario**
```
POST {{base_url}}/usuarios
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "documento": "88888888",
    "tipoDocumento": "CC",
    "username": "nuevo_cliente",
    "password": "admin123",
    "nombres": "Nuevo",
    "apellidos": "Cliente Test",
    "email": "nuevo@test.com",
    "telefono": "3001234567",
    "direccion": "Dirección de prueba",
    "fechaNacimiento": "1990-01-01",
    "activo": true,
    "veterinariaId": 1,
    "roles": [3]

```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Usuario creado con documento como PK
- ✅ Rol CLIENTE asignado correctamente

#### **6. Todas las Mascotas**
```
GET {{base_url}}/mascotas
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Lista de todas las mascotas (9 mascotas)
- ✅ Campo `propietarioDocumento` identifica al dueño

#### **7. Todas las Citas**
```
GET {{base_url}}/citas
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Lista completa de citas (12 citas: 4 completadas, 8 programadas)
- ✅ Campos `clienteDocumento` y `veterinarioDocumento` muestran relaciones

#### **8. Reportes y Estadísticas**
```
GET {{base_url}}/reportes
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Lista de reportes generados
- ✅ Campo `generadoPor` muestra documento del generador

#### **9. Ver Usuario por Documento**
```
GET {{base_url}}/usuarios/{{admin_documento}}
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Datos completos del usuario admin
- ✅ Incluye veterinaria asignada

#### **10. Buscar Usuarios por Rol**
```
GET {{base_url}}/usuarios/rol/ROLE_CLIENTE
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Solo muestra usuarios con rol CLIENTE (4 clientes)

#### **11. Activar/Desactivar Veterinaria**
```
PUT {{base_url}}/veterinarias/{{veterinaria_id}}/desactivar
Authorization: Bearer {{admin_token}}
```

```
PUT {{base_url}}/veterinarias/{{veterinaria_id}}/activar
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Estado `activo` cambia correctamente

### **🟢 VETERINARIO - Gestión Médica**

#### **1. Ver Clientes Atendidos (Restringido)**
```
GET {{base_url}}/usuarios
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200 - Veterinario puede ver solo clientes que ha atendido
- ✅ NO puede ver administradores, recepcionistas u otros veterinarios
- ✅ Solo muestra clientes con citas previas con este veterinario

#### **2. Ver Mascotas (Permitido)**
```
GET {{base_url}}/mascotas
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Veterinario puede ver todas las mascotas

#### **3. Ver Citas Asignadas**
```
GET {{base_url}}/citas/veterinario/{{vet_documento}}
Authorization: Bearer {{vet_token}}
```

#### **4. Crear Historia Clínica**
```
POST {{base_url}}/historias-clinicas
Authorization: Bearer {{vet_token}}
Content-Type: application/json

{
    "fechaConsulta": "2025-12-03T10:00:00",
    "motivoConsulta": "Control de rutina - Prueba Postman",
    "sintomas": "Ninguno aparente",
    "diagnostico": "Paciente sano",
    "tratamiento": "Continuar con rutina normal",
    "medicamentos": "Ninguno",
    "peso": 25.8,
    "temperatura": 38.5,
    "frecuenciaCardiaca": 80,
    "frecuenciaRespiratoria": 20,
    "observaciones": "Excelente estado general",
    "recomendaciones": "Continuar con alimentación balanceada",
    "mascotaId": 1,
    "veterinarioDocumento": "{{vet_documento}}",
    "citaId": 1
}
```

**Validaciones:**
- ✅ Status 200 - Historia clínica creada
- ✅ `veterinarioDocumento` es el documento del veterinario autenticado
- ✅ Se asocia a una cita existente

#### **4. Ver Historias Clínicas**
```
GET {{base_url}}/historias-clinicas
Authorization: Bearer {{vet_token}}
```

#### **5. Ver Perfil de Cliente Atendido (Permitido)**
```
GET {{base_url}}/usuarios/{{cliente_documento}}
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede ver perfil del cliente si lo ha atendido
- ✅ El cliente debe tener al menos una cita con este veterinario

#### **6. Acceso Denegado a Cliente No Atendido**
```
GET {{base_url}}/usuarios/44444444
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - No puede ver cliente que no ha atendido

#### **7. Acceso Denegado a Consultar Todos los Usuarios**
```
GET {{base_url}}/usuarios/rol/ADMIN
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - Veterinario no puede consultar administradores

#### **8. Consultar Solo Clientes Atendidos por Rol**
```
GET {{base_url}}/usuarios/rol/CLIENTE
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede consultar clientes
- ✅ Solo muestra clientes que ha atendido personalmente

#### **9. Acceso Denegado a Gestión de Usuarios**
```
POST {{base_url}}/usuarios
Authorization: Bearer {{vet_token}}
Content-Type: application/json

{
    "documento": "99999999",
    "username": "nuevo_usuario",
    "password": "admin123",
    "nombres": "Nuevo",
    "apellidos": "Usuario",
    "email": "nuevo@test.com",
    "tipoDocumento": "CC",
    "telefono": "3001234567",
    "direccion": "Dirección de prueba",
    "fechaNacimiento": "1990-01-01",
    "activo": true,
    "veterinariaId": 1,
    "roles": [3]
}
```

**Validación:** ❌ Status 403 - Veterinario no puede crear usuarios

#### **10. Ver Su Veterinaria (Restringido)**
```
GET {{base_url}}/veterinarias
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200 - Veterinario puede ver su veterinaria
- ✅ Solo retorna la veterinaria donde trabaja (1 veterinaria)
- ✅ NO retorna otras veterinarias del sistema
- ✅ La veterinaria mostrada coincide con `veterinaria_id` del usuario

#### **11. Ver Veterinaria por ID (Su Veterinaria)**
```
GET {{base_url}}/veterinarias/1
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Puede ver su propia veterinaria (si `veterinaria_id = 1`)

#### **12. Acceso Denegado a Otra Veterinaria**
```
GET {{base_url}}/veterinarias/2
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - No puede ver otras veterinarias (si `veterinaria_id != 2`)

#### **13. Consultar Mascotas del Sistema**
```
GET {{base_url}}/mascotas
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200 - Veterinario puede ver todas las mascotas
- ✅ Campo `propietarioDocumento` identifica al dueño

#### **14. Ver Historial Clínico de Mascota**
```
GET {{base_url}}/historias-clinicas/mascota/{{mascota_id}}
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede ver historias clínicas
- ✅ Campo `veterinarioDocumento` identifica quien atendió

### **🟡 RECEPCIONISTA - Gestión Operativa**

> **⚠️ IMPORTANTE - PERMISOS DE RECEPCIONISTA:**  
> Los recepcionistas tienen permisos similares a los administradores pero limitados a su veterinaria:
> - ✅ **Pueden gestionar:** Usuarios, mascotas, citas de su veterinaria
> - ✅ **Pueden ver:** Solo datos de su veterinaria asignada
> - ✅ **Pueden crear:** Citas, mascotas, usuarios (clientes y veterinarios)
> - ✅ **Pueden consultar:** Historias clínicas de su veterinaria
> - ❌ **NO pueden:** Crear/modificar veterinarias
> - ❌ **NO pueden:** Ver datos de otras veterinarias
> - ❌ **NO pueden:** Acceder a reportes administrativos globales

#### **1. Ver Usuarios de Su Veterinaria**
```
GET {{base_url}}/usuarios
Authorization: Bearer {{recep_token}}
```

**Validaciones:**
- ✅ Status 200 - Recepcionista puede ver usuarios
- ✅ Solo muestra usuarios de su veterinaria (veterinariaId = 1)
- ✅ Incluye: clientes, veterinarios, otros recepcionistas de su veterinaria
- ❌ NO incluye usuarios de otras veterinarias

#### **2. Ver Todas las Mascotas de Su Veterinaria**
```
GET {{base_url}}/mascotas
Authorization: Bearer {{recep_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede ver mascotas
- ✅ Solo mascotas cuyos propietarios pertenecen a su veterinaria
- ✅ Útil para programar citas y gestión operativa

#### **3. Crear Nueva Mascota para Cliente**
```
POST {{base_url}}/mascotas
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "nombre": "Luna Recepción",
    "especie": "Gato",
    "raza": "Persa",
    "sexo": "Hembra",
    "fechaNacimiento": "2023-03-10",
    "peso": 4.2,
    "color": "Blanco",
    "observaciones": "Mascota registrada por recepción",
    "propietario": {
        "documento": "33333333"
    },
    "activo": true
}
```

**Validaciones:**
- ✅ Status 200 - Mascota creada exitosamente
- ✅ Propietario debe pertenecer a la misma veterinaria
- ✅ Registro completo desde recepción

#### **4. Ver Todas las Citas de Su Veterinaria**
```
GET {{base_url}}/citas
Authorization: Bearer {{recep_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede ver todas las citas
- ✅ Solo citas de su veterinaria
- ✅ Útil para gestión de agenda y coordinación

#### **5. Programar Nueva Cita**
```
POST {{base_url}}/citas
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "fechaHora": "2025-12-05T10:00:00",
    "motivo": "Consulta general - Programada por recepción",
    "observaciones": "Cliente solicitó veterinario específico",
    "estado": "PROGRAMADA",
    "clienteDocumento": "33333333",
    "mascotaId": 1,
    "veterinarioDocumento": "87654321",
    "veterinariaId": 1
}
```

**Validaciones:**
- ✅ Status 200 - Cita programada exitosamente
- ✅ Cliente, veterinario y mascota deben existir
- ✅ Veterinaria debe ser la asignada al recepcionista

#### **6. Actualizar Estado de Cita**
```
PUT {{base_url}}/citas/{{cita_id}}
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "estado": "CONFIRMADA"
}
```

**Validaciones:**
- ✅ Status 200 - Estado actualizado
- ✅ Estados válidos: PROGRAMADA, CONFIRMADA, COMPLETADA, CANCELADA
- ✅ Útil para seguimiento de agenda

#### **7. Ver Historias Clínicas de Su Veterinaria**
```
GET {{base_url}}/historias-clinicas
Authorization: Bearer {{recep_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede consultar historias clínicas
- ✅ Solo historias de mascotas de su veterinaria
- ✅ Acceso de solo lectura (no puede crearlas)

#### **8. Crear Nuevo Cliente**
```
POST {{base_url}}/usuarios
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "documento": "77777777",
    "tipoDocumento": "CC",
    "username": "cliente_recep",
    "password": "admin123",
    "nombres": "Carlos",
    "apellidos": "Nuevo Cliente",
    "email": "carlos.nuevo@email.com",
    "telefono": "3007777777",
    "direccion": "Dirección del cliente",
    "fechaNacimiento": "1992-05-15",
    "activo": true,
    "veterinariaId": 1,
    "roles": [3]
}
```

**Validaciones:**
- ✅ Status 200 - Cliente creado exitosamente
- ✅ Se asigna a la veterinaria del recepcionista
- ✅ Rol CLIENTE (ID: 3) asignado correctamente

#### **9. Ver Su Veterinaria**
```
GET {{base_url}}/veterinarias
Authorization: Bearer {{recep_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede ver su veterinaria
- ✅ Solo retorna la veterinaria donde trabaja
- ✅ NO puede ver otras veterinarias del sistema

#### **10. Buscar Clientes por Rol**
```
GET {{base_url}}/usuarios/rol/ROLE_CLIENTE
Authorization: Bearer {{recep_token}}
```

**Validaciones:**
- ✅ Status 200 - Lista de clientes obtenida
- ✅ Solo clientes de su veterinaria
- ✅ Útil para búsqueda rápida en recepción

#### **11. Acceso Denegado a Crear Veterinarias**
```
POST {{base_url}}/veterinarias
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "nombre": "Nueva Veterinaria Test",
    "direccion": "Test",
    "telefono": "3001234567",
    "email": "test@vet.com",
    "ciudad": "Bogotá",
    "activo": true
}
```

**Validación:** ❌ Status 403 - Recepcionista no puede crear veterinarias

#### **12. Acceso Denegado a Ver Otras Veterinarias**
```
GET {{base_url}}/veterinarias/2
Authorization: Bearer {{recep_token}}
```

**Validación:** ❌ Status 403 - Solo puede ver su propia veterinaria (si ID != su veterinaria)

### **🔵 CLIENTE - Datos Personales**

#### **1. Ver Sus Mascotas**
```
GET {{base_url}}/mascotas/propietario/{{cliente_documento}}
Authorization: Bearer {{client_token}}
```

**Validaciones:**
- ✅ Status 200 - Cliente ve sus mascotas
- ✅ Solo mascotas del cliente (Max y Bella)

#### **2. Ver Sus Citas**
```
GET {{base_url}}/citas/cliente/{{cliente_documento}}
Authorization: Bearer {{client_token}}
```

#### **3. Crear Nueva Mascota**

> **⚠️ IMPORTANTE - FORMATO DE PROPIETARIO:**  
> El backend espera recibir el propietario como un **objeto con el campo `documento`**, no como un string simple.  
> ✅ Formato correcto: `"propietario": {"documento": "33333333"}`  
> ❌ Formato incorrecto: `"propietarioDocumento": "33333333"`

```
POST {{base_url}}/mascotas
Authorization: Bearer {{client_token}}
Content-Type: application/json

{
    "nombre": "Firulais Test",
    "especie": "Perro",
    "raza": "Mestizo",
    "sexo": "Macho",
    "fechaNacimiento": "2023-05-15",
    "peso": 8.5,
    "color": "Marrón y blanco",
    "observaciones": "Mascota de prueba creada desde Postman",
    "propietario": {
        "documento": "33333333"
    },
    "activo": true
}
```

**Validaciones:**
- ✅ Status 200 - Mascota creada
- ✅ `propietarioDocumento` es el documento del cliente autenticado
- ✅ Se retorna el ID de la nueva mascota

#### **4. Programar Nueva Cita**
```
POST {{base_url}}/citas
Authorization: Bearer {{client_token}}
Content-Type: application/json

{
    "fechaHora": "2025-12-15T14:30:00",
    "motivo": "Vacunación anual - Cita de prueba Postman",
    "observaciones": "Primera vacuna del año",
    "estado": "PROGRAMADA",
    "clienteDocumento": "{{cliente_documento}}",
    "mascotaId": 1,
    "veterinarioDocumento": "{{vet_documento}}",
    "veterinariaId": 1
}
```

**Validaciones:**
- ✅ Status 200 - Cita creada
- ✅ `clienteDocumento` es el documento del cliente
- ✅ `veterinarioDocumento` es el documento del veterinario asignado
- ✅ Estado inicial: PROGRAMADA

#### **5. Ver Perfil Propio**
```
GET {{base_url}}/usuarios/{{cliente_documento}}
Authorization: Bearer {{client_token}}
```

**Validaciones:**
- ✅ Status 200 - Puede ver su propio perfil
- ✅ Incluye información completa del usuario

#### **6. Ver Historias Clínicas de Sus Mascotas**
```
GET {{base_url}}/historias-clinicas/propietario/{{cliente_documento}}
Authorization: Bearer {{client_token}}
```

**Validaciones:**
- ✅ Status 200 - Ve historias de sus mascotas
- ✅ Solo historias de mascotas con `propietarioDocumento = cliente_documento`

#### **5. Acceso Denegado a Todas las Mascotas**
```
GET {{base_url}}/mascotas
Authorization: Bearer {{client_token}}
```

**Validación:** ❌ Status 403 - Cliente no puede ver todas las mascotas

#### **6. Acceso Denegado a Datos de Otros Clientes**
```
GET {{base_url}}/mascotas/propietario/44444444
Authorization: Bearer {{client_token}}
```

**Validación:** ❌ Status 403 - Cliente no puede ver mascotas de otros

---

## 📋 **CREACIÓN DE HISTORIAS CLÍNICAS**

> **⚠️ IMPORTANTE - PERMISOS:**  
> - ✅ **Veterinarios:** Pueden crear historias clínicas para mascotas de sus pacientes
> - ✅ **Admins/Recepcionistas:** Pueden crear historias clínicas
> - ❌ **Clientes:** NO pueden crear historias clínicas (solo pueden verlas)

### **Formato de Historia Clínica:**

Las historias clínicas requieren los siguientes campos:

**Campos Obligatorios:**
- `fechaConsulta`: Fecha y hora de la consulta (formato: `"2025-12-03T10:00:00"`)
- `mascotaId`: ID de la mascota (número)
- `veterinarioDocumento`: Documento del veterinario que atiende (string)

**Campos Opcionales:**
- `motivoConsulta`: Razón de la consulta
- `sintomas`: Síntomas observados
- `diagnostico`: Diagnóstico del veterinario
- `tratamiento`: Tratamiento prescrito
- `medicamentos`: Medicamentos recetados
- `peso`: Peso de la mascota en kg (decimal)
- `temperatura`: Temperatura en °C (decimal)
- `frecuenciaCardiaca`: Frecuencia cardíaca (número entero)
- `frecuenciaRespiratoria`: Frecuencia respiratoria (número entero)
- `observaciones`: Observaciones adicionales
- `recomendaciones`: Recomendaciones para el propietario
- `citaId`: ID de la cita asociada (opcional)

---

### **Ejemplo 1: Veterinario Crea Historia Clínica Completa**

```
POST {{base_url}}/historias-clinicas
Authorization: Bearer {{vet_token}}
Content-Type: application/json

{
    "fechaConsulta": "2025-12-03T10:00:00",
    "motivoConsulta": "Control de rutina - Prueba Postman",
    "sintomas": "Ninguno aparente",
    "diagnostico": "Paciente sano",
    "tratamiento": "Continuar con rutina normal",
    "medicamentos": "Ninguno",
    "peso": 25.8,
    "temperatura": 38.5,
    "frecuenciaCardiaca": 80,
    "frecuenciaRespiratoria": 20,
    "observaciones": "Excelente estado general",
    "recomendaciones": "Continuar con alimentación balanceada",
    "mascotaId": 1,
    "veterinarioDocumento": "87654321",
    "citaId": 1
}
```

**Validaciones:**
- ✅ Status 200 - Historia clínica creada exitosamente
- ✅ `veterinarioDocumento` debe coincidir con el veterinario autenticado
- ✅ La mascota debe existir y estar activa
- ✅ Si se incluye `citaId`, la cita debe existir

---

### **Ejemplo 2: Historia Clínica de Emergencia**

```
POST {{base_url}}/historias-clinicas
Authorization: Bearer {{vet_token}}
Content-Type: application/json

{
    "fechaConsulta": "2025-12-03T15:30:00",
    "motivoConsulta": "Emergencia - Ingestión de objeto extraño",
    "sintomas": "Vómitos, inapetencia, malestar general",
    "diagnostico": "Obstrucción intestinal parcial",
    "tratamiento": "Cirugía exploratoria, extracción de cuerpo extraño",
    "medicamentos": "Antibióticos (Amoxicilina 500mg c/12h por 7 días), Analgésicos (Tramadol 50mg c/8h por 3 días)",
    "peso": 12.5,
    "temperatura": 39.2,
    "frecuenciaCardiaca": 120,
    "frecuenciaRespiratoria": 35,
    "observaciones": "Paciente presentaba deshidratación leve. Se realizó fluidoterapia antes de cirugía.",
    "recomendaciones": "Reposo absoluto por 10 días. Dieta blanda. Control en 3 días.",
    "mascotaId": 2,
    "veterinarioDocumento": "87654321"
}
```

**Validaciones:**
- ✅ Status 200 - Historia clínica de emergencia creada
- ✅ No requiere `citaId` (emergencias pueden no tener cita previa)
- ✅ Todos los signos vitales registrados

---

### **Ejemplo 3: Historia Clínica de Vacunación**

```
POST {{base_url}}/historias-clinicas
Authorization: Bearer {{vet_token}}
Content-Type: application/json

{
    "fechaConsulta": "2025-12-03T11:00:00",
    "motivoConsulta": "Vacunación anual",
    "sintomas": "Ninguno",
    "diagnostico": "Paciente sano - Apto para vacunación",
    "tratamiento": "Vacuna séxtuple canina",
    "medicamentos": "Vacuna Nobivac DHPPi",
    "peso": 18.3,
    "temperatura": 38.3,
    "frecuenciaCardiaca": 75,
    "frecuenciaRespiratoria": 22,
    "observaciones": "Paciente en excelentes condiciones. Vacunación realizada sin complicaciones.",
    "recomendaciones": "Próxima vacunación en 1 año. Monitorear por 24h por posibles reacciones adversas.",
    "mascotaId": 3,
    "veterinarioDocumento": "87654321",
    "citaId": 2
}
```

**Validaciones:**
- ✅ Status 200 - Historia clínica de vacunación creada
- ✅ Asociada a cita programada
- ✅ Registro completo de signos vitales

---

### **Ejemplo 4: Historia Clínica Básica (Campos Mínimos)**

```
POST {{base_url}}/historias-clinicas
Authorization: Bearer {{vet_token}}
Content-Type: application/json

{
    "fechaConsulta": "2025-12-03T09:00:00",
    "motivoConsulta": "Consulta general",
    "diagnostico": "Revisión de rutina - Paciente saludable",
    "mascotaId": 1,
    "veterinarioDocumento": "87654321"
}
```

**Validaciones:**
- ✅ Status 200 - Historia clínica creada con campos mínimos
- ✅ Solo requiere fecha, mascotaId y veterinarioDocumento
- ✅ Campos opcionales quedan vacíos

---

### **Ejemplo 5: Admin Crea Historia Clínica**

```
POST {{base_url}}/historias-clinicas
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "fechaConsulta": "2025-12-03T14:00:00",
    "motivoConsulta": "Control post-operatorio",
    "sintomas": "Cicatrización normal",
    "diagnostico": "Evolución favorable post-cirugía",
    "tratamiento": "Continuar con cuidados de herida",
    "medicamentos": "Antibiótico (Cefalexina 500mg c/12h por 5 días)",
    "peso": 15.2,
    "temperatura": 38.4,
    "observaciones": "Herida quirúrgica limpia, sin signos de infección",
    "recomendaciones": "Control en 7 días para retiro de puntos",
    "mascotaId": 4,
    "veterinarioDocumento": "99999999"
}
```

**Validaciones:**
- ✅ Status 200 - Admin puede crear historias clínicas
- ✅ Puede asignar cualquier veterinarioDocumento válido
- ✅ No requiere que el veterinario especificado esté autenticado

---

### **Ver Historias Clínicas Creadas:**

#### **Por Mascota:**
```
GET {{base_url}}/historias-clinicas/mascota/{{mascota_id}}
Authorization: Bearer {{vet_token}}
```

#### **Por Veterinario:**
```
GET {{base_url}}/historias-clinicas/veterinario/{{vet_documento}}
Authorization: Bearer {{vet_token}}
```

#### **Por Propietario (Cliente):**
```
GET {{base_url}}/historias-clinicas/propietario/{{cliente_documento}}
Authorization: Bearer {{client_token}}
```

#### **Todas (Solo Admin/Recepcionista):**
```
GET {{base_url}}/historias-clinicas
Authorization: Bearer {{admin_token}}
```

---

### **Errores Comunes al Crear Historias Clínicas:**

#### **Error 1: Veterinario documento no coincide**
```json
{
    "veterinarioDocumento": "11111111"  // ❌ No es el documento del veterinario autenticado
}
```
**Resultado:** ❌ Status 403 - Forbidden

#### **Error 2: Mascota no existe**
```json
{
    "mascotaId": 99999  // ❌ Mascota no existe
}
```
**Resultado:** ❌ Status 404 - Mascota no encontrada

#### **Error 3: Cita ya tiene historia clínica**
```json
{
    "citaId": 1  // ❌ Esta cita ya tiene una historia clínica asociada
}
```
**Resultado:** ❌ Status 400 - La cita ya tiene una historia clínica

#### **Error 4: Campos obligatorios faltantes**
```json
{
    "motivoConsulta": "Test"
    // ❌ Faltan: fechaConsulta, mascotaId, veterinarioDocumento
}
```
**Resultado:** ❌ Status 400 - Campos requeridos faltantes

---

## 🔑 **PRUEBAS ESPECÍFICAS CON DOCUMENTO COMO PK**

### **Escenario 1: Creación de Veterinaria por Admin**

#### **Paso 1:** Login como Admin
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "admin",
    "password": "admin123"
}
```

**Validación:** ✅ Token guardado en `admin_token`

#### **Paso 2:** Crear Nueva Veterinaria
```
POST {{base_url}}/veterinarias
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "nombre": "Clínica Veterinaria Prueba",
    "direccion": "Avenida Test 789",
    "telefono": "+57 310 9876543",
    "email": "prueba@vet.com",
    "ciudad": "Cali",
    "descripcion": "Veterinaria de prueba",
    "servicios": "Consultas, Vacunación",
    "horarioAtencion": "Lunes a Viernes: 9:00 AM - 5:00 PM",
    "activo": true
}
```

**Validaciones:**
- ✅ Status 200 - Veterinaria creada
- ✅ Campo `creado_por_documento` se establece automáticamente como "12345678"
- ✅ Admin puede ver esta veterinaria en GET /veterinarias

#### **Paso 3:** Verificar que Solo Ve Sus Veterinarias
```
GET {{base_url}}/veterinarias
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Solo retorna veterinarias donde `creado_por_documento = "12345678"`
- ✅ No retorna veterinarias de otros admins

### **Escenario 2: Veterinario Accede a Clientes Atendidos**

#### **Paso 1:** Login como Veterinario
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "dr.garcia",
    "password": "admin123"
}
```

#### **Paso 2:** Ver Clientes Atendidos
```
GET {{base_url}}/usuarios/rol/ROLE_CLIENTE
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Solo retorna clientes con citas donde `veterinarioDocumento = "87654321"`
- ✅ Documentos esperados: "33333333", "44444444" (clientes atendidos)

#### **Paso 3:** Intentar Ver Cliente No Atendido
```
GET {{base_url}}/usuarios/55555555
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - No puede ver cliente que no ha atendido

#### **Paso 4:** Ver Sus Citas por Documento
```
GET {{base_url}}/citas/veterinario/87654321
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Solo citas donde `veterinarioDocumento = "87654321"`

### **Escenario 3: Cliente Gestiona Sus Mascotas**

#### **Paso 1:** Login como Cliente
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "cliente1",
    "password": "admin123"
}
```

#### **Paso 2:** Ver Sus Mascotas por Documento
```
GET {{base_url}}/mascotas/propietario/33333333
Authorization: Bearer {{client_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Solo mascotas donde `propietarioDocumento = "33333333"`
- ✅ Mascotas esperadas: Max, Luna, Rocky

#### **Paso 3:** Crear Nueva Mascota
```
POST {{base_url}}/mascotas
Authorization: Bearer {{client_token}}
Content-Type: application/json

{
    "nombre": "Bobby Test",
    "especie": "Perro",
    "raza": "Bulldog",
    "sexo": "Macho",
    "fechaNacimiento": "2024-01-15",
    "peso": 12.5,
    "color": "Blanco",
    "observaciones": "Mascota de prueba",
    "propietario": {
        "documento": "33333333"
    },
    "activo": true
}
```

**Validaciones:**
- ✅ Status 200 - Mascota creada
- ✅ `propietario.documento` coincide con el cliente autenticado

#### **Paso 4:** Intentar Ver Mascotas de Otro Cliente
```
GET {{base_url}}/mascotas/propietario/44444444
Authorization: Bearer {{client_token}}
```

**Validación:** ❌ Status 403 - No puede ver mascotas de otros

### **Escenario 4: Relaciones Basadas en Documento**

#### **Paso 1:** Ver Cita con Relaciones Completas
```
GET {{base_url}}/citas/1
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Campo `clienteDocumento`: "33333333" (documento del cliente)
- ✅ Campo `veterinarioDocumento`: "87654321" (documento del veterinario)
- ✅ Se pueden hacer join con usuarios usando estos documentos

#### **Paso 2:** Ver Historia Clínica con Veterinario por Documento
```
GET {{base_url}}/historias-clinicas/1
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Campo `veterinarioDocumento`: "87654321"
- ✅ Relación con veterinario usando documento como FK

#### **Paso 3:** Buscar Usuario por Documento
```
GET {{base_url}}/usuarios/33333333
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Documento es la clave primaria
- ✅ Retorna información completa del usuario

### **Escenario 5: Filtros por Documento**

#### **Paso 1:** Buscar Reportes Generados por Admin
```
GET {{base_url}}/reportes/generador/12345678
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Solo reportes donde `generadoPor = "12345678"`

#### **Paso 2:** Buscar Veterinarias Creadas por Admin
```
GET {{base_url}}/veterinarias
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status 200
- ✅ Solo veterinarias donde `creado_por_documento = "12345678"`
- ✅ Filtrado automático por documento del creador

---

## 🧪 **CASOS DE PRUEBA ESPECÍFICOS**

### **Escenario 1: Flujo Completo de Cliente**

#### **Paso 1:** Login del cliente
#### **Paso 2:** Ver sus mascotas existentes
#### **Paso 3:** Crear una nueva mascota
#### **Paso 4:** Programar cita para la nueva mascota
#### **Paso 5:** Consultar sus citas programadas
#### **Paso 6:** Descargar PDF de historia clínica

### **Escenario 2: Flujo de Veterinario**

#### **Paso 1:** Login del veterinario
#### **Paso 2:** Ver citas del día
#### **Paso 3:** Consultar datos de la mascota
#### **Paso 4:** Crear historia clínica tras consulta
#### **Paso 5:** Generar reporte de actividades

### **Escenario 3: Gestión Administrativa**

#### **Paso 1:** Login del administrador
#### **Paso 2:** Crear nuevo usuario (recepcionista)
#### **Paso 3:** Registrar nueva veterinaria
#### **Paso 4:** Consultar estadísticas generales
#### **Paso 5:** Generar reportes del sistema

### **Escenario 4: Flujo de Recepcionista**

#### **Paso 1:** Login del recepcionista
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "recepcion1",
    "password": "admin123"
}
```

**Validación:** ✅ Status 200 - Login exitoso

#### **Paso 2:** Ver agenda de citas del día
```
GET {{base_url}}/citas
Authorization: Bearer {{recep_token}}
```

**Validación:** ✅ Status 200 - Solo citas de su veterinaria

#### **Paso 3:** Registrar nuevo cliente
```
POST {{base_url}}/usuarios
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "documento": "88888888",
    "tipoDocumento": "CC",
    "username": "cliente_nuevo",
    "password": "admin123",
    "nombres": "María",
    "apellidos": "González",
    "email": "maria@email.com",
    "telefono": "3008888888",
    "direccion": "Calle 123",
    "fechaNacimiento": "1990-06-15",
    "activo": true,
    "veterinariaId": 1,
    "roles": [3]
}
```

**Validación:** ✅ Status 200 - Cliente creado en su veterinaria

#### **Paso 4:** Registrar mascota del nuevo cliente
```
POST {{base_url}}/mascotas
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "nombre": "Max",
    "especie": "Perro",
    "raza": "Labrador",
    "sexo": "Macho",
    "fechaNacimiento": "2022-03-10",
    "peso": 25.5,
    "color": "Dorado",
    "propietario": {
        "documento": "88888888"
    },
    "activo": true
}
```

**Validación:** ✅ Status 200 - Mascota registrada

#### **Paso 5:** Programar primera cita
```
POST {{base_url}}/citas
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "fechaHora": "2025-12-05T10:00:00",
    "motivo": "Primera consulta",
    "estado": "PROGRAMADA",
    "clienteDocumento": "88888888",
    "mascotaId": 10,
    "veterinarioDocumento": "87654321",
    "veterinariaId": 1
}
```

**Validación:** ✅ Status 200 - Cita programada exitosamente

#### **Paso 6:** Verificar que no puede crear veterinarias
```
POST {{base_url}}/veterinarias
Authorization: Bearer {{recep_token}}
Content-Type: application/json

{
    "nombre": "Nueva Vet Test",
    "ciudad": "Test"
}
```

**Validación:** ❌ Status 403 - Acceso denegado

### **Escenario 5: Restricciones de Veterinario**

#### **Paso 1:** Login del veterinario
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "{{veterinario_username}}",
    "password": "{{veterinario_password}}"
}
```

**Validación:** ✅ Status 200 - Login exitoso

#### **Paso 2:** Intentar ver todos los usuarios
```
GET {{base_url}}/usuarios
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Solo retorna clientes que ha atendido (NO todos los usuarios)

#### **Paso 3:** Ver perfil de cliente atendido
```
GET {{base_url}}/usuarios/33333333
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Puede ver cliente que ha atendido

#### **Paso 4:** Intentar ver perfil de cliente NO atendido
```
GET {{base_url}}/usuarios/55555555
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - No puede ver cliente que no ha atendido

#### **Paso 5:** Intentar consultar veterinarios
```
GET {{base_url}}/usuarios/rol/VETERINARIO
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - Solo puede consultar clientes

#### **Paso 6:** Consultar clientes (filtrado)
```
GET {{base_url}}/usuarios/rol/CLIENTE
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Solo retorna clientes que ha atendido

#### **Paso 7:** Ver su propio perfil
```
GET {{base_url}}/usuarios/{{vet_documento}}
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Puede ver su propio perfil

#### **Paso 8:** Ver sus citas
```
GET {{base_url}}/citas/veterinario/{{vet_documento}}
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Puede ver sus citas programadas

#### **Paso 9:** Ver su veterinaria
```
GET {{base_url}}/veterinarias
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Solo retorna su veterinaria asignada

#### **Paso 10:** Intentar ver otra veterinaria
```
GET {{base_url}}/veterinarias/2
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - No puede ver otras veterinarias

---

## ❌ **VALIDACIÓN DE ERRORES**

### **1. Autenticación Fallida**
```
POST {{base_url}}/auth/signin
Content-Type: application/json

{
    "username": "usuario_inexistente",
    "password": "password_incorrecto"
}
```

**Validación:** ❌ Status 401 - Credenciales inválidas

### **2. Token Expirado**
```
GET {{base_url}}/usuarios
Authorization: Bearer token_expirado_o_invalido
```

**Validación:** ❌ Status 401 - Token inválido

### **3. Acceso Sin Permisos (Cliente intentando ver todos los usuarios)**
```
GET {{base_url}}/usuarios
Authorization: Bearer {{client_token}}
```

**Validación:** ❌ Status 403 - Acceso denegado

### **4. Documento de Usuario No Encontrado**
```
GET {{base_url}}/usuarios/99999999
Authorization: Bearer {{admin_token}}
```

**Validación:** ❌ Status 404 - Usuario con documento "99999999" no encontrado

### **5. Veterinario Intentando Ver Cliente No Atendido**
```
GET {{base_url}}/usuarios/55555555
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ❌ Status 403 - Veterinario no puede ver cliente que no ha atendido
- ❌ Documento "55555555" no tiene citas con veterinarioDocumento "87654321"

### **6. Veterinario Intentando Consultar Otros Roles**
```
GET {{base_url}}/usuarios/rol/ROLE_VETERINARIO
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - Veterinario solo puede consultar clientes

### **7. Veterinario Intentando Ver Otra Veterinaria**
```
GET {{base_url}}/veterinarias/2
Authorization: Bearer {{vet_token}}
```

**Validaciones:**
- ❌ Status 403 - Veterinario solo puede ver su propia veterinaria
- ❌ veterinariaId 2 no coincide con la asignada al veterinario

### **8. Admin Intentando Ver Veterinaria de Otro Admin**
```
GET {{base_url}}/veterinarias/3
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ❌ Status 403 - Admin solo ve veterinarias donde `creado_por_documento = "12345678"`
- ❌ Veterinaria ID 3 tiene creado_por_documento diferente

### **9. Cliente Intentando Ver Mascotas con Documento Ajeno**
```
GET {{base_url}}/mascotas/propietario/44444444
Authorization: Bearer {{client_token}}
```

**Validaciones:**
- ❌ Status 403 - Cliente no puede ver mascotas de otros
- ❌ propietarioDocumento "44444444" no coincide con cliente autenticado "33333333"

### **10. Crear Mascota con Documento Propietario Inexistente**
```
POST {{base_url}}/mascotas
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "nombre": "Test",
    "especie": "Perro",
    "raza": "Labrador",
    "sexo": "Macho",
    "fechaNacimiento": "2024-01-01",
    "peso": 10.0,
    "propietario": {
        "documento": "99999999"
    },
    "activo": true
}
```

**Validaciones:**
- ❌ Status 400 o 404 - Propietario con documento no existe en usuarios
- ❌ Violación de foreign key constraint

### **11. Crear Cita con Documentos Inválidos**
```
POST {{base_url}}/citas
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "fechaHora": "2025-12-10T10:00:00",
    "motivo": "Test",
    "estado": "PROGRAMADA",
    "clienteDocumento": "99999999",
    "veterinarioDocumento": "88888888",
    "mascotaId": 1,
    "veterinariaId": 1
}
```

**Validaciones:**
- ❌ Status 400 o 404 - clienteDocumento o veterinarioDocumento no existen
- ❌ Violación de foreign key constraints

### **12. Crear Historia Clínica con Veterinario Incorrecto**
```
POST {{base_url}}/historias-clinicas
Authorization: Bearer {{vet_token}}
Content-Type: application/json

{
    "diagnostico": "Test",
    "tratamiento": "Test",
    "observaciones": "Test",
    "fechaVisita": "2025-12-03T10:00:00",
    "veterinarioDocumento": "11111111",
    "mascotaId": 1,
    "citaId": 1
}
```

**Validaciones:**
- ❌ Status 403 - veterinarioDocumento no coincide con el veterinario autenticado
- ❌ Documento "11111111" no es el del veterinario en sesión "87654321"

### **13. Recurso No Encontrado**
```
GET {{base_url}}/mascotas/99999
Authorization: Bearer {{admin_token}}
```

**Validación:** ❌ Status 404 - Mascota con ID 99999 no encontrada

### **14. Datos Inválidos en Creación**
```
POST {{base_url}}/mascotas
Authorization: Bearer {{client_token}}
Content-Type: application/json

{
    "nombre": "",
    "especie": "",
    "propietario": {
        "documento": ""
    }
}
```

**Validaciones:**
- ❌ Status 400 - Datos de entrada inválidos
- ❌ Campos requeridos vacíos (nombre, especie, propietario.documento)

### **15. Intentar Actualizar Documento de Usuario**
```
PUT {{base_url}}/usuarios/33333333
Authorization: Bearer {{admin_token}}
Content-Type: application/json

{
    "documento": "99999999",
    "nombres": "Test",
    "apellidos": "Test"
}
```

**Validaciones:**
- ❌ Status 400 - Documento no debe ser modificable (es PK)
- ❌ Documento es inmutable y debe permanecer "33333333"

---

## 📄 **PRUEBAS DE FUNCIONALIDAD PDF**

### **1. Admin Descarga PDF de Historia Clínica**
```
GET {{base_url}}/pdf/historia-clinica/1
Authorization: Bearer {{admin_token}}
Accept: application/pdf
```

**Validaciones:**
- ✅ Status 200 - PDF generado exitosamente
- ✅ Content-Type: application/pdf
- ✅ Content-Disposition: attachment; filename="historia_clinica_*.pdf"
- ✅ Incluye datos de mascota con propietarioDocumento
- ✅ Incluye datos de veterinario por veterinarioDocumento

### **2. Cliente Descarga PDF de Sus Mascotas**
```
GET {{base_url}}/pdf/historia-clinica/1
Authorization: Bearer {{client_token}}
Accept: application/pdf
```

**Validaciones:**
- ✅ Status 200 - PDF generado exitosamente
- ✅ Solo si mascota tiene propietarioDocumento = "33333333"
- ✅ Incluye solo historias clínicas de sus mascotas

### **3. Veterinario Descarga PDF de Historia Completa**
```
GET {{base_url}}/pdf/historia-clinica-completa/1
Authorization: Bearer {{vet_token}}
Accept: application/pdf
```

**Validaciones:**
- ✅ Status 200 - PDF generado exitosamente
- ✅ Incluye todas las historias donde veterinarioDocumento = "87654321"
- ✅ Muestra documento del propietario y datos completos

### **4. Admin Descarga Reporte General PDF**
```
GET {{base_url}}/pdf/reporte-general
Authorization: Bearer {{admin_token}}
Accept: application/pdf
```

**Validaciones:**
- ✅ Status 200 - PDF generado
- ✅ Incluye estadísticas filtradas por creado_por_documento
- ✅ Solo veterinarias donde creado_por_documento = "12345678"

### **5. Veterinario Descarga Reporte de Citas por Documento**
```
GET {{base_url}}/pdf/reporte-citas?veterinarioDocumento=87654321
Authorization: Bearer {{vet_token}}
Accept: application/pdf
```

**Validaciones:**
- ✅ Status 200 - PDF generado
- ✅ Solo citas donde veterinarioDocumento = "87654321"
- ✅ Incluye datos de clientes por clienteDocumento

### **6. Error: Cliente Intenta PDF de Mascota Ajena**
```
GET {{base_url}}/pdf/historia-clinica/5
Authorization: Bearer {{client_token}}
Accept: application/pdf
```

**Validaciones:**
- ❌ Status 403 - No puede descargar PDF
- ❌ Mascota con ID 5 no tiene propietarioDocumento "33333333"

### **7. Error: Veterinario Intenta Reporte de Otro Veterinario**
```
GET {{base_url}}/pdf/reporte-citas?veterinarioDocumento=11111111
Authorization: Bearer {{vet_token}}
Accept: application/pdf
```

**Validaciones:**
- ❌ Status 403 - No puede generar reporte
- ❌ veterinarioDocumento "11111111" no coincide con el autenticado "87654321"

---

## 🆕 **FORMATO COMPLETO PARA CREAR USUARIOS EN POSTMAN**

### **Formato de Respuesta Estándar:**

Todas las operaciones del API ahora retornan un formato de respuesta consistente:

#### **Respuesta Exitosa:**
```json
{
    "success": true,
    "message": "Operación realizada exitosamente",
    "data": { /* datos de respuesta */ },
    "timestamp": "2025-11-03T10:30:00"
}
```

#### **Respuesta de Error:**
```json
{
    "success": false,
    "message": "Descripción del error",
    "error": "Detalles adicionales del error",
    "data": null,
    "timestamp": "2025-11-03T10:30:00"
}
```

### **Scripts de Validación Automática (en Tests de Postman):**

**1. Método:** `POST`  
**2. URL:** `{{base_url}}/usuarios`  
**3. Headers necesarios:**
```
Content-Type: application/json
Authorization: Bearer {{admin_token}}
```

### **📝 Formato del Body (JSON)**

#### **✅ Formato CORRECTO (funciona):**
```json
{
    "documento": "99999999",
    "username": "nuevo_cliente",
    "password": "123456",
    "nombres": "Nuevo",
    "apellidos": "Cliente Test",
    "email": "nuevo@test.com",
    "telefono": "3001234567",
    "direccion": "Dirección de prueba",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1990-01-01",
    "activo": true,
    "roles": ["ROLE_CLIENTE"]
}
```

#### **❌ Formato INCORRECTO (causaba error 500):**
```json
{
    "documento": "99999999",
    "username": "nuevo_cliente",
    "password": "123456",
    "nombres": "Nuevo",
    "apellidos": "Cliente Test",
    "email": "nuevo@test.com",
    "telefono": "3001234567",
    "direccion": "Dirección de prueba",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1990-01-01",
    "activo": true,
    "roles": [{"id": 3}]  ← ❌ INCORRECTO
}
```

### **👥 Ejemplos para Diferentes Tipos de Usuario**

#### **🔵 Crear Cliente:**
```json
{
    "documento": "11111111",
    "username": "cliente_nuevo",
    "password": "123456",
    "nombres": "Juan Carlos",
    "apellidos": "López García",
    "email": "juan@ejemplo.com",
    "telefono": "3001234567",
    "direccion": "Calle 123 #45-67",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1985-05-15",
    "activo": true,
    "roles": ["ROLE_CLIENTE"]
}
```

#### **🟢 Crear Veterinario:**
```json
{
    "documento": "22222222",
    "username": "dr.martinez",
    "password": "123456",
    "nombres": "Ana María",
    "apellidos": "Martínez Rodríguez",
    "email": "ana.martinez@veterinaria.com",
    "telefono": "3109876543",
    "direccion": "Avenida Veterinaria 789",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1982-03-20",
    "activo": true,
    "roles": ["ROLE_VETERINARIO"],
    "veterinariaId": 1
}
```

#### **🟡 Crear Recepcionista:**
```json
{
    "documento": "33333333",
    "username": "recepcion_maria",
    "password": "123456",
    "nombres": "María Fernanda",
    "apellidos": "González Pérez",
    "email": "recepcion@veterinaria.com",
    "telefono": "3207654321",
    "direccion": "Centro Comercial 456",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1990-08-10",
    "activo": true,
    "roles": ["ROLE_RECEPCIONISTA"]
}
```

#### **🔴 Crear Administrador:**
```json
{
    "documento": "44444444",
    "username": "admin_carlos",
    "password": "123456",
    "nombres": "Carlos Eduardo",
    "apellidos": "Administrador Pérez",
    "email": "admin.carlos@veterinaria.com",
    "telefono": "3301122334",
    "direccion": "Oficina Central 321",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1978-12-05",
    "activo": true,
    "roles": ["ROLE_ADMIN"]
}
```

#### **⚡ Usuario con Múltiples Roles:**
```json
{
    "documento": "55555555",
    "username": "super_user",
    "password": "123456",
    "nombres": "Roberto",
    "apellidos": "Super Usuario",
    "email": "super@veterinaria.com",
    "telefono": "3401122334",
    "direccion": "Sede Principal 111",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1980-01-15",
    "activo": true,
    "roles": ["ROLE_ADMIN", "ROLE_VETERINARIO"]
}
```

### **🎯 Valores Válidos para Campos**

#### **Roles Disponibles:**
- `"ROLE_CLIENTE"` - Para clientes/propietarios de mascotas
- `"ROLE_VETERINARIO"` - Para veterinarios
- `"ROLE_RECEPCIONISTA"` - Para personal de recepción
- `"ROLE_ADMIN"` - Para administradores del sistema

#### **Tipos de Documento:**
- `"CC"` - Cédula de Ciudadanía
- `"TI"` - Tarjeta de Identidad
- `"CE"` - Cédula de Extranjería
- `"PP"` - Pasaporte

#### **Formato de Fecha:**
- **fechaNacimiento:** `"YYYY-MM-DD"` (ej: `"1990-01-01"`)

#### **Campos Opcionales:**
- `veterinariaId` - Solo para veterinarios (ID de la veterinaria asignada)
- `activo` - Por defecto `true` si no se especifica

### **✅ Respuesta Exitosa Esperada:**
```json
{
    "documento": "99999999",
    "username": "nuevo_cliente",
    "nombres": "Nuevo",
    "apellidos": "Cliente Test",
    "email": "nuevo@test.com",
    "telefono": "3001234567",
    "direccion": "Dirección de prueba",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1990-01-01",
    "fechaRegistro": "2025-10-29T16:52:40.1870239",
    "activo": true,
    "roles": ["ROLE_CLIENTE"]
}
```

### **🔍 Pasos en Postman**

#### **Paso 1: Hacer Login como Admin**
1. **URL:** `POST {{base_url}}/auth/signin`
2. **Body:**
   ```json
   {
       "username": "admin",
       "password": "admin123"
   }
   ```
3. **Copiar el token** de la respuesta

#### **Paso 2: Crear el Usuario**
1. **URL:** `POST {{base_url}}/usuarios`
2. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer [TOKEN_DEL_PASO_1]`
3. **Body:** Usar cualquiera de los ejemplos de arriba

### **❗ Errores Comunes y Soluciones**

#### **Error 400 - Bad Request:**
- **Causa:** Formato incorrecto del campo `roles`
- **Solución:** Usar `["ROLE_CLIENTE"]` en lugar de `[{"id": 3}]`

#### **Error 401 - Unauthorized:**
- **Causa:** Token JWT faltante o inválido
- **Solución:** Hacer login primero y usar el token correcto

#### **Error 403 - Forbidden:**
- **Causa:** Usuario no tiene permisos de administrador
- **Solución:** Usar token de un usuario con `ROLE_ADMIN`

#### **Error 409 - Conflict:**
- **Causa:** Usuario con ese documento o username ya existe
- **Solución:** Cambiar `documento` y `username` por valores únicos

### **🧪 Script de Validación para Postman**

Agregar en la pestaña **Tests** del request:

```javascript
pm.test("Usuario creado exitosamente", function () {
    pm.response.to.have.status(200);
});

pm.test("Respuesta exitosa", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.message).to.be.a('string');
});

pm.test("Datos válidos", function () {
    const response = pm.response.json();
    pm.expect(response.data).to.exist;
    pm.expect(response.timestamp).to.be.a('string');
});
```

#### **Para Operaciones POST (Crear):**
```javascript
pm.test("Recurso creado exitosamente", function () {
    pm.response.to.have.status(200);
});

pm.test("Mensaje de éxito correcto", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.message).to.include("creado exitosamente");
});
```

#### **Para Operaciones PUT (Actualizar):**
```javascript
pm.test("Recurso actualizado exitosamente", function () {
    pm.response.to.have.status(200);
});

pm.test("Mensaje de actualización correcto", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.message).to.include("actualizado exitosamente");
});
```

#### **Para Operaciones DELETE (Eliminar):**
```javascript
pm.test("Recurso eliminado exitosamente", function () {
    pm.response.to.have.status(200);
});

pm.test("Mensaje de eliminación correcto", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.true;
    pm.expect(response.message).to.include("eliminado exitosamente");
});
```

#### **Para Errores de Acceso:**
```javascript
pm.test("Acceso denegado correctamente", function () {
    pm.response.to.have.status(403);
});

pm.test("Usuario está activo", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.false;
    pm.expect(response.message).to.be.a('string');
    pm.expect(response.error).to.be.a('string');
});
```

#### **Para Recursos No Encontrados:**
```javascript
pm.test("Recurso no encontrado", function () {
    pm.response.to.have.status(404);
});

pm.test("Mensaje de no encontrado correcto", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.false;
    pm.expect(response.message).to.include("no encontrad");
});
```

#### **Para Errores de Validación:**
```javascript
pm.test("Error de validación", function () {
    pm.response.to.have.status(400);
});

pm.test("Mensaje de error de validación", function () {
    const response = pm.response.json();
    pm.expect(response.success).to.be.false;
    pm.expect(response.message).to.be.a('string');
});
```

---

## 📋 **CHECKLIST DE PRUEBAS COMPLETAS**

### **✅ Autenticación y Autorización**
- [ ] Login exitoso para todos los roles (admin, vet, recepcionista, cliente)
- [ ] Tokens JWT válidos y funcionales
- [ ] Roles asignados correctamente
- [ ] Acceso denegado para usuarios sin permisos (403)
- [ ] Tokens expirados manejados correctamente (401)
- [ ] Credenciales incorrectas rechazadas (401)

### **✅ Pruebas con Documento como PK**
- [ ] Búsqueda de usuarios por documento como clave primaria
- [ ] Relaciones usando documento como FK (propietarioDocumento, clienteDocumento, etc.)
- [ ] Filtrado de veterinarias por creado_por_documento
- [ ] Documento es inmutable (no se puede actualizar)
- [ ] Validación de documentos existentes en relaciones FK
- [ ] Error 404 cuando documento no existe

### **✅ Admin - Gestión de Veterinarias (11 pruebas)**
- [ ] Ver solo veterinarias donde creado_por_documento = su documento
- [ ] Crear nueva veterinaria (creado_por_documento asignado automáticamente)
- [ ] Actualizar veterinaria propia
- [ ] No ver veterinarias de otros admins (filtrado por documento)
- [ ] Activar/desactivar veterinaria
- [ ] Ver todas las mascotas del sistema
- [ ] Ver todas las citas del sistema
- [ ] Gestionar usuarios (crear, actualizar, ver)
- [ ] Asignar/modificar roles
- [ ] Generar reportes filtrados por sus veterinarias
- [ ] Acceso completo a todas las funciones administrativas

### **✅ Veterinario - Acceso Restringido (14 pruebas)**
- [ ] Ver solo su perfil por documento (GET /usuarios/{documento})
- [ ] Ver solo la veterinaria donde trabaja (veterinariaId coincide)
- [ ] Acceso denegado a otras veterinarias (403)
- [ ] Ver solo clientes atendidos (con citas donde veterinarioDocumento = su documento)
- [ ] No ver clientes no atendidos (403)
- [ ] Acceso denegado a consultar roles ADMIN, VETERINARIO, RECEPCIONISTA
- [ ] Consultar rol CLIENTE solo con sus pacientes
- [ ] Ver citas por su documento (GET /citas/veterinario/{documento})
- [ ] Crear historias clínicas con su veterinarioDocumento
- [ ] Ver historias clínicas creadas por él (veterinarioDocumento)
- [ ] Ver mascotas de sus pacientes
- [ ] No puede modificar usuarios
- [ ] No puede crear veterinarias
- [ ] Gestión médica completa pero sin acceso administrativo

### **✅ Recepcionista - Gestión Operativa (12 pruebas)**
- [ ] Ver solo usuarios de su veterinaria (veterinariaId coincide)
- [ ] Ver todas las mascotas de su veterinaria
- [ ] Crear nuevas mascotas para clientes
- [ ] Ver todas las citas de su veterinaria
- [ ] Programar nuevas citas
- [ ] Actualizar estado de citas
- [ ] Ver historias clínicas de su veterinaria (solo lectura)
- [ ] Crear nuevos clientes
- [ ] Crear veterinarios para su veterinaria
- [ ] Ver su veterinaria asignada
- [ ] Buscar usuarios por rol (filtrado por veterinaria)
- [ ] Acceso denegado a crear veterinarias (403)
- [ ] Acceso denegado a ver otras veterinarias (403)
- [ ] Gestión operativa completa de su veterinaria

### **✅ Cliente - Datos Propios (6 pruebas)**
- [ ] Ver solo sus mascotas (propietarioDocumento = su documento)
- [ ] Crear mascotas con propietarioDocumento asignado automáticamente
- [ ] Actualizar datos de sus mascotas
- [ ] Ver solo sus citas (clienteDocumento = su documento)
- [ ] Programar citas con su clienteDocumento
- [ ] Ver historias clínicas de sus mascotas únicamente
- [ ] Acceso denegado a mascotas de otros clientes (403)
- [ ] Acceso denegado a listado completo de usuarios
- [ ] Ver su propio perfil (GET /usuarios/{documento})

### **✅ CRUD Operations por Entidad**
- [ ] **Usuarios:** Crear, leer por documento, actualizar, activar/desactivar
- [ ] **Veterinarias:** Crear con creado_por_documento, leer filtrado, actualizar, activar/desactivar
- [ ] **Mascotas:** Crear con propietarioDocumento, leer por propietario, actualizar, activar/desactivar
- [ ] **Citas:** Crear con clienteDocumento y veterinarioDocumento, leer filtradas, actualizar estado
- [ ] **Historias Clínicas:** Crear con veterinarioDocumento, leer filtradas, actualizar

### **✅ Validaciones de Seguridad**
- [ ] Endpoints protegidos requieren autenticación
- [ ] Validación de propiedad de recursos
- [ ] Manejo correcto de errores 401, 403, 404
- [ ] CORS configurado correctamente

### **✅ Funcionalidades Especiales**
- [ ] Generación de PDF funcional
- [ ] Descarga de archivos correcta
- [ ] Búsquedas y filtros operativos
- [ ] Estadísticas y reportes exactos

---

## 🎯 **RESULTADOS ESPERADOS**

Al completar todas las pruebas, deberías obtener:

### **✅ Resultados Exitosos:**
- **100% de logins** exitosos con credenciales correctas
- **Acceso autorizado** a endpoints permitidos por rol
- **Datos correctos** devueltos según permisos
- **PDFs generados** correctamente
- **Operaciones CRUD** funcionando según rol

### **❌ Errores Esperados (Correctos):**
- **401 Unauthorized** para credenciales incorrectas
- **403 Forbidden** para accesos sin permisos
- **404 Not Found** para recursos inexistentes
- **400 Bad Request** para datos inválidos

---

## 📈 **ANÁLISIS DE RESULTADOS**

### **Métricas de Éxito:**
- **Tasa de éxito de autenticación:** 100% con credenciales válidas
- **Cobertura de endpoints:** Todos los endpoints probados
- **Validación de roles:** 100% de restricciones respetadas
- **Funcionalidades especiales:** PDF y búsquedas operativas

### **Indicadores de Calidad:**
- **Tiempo de respuesta:** < 2 segundos por request
- **Manejo de errores:** Códigos HTTP apropiados
- **Seguridad:** Ningún acceso no autorizado exitoso
- **Consistencia:** Comportamiento predecible en todos los casos

---

## 🔄 **CAMBIOS RECIENTES EN PERMISOS**

### **Actualización de Seguridad - ROL_VETERINARIO (03/11/2025)**

#### **Cambios Implementados:**

1. **Restricción en GET `/api/usuarios`:**
   - ✅ Antes: Veterinarios podían ver todos los usuarios
   - 🔒 Ahora: Solo ven clientes que han atendido (con citas registradas)

2. **Restricción en GET `/api/usuarios/{documento}`:**
   - ✅ Antes: Veterinarios podían ver cualquier perfil de usuario
   - 🔒 Ahora: Solo pueden ver:
     - Su propio perfil
     - Perfiles de clientes que han atendido

3. **Restricción en GET `/api/usuarios/username/{username}`:**
   - ✅ Antes: Veterinarios podían consultar cualquier usuario por username
   - 🔒 Ahora: Solo pueden consultar:
     - Su propio usuario
     - Clientes que han atendido

4. **Restricción en GET `/api/usuarios/rol/{rolNombre}`:**
   - ✅ Antes: Veterinarios podían consultar usuarios por cualquier rol
   - 🔒 Ahora: 
     - Solo pueden consultar `CLIENTE` o `ROLE_CLIENTE`
     - Retorna únicamente clientes que han atendido
     - Intentar consultar otros roles retorna 403 Forbidden

5. **Restricción en GET `/api/veterinarias` (NUEVO):**
   - ✅ Antes: Veterinarios podían ver todas las veterinarias
   - 🔒 Ahora: Solo ven la veterinaria donde trabajan

6. **Restricción en GET `/api/veterinarias/{id}` (NUEVO):**
   - ✅ Antes: Veterinarios podían ver cualquier veterinaria por ID
   - 🔒 Ahora: Solo pueden ver su propia veterinaria (403 para otras)

7. **Restricción en GET `/api/veterinarias/activas` (NUEVO):**
   - ✅ Antes: Veterinarios podían ver todas las veterinarias activas
   - 🔒 Ahora: Solo ven su veterinaria si está activa

8. **Mensajes de respuesta estandarizados (NUEVO):**
   - ✅ Todas las operaciones retornan formato consistente con `success`, `message`, `data`, `timestamp`
   - ✅ Mensajes descriptivos para operaciones exitosas: "creado exitosamente", "actualizado exitosamente", etc.
   - ✅ Mensajes de error descriptivos con detalles adicionales
   - ✅ Códigos HTTP apropiados para cada tipo de respuesta

#### **Lógica de "Cliente Atendido":**
Un cliente se considera "atendido" por un veterinario si existe al menos una cita donde:
- `cita.cliente = cliente`
- `cita.veterinario.documento = veterinario.documento`

#### **Endpoints NO Modificados para Veterinarios:**
- ✅ `/api/mascotas` - Pueden ver todas las mascotas
- ✅ `/api/citas/veterinario/{documento}` - Pueden ver sus citas
- ✅ `/api/historias-clinicas` - Pueden gestionar historias clínicas
- ✅ `/api/veterinarios` - Listado público de veterinarios (sin cambios)

#### **Endpoints Modificados para Veterinarios:**
- 🔒 `/api/usuarios` - Solo clientes atendidos
- 🔒 `/api/usuarios/{documento}` - Solo su perfil o clientes atendidos
- 🔒 `/api/usuarios/username/{username}` - Solo su perfil o clientes atendidos
- 🔒 `/api/usuarios/rol/{rolNombre}` - Solo rol CLIENTE y filtrado
- 🔒 `/api/veterinarias` - Solo su veterinaria
- 🔒 `/api/veterinarias/{id}` - Solo su veterinaria
- 🔒 `/api/veterinarias/activas` - Solo su veterinaria si está activa

#### **Pruebas Recomendadas Post-Actualización:**

1. **Crear una cita entre veterinario y cliente:**
   ```
   POST {{base_url}}/citas
   {
       "fechaHora": "2025-12-10T10:00:00",
       "motivo": "Consulta general",
       "estado": "PROGRAMADA",
       "clienteDocumento": "33333333",
       "veterinarioDocumento": "87654321",
       "mascotaId": 1,
       "veterinariaId": 1
   }
   ```

2. **Verificar que el veterinario puede ver al cliente:**
   ```
   GET {{base_url}}/usuarios
   Authorization: Bearer {{vet_token}}
   ```
   - ✅ Debe incluir cliente con documento "33333333"

3. **Verificar filtrado de veterinarias por documento creador:**
   ```
   GET {{base_url}}/veterinarias
   Authorization: Bearer {{admin_token}}
   ```
   - ✅ Solo retorna veterinarias donde creado_por_documento = "12345678"

---

## 🔧 **SCRIPTS DE VALIDACIÓN POSTMAN**

### **Script Pre-request Global:**

Agregar en la pestaña "Pre-request Script" de la colección:

```javascript
// Validar que las variables necesarias estén definidas
const requiredVars = ['base_url'];
requiredVars.forEach(varName => {
    if (!pm.environment.get(varName) && !pm.collectionVariables.get(varName)) {
        console.error(`❌ Variable requerida no definida: ${varName}`);
    }
});

// Log de la petición
console.log(`📤 ${pm.request.method} ${pm.request.url}`);
```

### **Script Test Global:**

Agregar en la pestaña "Tests" de la colección:

```javascript
// Validar código de respuesta exitoso
if (pm.response.code >= 200 && pm.response.code < 300) {
    console.log(`✅ Success: ${pm.response.code}`);
    
    // Si la respuesta tiene JSON, validar estructura
    if (pm.response.headers.get("Content-Type")?.includes("application/json")) {
        const jsonData = pm.response.json();
        
        // Validar estructura de respuesta estándar
        pm.test("Response has standard structure", () => {
            pm.expect(jsonData).to.have.property('success');
            pm.expect(jsonData).to.have.property('message');
            pm.expect(jsonData).to.have.property('timestamp');
        });
    }
} else {
    console.log(`❌ Error: ${pm.response.code}`);
}

// Log del tiempo de respuesta
console.log(`⏱️ Response time: ${pm.response.responseTime}ms`);
```

### **Tests Específicos por Endpoint:**

#### **Para Login (POST /auth/signin):**
```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Response has token", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('token');
    pm.expect(jsonData.data.token).to.not.be.empty;
});

pm.test("Response has user documento", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData.data).to.have.property('documento');
});

// Guardar token automáticamente
const jsonData = pm.response.json();
if (jsonData.success && jsonData.data.token) {
    pm.environment.set("current_token", jsonData.data.token);
    pm.environment.set("current_documento", jsonData.data.documento);
    console.log(`✅ Token guardado para documento: ${jsonData.data.documento}`);
}
```

#### **Para GET /veterinarias (Admin):**
```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("All veterinarias belong to current admin", () => {
    const jsonData = pm.response.json();
    const adminDocumento = pm.environment.get("admin_documento");
    
    if (jsonData.data && Array.isArray(jsonData.data)) {
        jsonData.data.forEach(vet => {
            pm.expect(vet.creado_por_documento).to.equal(adminDocumento);
        });
    }
});
```

#### **Para GET /mascotas/propietario/{documento} (Cliente):**
```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("All mascotas belong to current client", () => {
    const jsonData = pm.response.json();
    const clienteDocumento = pm.environment.get("cliente_documento");
    
    if (jsonData.data && Array.isArray(jsonData.data)) {
        jsonData.data.forEach(mascota => {
            pm.expect(mascota.propietarioDocumento).to.equal(clienteDocumento);
        });
    }
});
```

#### **Para POST /citas (validar documentos):**
```javascript
pm.test("Status code is 200", () => {
    pm.response.to.have.status(200);
});

pm.test("Cita has correct documentos", () => {
    const jsonData = pm.response.json();
    const requestBody = JSON.parse(pm.request.body.raw);
    
    pm.expect(jsonData.data.clienteDocumento).to.equal(requestBody.clienteDocumento);
    pm.expect(jsonData.data.veterinarioDocumento).to.equal(requestBody.veterinarioDocumento);
});
```

#### **Para Error 403 (Acceso Denegado):**
```javascript
pm.test("Status code is 403", () => {
    pm.response.to.have.status(403);
});

pm.test("Error message is descriptive", () => {
    const jsonData = pm.response.json();
    pm.expect(jsonData.success).to.be.false;
    pm.expect(jsonData.message).to.not.be.empty;
});
```

---

## 📌 **MEJORES PRÁCTICAS**

### **🔐 Gestión de Tokens:**
1. Siempre guardar tokens después del login en variables de entorno
2. Usar variables diferentes para cada rol (admin_token, vet_token, recep_token, client_token)
3. Renovar tokens antes de que expiren
4. No compartir tokens entre ambientes (dev/prod)

### **📝 Documentación de Pruebas:**
1. Nombrar requests de forma descriptiva: "Admin - Crear Veterinaria"
2. Agrupar requests por rol y funcionalidad
3. Documentar valores esperados en la descripción
4. Incluir ejemplos de respuestas exitosas y errores

### **🧪 Orden de Ejecución:**
1. **Setup:** Crear datos necesarios (usuarios, veterinarias)
2. **Tests Positivos:** Validar funcionamiento correcto
3. **Tests Negativos:** Validar manejo de errores
4. **Cleanup:** Eliminar datos de prueba (opcional)

### **✅ Validaciones Importantes:**
1. Siempre validar que el código de estado HTTP sea el esperado
2. Validar estructura de la respuesta JSON
3. Validar que los documentos en relaciones sean correctos
4. Validar que los filtros por documento funcionen correctamente
5. Validar que los permisos por rol se respeten (403 cuando corresponda)

### **🎯 Casos de Prueba Críticos:**
1. ✅ Login y autenticación por cada rol
2. ✅ Filtrado de veterinarias por creado_por_documento (Admin)
3. ✅ Acceso restringido a veterinaria propia (Veterinario)
4. ✅ Acceso solo a clientes atendidos (Veterinario)
5. ✅ Acceso solo a mascotas propias (Cliente)
6. ✅ Validación de documentos en relaciones FK
7. ✅ Error 403 al intentar acceder a recursos de otros usuarios
8. ✅ Error 404 cuando documento no existe

---

## 🎯 **RESUMEN DE PRUEBAS POR ROL**

| Rol | Pruebas Exitosas (2xx) | Pruebas Error (4xx) | Total |
|-----|------------------------|---------------------|-------|
| **ADMIN** | 11 | 3 | 14 |
| **VETERINARIO** | 14 | 5 | 19 |
| **RECEPCIONISTA** | 10 | 2 | 12 |
| **CLIENTE** | 6 | 3 | 9 |
| **Documento PK** | 5 escenarios | 8 validaciones | 13 |
| **PDF** | 5 | 2 | 7 |
| **Historias Clínicas** | 5 ejemplos | 4 errores | 9 |
| **Errores Generales** | - | 15 | 15 |
| **TOTAL** | **51** | **42** | **98** |

---

## 📚 **RECURSOS ADICIONALES**

- **Código Fuente Backend:** `c:\xampp\htdocs\Backend-2.0\backend\`
- **Scripts SQL:** `DATABASE_DDL.sql`, `DATABASE_DML.sql`
- **Documentación API:** `DOCUMENTACION_COMPLETA_PET.md`
- **Variables de Entorno:** Ver sección "Configuración de Variables" arriba

---

**Documento actualizado:** 3 de diciembre de 2025  
**Sistema:** Backend Veterinaria 2.0 con documento como PK  
**Autor:** Equipo de Desarrollo
   **Resultado esperado:** Debe incluir al cliente con documento 33333333

3. **Verificar que NO puede ver clientes sin citas:**
   ```
   GET {{base_url}}/usuarios/55555555
   Authorization: Bearer {{vet_token}}
   ```
   **Resultado esperado:** 403 Forbidden

4. **Verificar restricción por rol:**
   ```
   GET {{base_url}}/usuarios/rol/ADMIN
   Authorization: Bearer {{vet_token}}
   ```
   **Resultado esperado:** 403 Forbidden

5. **Verificar restricción de veterinarias:**
   ```
   GET {{base_url}}/veterinarias
   Authorization: Bearer {{vet_token}}
   ```
   **Resultado esperado:** Solo retorna la veterinaria del veterinario (1 veterinaria)

6. **Verificar acceso denegado a otra veterinaria:**
   ```
   GET {{base_url}}/veterinarias/2
   Authorization: Bearer {{vet_token}}
   ```
   **Resultado esperado:** 403 Forbidden (si 2 no es su veterinaria)

---

**�📅 Documento creado:** 27 de octubre de 2025  
**📅 Última actualización:** 03 de diciembre de 2025  
**🔧 Para usar con:** Postman + Backend Veterinaria PET  
**🎯 Estado:** ✅ GUÍA COMPLETA Y FUNCIONAL - Incluye 4 roles (Admin, Veterinario, Recepcionista, Cliente)
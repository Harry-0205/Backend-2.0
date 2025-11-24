# 🧪 GUÍA COMPLETA DE PRUEBAS POSTMAN - Sistema Veterinaria PET

> **📅 Fecha:** 27 de octubre de 2025  
> **🎯 Propósito:** Guía paso a paso para probar todas las funcionalidades del sistema  
> **🔧 Herramienta:** Postman con colecciones preconfiguradas  

---

## 📋 **ÍNDICE**
1. [Configuración Inicial](#configuración-inicial)
2. [Importar Colecciones](#importar-colecciones)  
3. [Configurar Variables](#configurar-variables)
4. [Pruebas de Autenticación](#pruebas-de-autenticación)
5. [Pruebas por Rol](#pruebas-por-rol)
6. [Casos de Prueba Específicos](#casos-de-prueba-específicos)
7. [Validación de Errores](#validación-de-errores)
8. [Pruebas de Funcionalidad PDF](#pruebas-de-funcionalidad-pdf)

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

# Datos de Usuarios
admin_username: admin
admin_password: 123456
veterinario_username: dr.garcia
veterinario_password: 123456
cliente_username: cliente1
cliente_password: 123456

# IDs de Prueba (basados en dataBasePet.sql)
veterinaria_id: 1
mascota_id: 1
cita_id: 1
historia_id: 1
admin_documento: 12345678
vet_documento: 87654321
cliente_documento: 33333333
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

---

## 👥 **PRUEBAS POR ROL**

> **⚠️ IMPORTANTE - RESTRICCIONES DE ROL VETERINARIO:**  
> Los veterinarios tienen acceso limitado al endpoint de usuarios:
> - ✅ **Pueden ver:** Solo clientes que han atendido (tienen citas programadas)
> - ✅ **Pueden consultar:** Su propio perfil
> - ❌ **NO pueden ver:** Administradores, recepcionistas u otros veterinarios
> - ❌ **NO pueden ver:** Clientes que no han atendido
> - ✅ **Endpoint `/usuarios/rol/CLIENTE`:** Solo retorna sus clientes atendidos
> - ❌ **Endpoint `/usuarios/rol/{OTRO_ROL}`:** Acceso denegado (403)
>
> **RESTRICCIONES DE VETERINARIAS:**
> - ✅ **Pueden ver:** Solo la veterinaria donde trabajan
> - ❌ **NO pueden ver:** Otras veterinarias del sistema
> - ✅ **Endpoint `/veterinarias`:** Solo retorna su veterinaria asignada
> - ❌ **Endpoint `/veterinarias/{id}`:** Solo puede ver su veterinaria (403 para otras)

### **🔴 ADMINISTRADOR - Acceso Total**

#### **1. Gestión de Usuarios**
```
GET {{base_url}}/usuarios
Authorization: Bearer {{admin_token}}
```

**Validaciones:**
- ✅ Status: 200 OK
- ✅ Lista completa de usuarios (8 usuarios)
- ✅ Datos completos de cada usuario

#### **2. Crear Nuevo Usuario**
```
POST {{base_url}}/usuarios
Authorization: Bearer {{admin_token}}
Content-Type: application/json

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
    "roles": [{"id": 3}]
}
```

#### **3. Gestión de Veterinarias**
```
GET {{base_url}}/veterinarias
Authorization: Bearer {{admin_token}}
```

#### **4. Todas las Mascotas**
```
GET {{base_url}}/mascotas
Authorization: Bearer {{admin_token}}
```

#### **5. Todas las Citas**
```
GET {{base_url}}/citas
Authorization: Bearer {{admin_token}}
```

#### **6. Reportes y Estadísticas**
```
GET {{base_url}}/reportes
Authorization: Bearer {{admin_token}}
```

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
    "fechaConsulta": "2025-10-27T10:00:00",
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
    "veterinarioDocumento": "{{vet_documento}}"
}
```

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
    "password": "123456",
    "nombres": "Nuevo",
    "apellidos": "Usuario",
    "email": "nuevo@test.com",
    "roles": [{"id": 3}]
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

#### **11. Ver Veterinaria por ID (Su Veterinaria)**
```
GET {{base_url}}/veterinarias/1
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Puede ver su propia veterinaria

#### **12. Acceso Denegado a Otra Veterinaria**
```
GET {{base_url}}/veterinarias/2
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - No puede ver otras veterinarias

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
    "propietarioDocumento": "{{cliente_documento}}"
}
```

#### **4. Programar Nueva Cita**
```
POST {{base_url}}/citas
Authorization: Bearer {{client_token}}
Content-Type: application/json

{
    "fechaHora": "2025-11-15T14:30:00",
    "motivo": "Vacunación anual - Cita de prueba Postman",
    "observaciones": "Primera vacuna del año",
    "clienteDocumento": "{{cliente_documento}}",
    "mascotaId": 1,
    "veterinarioDocumento": "{{vet_documento}}",
    "veterinariaId": 1
}
```

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

### **Escenario 4: Restricciones de Veterinario (NUEVO)**

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

### **4. Veterinario intentando ver usuario no atendido**
```
GET {{base_url}}/usuarios/55555555
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - Veterinario no puede ver cliente que no ha atendido

### **5. Veterinario intentando consultar otros roles**
```
GET {{base_url}}/usuarios/rol/VETERINARIO
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - Veterinario solo puede consultar clientes

### **6. Veterinario intentando ver otra veterinaria**
```
GET {{base_url}}/veterinarias/2
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - Veterinario solo puede ver su veterinaria

### **7. Recurso No Encontrado**
```
GET {{base_url}}/mascotas/99999
Authorization: Bearer {{admin_token}}
```

**Validación:** ❌ Status 404 - Mascota no encontrada

### **8. Datos Inválidos**
```
POST {{base_url}}/mascotas
Authorization: Bearer {{client_token}}
Content-Type: application/json

{
    "nombre": "",
    "especie": "",
    "propietarioDocumento": "documento_inexistente"
}
```

**Validación:** ❌ Status 400 - Datos de entrada inválidos

---

## 📄 **PRUEBAS DE FUNCIONALIDAD PDF**

### **1. Descargar PDF como Cliente (Sus Mascotas)**
```
GET {{base_url}}/pdf/historia-clinica/1
Authorization: Bearer {{client_token}}
Accept: application/pdf
```

**Validaciones:**
- ✅ Status 200 - PDF generado exitosamente
- ✅ Content-Type: application/pdf
- ✅ Archivo descargable
- ✅ Solo si la mascota pertenece al cliente

### **2. Descargar PDF como Veterinario (Cualquier Mascota)**
```
GET {{base_url}}/pdf/historia-clinica-completa/2
Authorization: Bearer {{vet_token}}
Accept: application/pdf
```

### **3. Error de Acceso PDF (Cliente intentando mascota ajena)**
```
GET {{base_url}}/pdf/historia-clinica/3
Authorization: Bearer {{client_token}}
Accept: application/pdf
```

**Validación:** ❌ Status 403 - No puede descargar PDF de mascota ajena

---

## 📊 **VALIDACIÓN DE RESPUESTAS**

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

#### **Para Login:**
```javascript
pm.test("Login exitoso", function () {
    pm.response.to.have.status(200);
});

pm.test("Token presente", function () {
    const response = pm.response.json();
    pm.expect(response.token).to.be.a('string');
    pm.expect(response.token.length).to.be.above(50);
});

pm.test("Rol correcto", function () {
    const response = pm.response.json();
    pm.expect(response.roles).to.be.an('array');
    pm.expect(response.roles.length).to.be.above(0);
});
```

#### **Para Endpoints Protegidos:**
```javascript
pm.test("Acceso autorizado", function () {
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

pm.test("Mensaje de error presente", function () {
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
- [ ] Login exitoso para todos los roles
- [ ] Tokens JWT válidos y funcionales
- [ ] Roles asignados correctamente
- [ ] Acceso denegado para usuarios sin permisos
- [ ] Tokens expirados manejados correctamente

### **✅ Funcionalidades por Rol**
- [ ] **Admin:** Acceso completo a todas las funciones
- [ ] **Veterinario:** Gestión médica sin acceso administrativo  
- [ ] **Veterinario:** Solo puede ver clientes que ha atendido
- [ ] **Veterinario:** No puede ver otros veterinarios, admins o recepcionistas
- [ ] **Veterinario:** Puede ver su propio perfil
- [ ] **Veterinario:** Puede consultar rol CLIENTE pero solo sus clientes atendidos
- [ ] **Veterinario:** Acceso denegado a consultar otros roles (ADMIN, VETERINARIO, etc.)
- [ ] **Veterinario:** Solo puede ver la veterinaria donde trabaja
- [ ] **Veterinario:** Acceso denegado a ver otras veterinarias (403)
- [ ] **Recepcionista:** Gestión de citas y clientes
- [ ] **Cliente:** Solo acceso a sus propios datos

### **✅ CRUD Operations**
- [ ] Crear recursos (POST) según permisos
- [ ] Leer recursos (GET) según permisos
- [ ] Actualizar recursos (PUT) según permisos
- [ ] Eliminar recursos (DELETE) según permisos

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
       "clienteDocumento": "33333333",
       "veterinarioDocumento": "87654321",
       "mascotaId": 1,
       ...
   }
   ```

2. **Verificar que el veterinario puede ver al cliente:**
   ```
   GET {{base_url}}/usuarios
   Authorization: Bearer {{vet_token}}
   ```
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
**📅 Última actualización:** 03 de noviembre de 2025  
**🔧 Para usar con:** Postman + Backend Veterinaria PET  
**🎯 Estado:** ✅ GUÍA COMPLETA Y FUNCIONAL CON RESTRICCIONES DE SEGURIDAD ACTUALIZADAS
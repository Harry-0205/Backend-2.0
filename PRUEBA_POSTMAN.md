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
9. [Formato Completo para Crear Usuarios en Postman](#formato-completo-para-crear-usuarios-en-postman)

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
admin_password: admin123
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
    "roles": ["ROLE_CLIENTE"]
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

#### **1. Ver Mascotas (Permitido)**
```
GET {{base_url}}/mascotas
Authorization: Bearer {{vet_token}}
```

**Validación:** ✅ Status 200 - Veterinario puede ver todas las mascotas

#### **2. Ver Citas Asignadas**
```
GET {{base_url}}/citas/veterinario/{{vet_documento}}
Authorization: Bearer {{vet_token}}
```

#### **3. Crear Historia Clínica**
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

#### **5. Acceso Denegado a Gestión de Usuarios**
```
GET {{base_url}}/usuarios
Authorization: Bearer {{vet_token}}
```

**Validación:** ❌ Status 403 - Veterinario no puede gestionar usuarios

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

### **3. Acceso Sin Permisos**
```
GET {{base_url}}/usuarios
Authorization: Bearer {{client_token}}
```

**Validación:** ❌ Status 403 - Acceso denegado

### **4. Recurso No Encontrado**
```
GET {{base_url}}/mascotas/99999
Authorization: Bearer {{admin_token}}
```

**Validación:** ❌ Status 404 - Mascota no encontrada

### **5. Datos Inválidos**
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

## 🆕 **FORMATO COMPLETO PARA CREAR USUARIOS EN POSTMAN**

### **📋 Configuración del Request**

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

pm.test("Respuesta contiene datos del usuario", function () {
    const response = pm.response.json();
    pm.expect(response.documento).to.be.a('string');
    pm.expect(response.username).to.be.a('string');
    pm.expect(response.roles).to.be.an('array');
    pm.expect(response.roles.length).to.be.above(0);
});

pm.test("Usuario está activo", function () {
    const response = pm.response.json();
    pm.expect(response.activo).to.be.true;
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

**📅 Documento creado:** 27 de octubre de 2025  
**🔧 Para usar con:** Postman + Backend Veterinaria PET  
**🎯 Estado:** ✅ GUÍA COMPLETA Y FUNCIONAL
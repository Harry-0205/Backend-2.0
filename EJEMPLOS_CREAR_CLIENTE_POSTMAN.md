# 📋 Ejemplos Completos para Crear Cliente en Postman

## ✅ SOLUCIÓN APLICADA

Se ha corregido el `UsuarioController` para que **automáticamente hashee las contraseñas** cuando se crean o actualizan usuarios mediante el endpoint `/api/usuarios`.

---

## 🎯 Método 1: Registro Público (RECOMENDADO para Clientes)

### **Endpoint:** `POST /api/auth/signup`
- ✅ No requiere autenticación
- ✅ Hashea automáticamente la contraseña
- ✅ Valida username y email únicos
- ⚠️ Usa `"role"` (singular)

### **Configuración en Postman:**

1. **Method:** `POST`
2. **URL:** `http://localhost:8080/api/auth/signup`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body (raw - JSON):**

```json
{
    "documento": "98765432",
    "tipoDocumento": "CC",
    "username": "cliente_nuevo",
    "email": "cliente.nuevo@email.com",
    "password": "password123",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez González",
    "telefono": "3001234567",
    "direccion": "Calle 123 #45-67",
    "role": ["CLIENTE"]
}
```

### **Respuesta Esperada (200 OK):**
```json
{
    "message": "User registered successfully!"
}
```

### **Errores Comunes:**

❌ **Error: "Username is already taken!"**
- **Causa:** El username ya existe en la base de datos
- **Solución:** Cambiar el username a uno único

❌ **Error: "Email is already in use!"**
- **Causa:** El email ya está registrado
- **Solución:** Usar un email diferente

❌ **Error: Usar "roles" (plural)**
```json
{
    "roles": ["CLIENTE"]  // ❌ INCORRECTO para /auth/signup
}
```
**Correcto:**
```json
{
    "role": ["CLIENTE"]  // ✅ CORRECTO
}
```

---

## 🎯 Método 2: Crear Usuario como Admin

### **Endpoint:** `POST /api/usuarios`
- ⚠️ Requiere autenticación como ADMIN
- ✅ Hashea automáticamente la contraseña (CORREGIDO)
- ✅ Permite crear cualquier tipo de usuario
- ✅ Permite especificar más campos
- ⚠️ Usa `"roles"` (plural)

### **PASO 1: Login como Admin**

1. **Method:** `POST`
2. **URL:** `http://localhost:8080/api/auth/signin`
3. **Headers:**
   ```
   Content-Type: application/json
   ```
4. **Body:**
```json
{
    "username": "admin",
    "password": "123456"
}
```

5. **Copiar el token** de la respuesta

### **PASO 2: Crear Cliente**

1. **Method:** `POST`
2. **URL:** `http://localhost:8080/api/usuarios`
3. **Headers:**
   ```
   Content-Type: application/json
   Authorization: Bearer eyJhbGciOiJIUzUxMiJ9...  (pegar tu token aquí)
   ```
4. **Body (raw - JSON):**

```json
{
    "documento": "12345678",
    "tipoDocumento": "CC",
    "username": "juanperez",
    "email": "juan.perez@email.com",
    "password": "securePass123",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "direccion": "Calle 45 #23-67",
    "fechaNacimiento": "1985-06-15",
    "activo": true,
    "roles": ["ROLE_CLIENTE"]
}
```

### **Respuesta Esperada (200 OK):**
```json
{
    "documento": "12345678",
    "username": "juanperez",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "email": "juan.perez@email.com",
    "telefono": "3001234567",
    "direccion": "Calle 45 #23-67",
    "tipoDocumento": "CC",
    "fechaNacimiento": "1985-06-15",
    "fechaRegistro": "2025-10-28T15:30:00",
    "activo": true,
    "roles": ["ROLE_CLIENTE"]
}
```

---

## 🔍 Validar el Campo Roles en la Base de Datos

Antes de crear usuarios, verifica que los roles existan:

```sql
SELECT * FROM roles;
```

**Salida esperada:**
```
+----+-------------------+
| id | nombre            |
+----+-------------------+
|  1 | ROLE_ADMIN        |
|  2 | ROLE_RECEPCIONISTA|
|  3 | ROLE_CLIENTE      |
|  4 | ROLE_VETERINARIO  |
+----+-------------------+
```

**Importante:** El nombre del rol debe coincidir **exactamente** con el valor en la base de datos.

---

## 📝 Plantillas para Diferentes Tipos de Usuarios

### 👤 Cliente (usando /auth/signup)
```json
{
    "documento": "11111111",
    "tipoDocumento": "CC",
    "username": "maria.gomez",
    "email": "maria.gomez@email.com",
    "password": "maria123",
    "nombres": "María",
    "apellidos": "Gómez Rodríguez",
    "telefono": "3109876543",
    "direccion": "Carrera 7 #15-30",
    "role": ["CLIENTE"]
}
```

### 👨‍⚕️ Veterinario (usando /api/usuarios con token admin)
```json
{
    "documento": "22222222",
    "tipoDocumento": "CC",
    "username": "dr.martinez",
    "email": "dr.martinez@veterinaria.com",
    "password": "vet123",
    "nombres": "Carlos",
    "apellidos": "Martínez López",
    "telefono": "3201234567",
    "direccion": "Avenida 68 #40-50",
    "fechaNacimiento": "1980-03-20",
    "activo": true,
    "roles": ["ROLE_VETERINARIO"]
}
```

### 👔 Recepcionista (usando /api/usuarios con token admin)
```json
{
    "documento": "33333333",
    "tipoDocumento": "CC",
    "username": "laura.perez",
    "email": "laura.perez@veterinaria.com",
    "password": "recep123",
    "nombres": "Laura",
    "apellidos": "Pérez Sánchez",
    "telefono": "3155551234",
    "direccion": "Calle 100 #20-15",
    "fechaNacimiento": "1995-08-10",
    "activo": true,
    "roles": ["ROLE_RECEPCIONISTA"]
}
```

### 👑 Administrador (usando /api/usuarios con token admin)
```json
{
    "documento": "44444444",
    "tipoDocumento": "CC",
    "username": "admin2",
    "email": "admin2@veterinaria.com",
    "password": "admin123",
    "nombres": "Pedro",
    "apellidos": "Rodríguez García",
    "telefono": "3007778899",
    "direccion": "Carrera 15 #80-25",
    "fechaNacimiento": "1975-12-05",
    "activo": true,
    "roles": ["ROLE_ADMIN"]
}
```

---

## ⚠️ Errores Comunes y Soluciones

### Error 1: JSON Parse Error (Tu error original)

**Error completo:**
```json
{
    "timestamp": "2025-10-28T15:05:43.0844168",
    "status": 500,
    "error": "Internal Server Error",
    "message": "JSON parse error: Cannot deserialize value of type `java.lang.String` from Object value (token `JsonToken.START_OBJECT`)",
    "path": "/api/usuarios"
}
```

**Causas posibles:**

#### ❌ Causa 1: Roles como objetos
```json
{
    "roles": [
        {
            "id": 3,
            "nombre": "ROLE_CLIENTE"
        }
    ]
}
```
**✅ Solución:**
```json
{
    "roles": ["ROLE_CLIENTE"]
}
```

#### ❌ Causa 2: Fecha como objeto
```json
{
    "fechaNacimiento": {
        "year": 1990,
        "month": 1,
        "day": 15
    }
}
```
**✅ Solución:**
```json
{
    "fechaNacimiento": "1990-01-15"
}
```

#### ❌ Causa 3: tipoDocumento como objeto
```json
{
    "tipoDocumento": {
        "tipo": "CC"
    }
}
```
**✅ Solución:**
```json
{
    "tipoDocumento": "CC"
}
```

---

### Error 2: 403 Forbidden

**Causa:** No tienes permisos o no enviaste el token

**Solución:**
1. Hacer login como ADMIN
2. Copiar el token de la respuesta
3. Agregarlo en el header: `Authorization: Bearer TOKEN_AQUI`

---

### Error 3: 400 Bad Request

**Posibles causas:**
- Falta un campo requerido
- Formato de email inválido
- Contraseña muy corta (mínimo 6 caracteres)
- Username muy corto (mínimo 3 caracteres)

**Solución:** Verifica que todos los campos requeridos estén presentes:
- ✅ documento
- ✅ username
- ✅ email
- ✅ password
- ✅ nombres
- ✅ apellidos
- ✅ roles (o role según el endpoint)

---

## 🧪 Prueba Completa Paso a Paso

### **Escenario:** Crear un nuevo cliente llamado "Ana López"

#### **Paso 1: Verificar Backend**
```
GET http://localhost:8080/api/health
```
Debe responder `200 OK`

#### **Paso 2: Crear Cliente (Sin autenticación)**
```
POST http://localhost:8080/api/auth/signup
Content-Type: application/json

{
    "documento": "55555555",
    "tipoDocumento": "CC",
    "username": "ana.lopez",
    "email": "ana.lopez@email.com",
    "password": "ana123456",
    "nombres": "Ana María",
    "apellidos": "López García",
    "telefono": "3112223344",
    "direccion": "Calle 50 #30-20",
    "role": ["CLIENTE"]
}
```

**Respuesta esperada:**
```json
{
    "message": "User registered successfully!"
}
```

#### **Paso 3: Verificar Login del Cliente**
```
POST http://localhost:8080/api/auth/signin
Content-Type: application/json

{
    "username": "ana.lopez",
    "password": "ana123456"
}
```

**Respuesta esperada:**
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "username": "ana.lopez",
    "documento": "55555555",
    "email": "ana.lopez@email.com",
    "roles": ["ROLE_CLIENTE"]
}
```

---

## 📊 Verificación en Base de Datos

Después de crear el usuario, verifica en MySQL:

```sql
-- Ver el usuario creado
SELECT * FROM usuarios WHERE documento = '55555555';

-- Ver sus roles
SELECT u.documento, u.username, u.email, r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.documento = '55555555';

-- Verificar que la contraseña esté hasheada
SELECT documento, username, 
       LEFT(password, 20) as password_hash,
       LENGTH(password) as password_length
FROM usuarios 
WHERE documento = '55555555';
```

**Resultado esperado:**
- `password_hash` debe empezar con `$2a$` (BCrypt)
- `password_length` debe ser ~60 caracteres

---

## 🎓 Resumen de Endpoints

| Endpoint | Auth | Campo Roles | Hashea Password | Uso Recomendado |
|----------|------|-------------|-----------------|-----------------|
| `POST /api/auth/signup` | ❌ No | `role` (singular) | ✅ Sí | Registro de clientes |
| `POST /api/usuarios` | ✅ Admin | `roles` (plural) | ✅ Sí | Crear cualquier usuario |

---

**✅ Problema Resuelto:** El `UsuarioController` ahora hashea correctamente las contraseñas.

**📅 Fecha:** 28 de octubre de 2025  
**🔧 Versión:** 1.0.1

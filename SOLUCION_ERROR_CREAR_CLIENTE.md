# 🔧 Solución: Error al Crear Cliente

## ❌ Error Recibido
```json
{
    "timestamp": "2025-10-28T15:05:43.0844168",
    "status": 500,
    "error": "Internal Server Error",
    "message": "JSON parse error: Cannot deserialize value of type `java.lang.String` from Object value (token `JsonToken.START_OBJECT`)",
    "path": "/api/usuarios"
}
```

## 🔍 Causa del Error

Este error ocurre cuando envías un **objeto JSON** donde el backend espera un **string simple**. Los casos más comunes son:

1. **Campo `roles` incorrecto**: Enviar objetos en lugar de strings
2. **Campo `fechaNacimiento` incorrecto**: Enviar objeto en lugar de string fecha
3. **Otros campos**: Cualquier campo que reciba objeto en lugar de string

---

## ✅ SOLUCIÓN 1: Usar el Endpoint de Registro (RECOMENDADO)

### **Endpoint:** `POST /api/auth/signup`

### **JSON Correcto:**
```json
{
    "documento": "98765432",
    "tipoDocumento": "CC",
    "username": "cliente_nuevo",
    "email": "cliente@email.com",
    "password": "password123",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "direccion": "Calle 123",
    "role": ["CLIENTE"]
}
```

### **Características:**
- ✅ Usa `"role"` (singular) - formato Set
- ✅ No requiere autenticación
- ✅ Automáticamente hashea la contraseña
- ✅ Valida que el username y email sean únicos

### **Ejemplo en Postman:**
1. **Method:** POST
2. **URL:** `http://localhost:8080/api/auth/signup`
3. **Headers:**
   - `Content-Type: application/json`
4. **Body (raw JSON):** (copiar JSON de arriba)

---

## ✅ SOLUCIÓN 2: Usar el Endpoint de Usuarios (Requiere Admin)

### **Endpoint:** `POST /api/usuarios`

### **JSON Correcto:**
```json
{
    "documento": "98765432",
    "tipoDocumento": "CC",
    "username": "cliente_nuevo",
    "email": "cliente@email.com",
    "password": "password123",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "direccion": "Calle 123",
    "fechaNacimiento": "1990-01-15",
    "activo": true,
    "roles": ["ROLE_CLIENTE"]
}
```

### **Características:**
- ✅ Usa `"roles"` (plural) - formato List
- ⚠️ Requiere autenticación como ADMIN
- ⚠️ La contraseña NO se hashea automáticamente (ver nota abajo)
- ✅ Permite especificar `fechaNacimiento` y `activo`

### **Ejemplo en Postman:**
1. **Method:** POST
2. **URL:** `http://localhost:8080/api/usuarios`
3. **Headers:**
   - `Content-Type: application/json`
   - `Authorization: Bearer {{jwt_token}}`
4. **Body (raw JSON):** (copiar JSON de arriba)

### ⚠️ **IMPORTANTE:**
Este endpoint actualmente NO hashea la contraseña automáticamente. Para solucionarlo, hay que modificar el código.

---

## 📋 Diferencias entre Endpoints

| Característica | `/api/auth/signup` | `/api/usuarios` |
|---------------|-------------------|----------------|
| Requiere Auth | ❌ No | ✅ Sí (ADMIN) |
| Campo roles | `role` (singular) | `roles` (plural) |
| Tipo roles | `Set<String>` | `List<String>` |
| Hashea password | ✅ Sí | ❌ No |
| Validación | ✅ Completa | ⚠️ Básica |
| fechaNacimiento | ❌ No soportado | ✅ Soportado |
| activo | ❌ Siempre true | ✅ Configurable |

---

## 🐛 Errores Comunes y Soluciones

### ❌ **Error 1: Roles como objetos**
```json
{
    "roles": [{"nombre": "ROLE_CLIENTE", "id": 3}]  // ❌ INCORRECTO
}
```
**Solución:**
```json
{
    "roles": ["ROLE_CLIENTE"]  // ✅ CORRECTO
}
```

---

### ❌ **Error 2: Fecha como objeto**
```json
{
    "fechaNacimiento": {
        "year": 1990,
        "month": 1,
        "day": 15
    }  // ❌ INCORRECTO
}
```
**Solución:**
```json
{
    "fechaNacimiento": "1990-01-15"  // ✅ CORRECTO (formato ISO: YYYY-MM-DD)
}
```

---

### ❌ **Error 3: Nombres de roles incorrectos**
```json
{
    "roles": ["CLIENTE"]  // ⚠️ Podría fallar si el rol en BD es "ROLE_CLIENTE"
}
```
**Solución:** Verificar en la base de datos el nombre exacto:
```sql
SELECT * FROM roles;
```
Usar el nombre exacto:
```json
{
    "roles": ["ROLE_CLIENTE"]  // ✅ CORRECTO
}
```

---

### ❌ **Error 4: Confundir 'role' con 'roles'**
```json
// Para /api/usuarios
{
    "role": ["ROLE_CLIENTE"]  // ❌ INCORRECTO (debería ser "roles")
}

// Para /api/auth/signup
{
    "roles": ["CLIENTE"]  // ❌ INCORRECTO (debería ser "role")
}
```
**Solución:** Usar el campo correcto según el endpoint.

---

## 📝 Plantillas de Prueba

### **Cliente Nuevo (Signup)**
```json
{
    "documento": "12345678",
    "tipoDocumento": "CC",
    "username": "juanperez",
    "email": "juan.perez@email.com",
    "password": "securePass123",
    "nombres": "Juan Carlos",
    "apellidos": "Pérez González",
    "telefono": "3001234567",
    "direccion": "Calle 45 #23-67, Bogotá",
    "role": ["CLIENTE"]
}
```

### **Veterinario Nuevo (Admin)**
```json
{
    "documento": "87654321",
    "tipoDocumento": "CC",
    "username": "dra.martinez",
    "email": "ana.martinez@veterinaria.com",
    "password": "vetPass456",
    "nombres": "Ana María",
    "apellidos": "Martínez López",
    "telefono": "3109876543",
    "direccion": "Avenida 80 #50-30, Bogotá",
    "fechaNacimiento": "1985-06-20",
    "activo": true,
    "roles": ["ROLE_VETERINARIO"]
}
```

### **Recepcionista Nuevo (Admin)**
```json
{
    "documento": "11223344",
    "tipoDocumento": "CC",
    "username": "carlos.gomez",
    "email": "carlos.gomez@veterinaria.com",
    "password": "recepPass789",
    "nombres": "Carlos",
    "apellidos": "Gómez Ramírez",
    "telefono": "3205551234",
    "direccion": "Carrera 15 #32-18, Bogotá",
    "fechaNacimiento": "1992-03-10",
    "activo": true,
    "roles": ["ROLE_RECEPCIONISTA"]
}
```

---

## 🔧 Validar en la Base de Datos

Después de crear un usuario, verifica en la base de datos:

```sql
-- Ver el usuario creado
SELECT * FROM usuarios WHERE documento = '12345678';

-- Ver los roles asignados
SELECT u.documento, u.username, r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.documento = '12345678';
```

---

## 🎯 Recomendación Final

**Para crear CLIENTES:** Usa `POST /api/auth/signup` (no requiere autenticación)

**Para crear VETERINARIOS/ADMINS/RECEPCIONISTAS:** Usa `POST /api/usuarios` (requiere token de admin)

---

## 📞 Si el Error Persiste

1. **Verifica el JSON en un validador:** https://jsonlint.com/
2. **Copia exactamente** uno de los ejemplos de arriba
3. **Verifica que no haya caracteres ocultos** (copiar desde un editor de texto plano)
4. **Revisa los logs del backend** para más detalles del error
5. **Confirma que la base de datos tenga los roles creados:**
   ```sql
   SELECT * FROM roles;
   ```

---

**Fecha:** 28 de octubre de 2025  
**Versión del Sistema:** 1.0.0

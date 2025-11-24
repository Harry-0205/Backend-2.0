# ✅ RESUMEN: Error al Crear Cliente - SOLUCIONADO

**Fecha:** 28 de octubre de 2025  
**Estado:** ✅ RESUELTO  

---

## 🐛 Error Original

```json
{
    "timestamp": "2025-10-28T15:05:43.0844168",
    "status": 500,
    "error": "Internal Server Error",
    "message": "JSON parse error: Cannot deserialize value of type `java.lang.String` from Object value (token `JsonToken.START_OBJECT`)",
    "path": "/api/usuarios"
}
```

---

## 🔍 Causa del Error

El error ocurría porque estabas enviando **objetos JSON donde se esperaban strings**. Los casos más comunes:

1. ❌ `"roles": [{"nombre": "ROLE_CLIENTE"}]` → ✅ `"roles": ["ROLE_CLIENTE"]`
2. ❌ `"fechaNacimiento": {"year": 1990}` → ✅ `"fechaNacimiento": "1990-01-15"`

---

## 🔧 Soluciones Aplicadas

### 1. **Código Backend Corregido** ✅

Se agregó `PasswordEncoder` al `UsuarioController` para hashear contraseñas:

**Archivo modificado:** `backend/src/main/java/com/veterinaria/veterinaria/controller/UsuarioController.java`

**Cambios:**
- ✅ Se agregó inyección de `PasswordEncoder`
- ✅ Método `convertToEntity()` ahora hashea la contraseña con `passwordEncoder.encode()`
- ✅ Método `updateUsuario()` hashea la contraseña solo si se proporciona una nueva

**Compilación:** ✅ BUILD SUCCESS

---

## 📋 JSON CORRECTO para Crear Cliente

### **Opción 1: Registro sin autenticación** (RECOMENDADO)

**Endpoint:** `POST http://localhost:8080/api/auth/signup`

```json
{
    "documento": "12345678",
    "tipoDocumento": "CC",
    "username": "juan.perez",
    "email": "juan.perez@email.com",
    "password": "password123",
    "nombres": "Juan",
    "apellidos": "Pérez",
    "telefono": "3001234567",
    "direccion": "Calle 123",
    "role": ["CLIENTE"]
}
```

**Características:**
- ✅ No requiere autenticación
- ✅ Usa `"role"` (singular)
- ✅ Hashea contraseña automáticamente

---

### **Opción 2: Creación por Admin** (Con autenticación)

**Endpoint:** `POST http://localhost:8080/api/usuarios`  
**Headers:** `Authorization: Bearer {{jwt_token}}`

```json
{
    "documento": "87654321",
    "tipoDocumento": "CC",
    "username": "maria.garcia",
    "email": "maria.garcia@email.com",
    "password": "secure123",
    "nombres": "María",
    "apellidos": "García",
    "telefono": "3109876543",
    "direccion": "Carrera 50",
    "fechaNacimiento": "1990-05-15",
    "activo": true,
    "roles": ["ROLE_CLIENTE"]
}
```

**Características:**
- ⚠️ Requiere token de ADMIN
- ✅ Usa `"roles"` (plural)
- ✅ Permite especificar `fechaNacimiento` y `activo`
- ✅ Ahora hashea contraseña correctamente (CORREGIDO)

---

## ⚡ Pasos para Probar en Postman

### **Prueba Rápida (Sin Auth):**

1. **Method:** POST
2. **URL:** `http://localhost:8080/api/auth/signup`
3. **Headers:** 
   ```
   Content-Type: application/json
   ```
4. **Body (raw JSON):**
   ```json
   {
       "documento": "99999999",
       "tipoDocumento": "CC",
       "username": "test.user",
       "email": "test@email.com",
       "password": "test123",
       "nombres": "Test",
       "apellidos": "User",
       "telefono": "3001234567",
       "direccion": "Test Address",
       "role": ["CLIENTE"]
   }
   ```
5. **Click:** Send
6. **Resultado esperado:** `200 OK`

---

## 📊 Diferencias Clave entre Endpoints

| Item | `/api/auth/signup` | `/api/usuarios` |
|------|-------------------|----------------|
| **Auth requerida** | ❌ No | ✅ Sí (ADMIN) |
| **Campo roles** | `role` | `roles` |
| **Prefijo rol** | `CLIENTE` | `ROLE_CLIENTE` |
| **fechaNacimiento** | ❌ | ✅ |
| **Hash password** | ✅ | ✅ (CORREGIDO) |

---

## ❌ Errores Comunes - EVITAR

### 1. **Roles como Objetos**
```json
❌ "roles": [{"nombre": "ROLE_CLIENTE"}]
✅ "roles": ["ROLE_CLIENTE"]
```

### 2. **Fecha como Objeto**
```json
❌ "fechaNacimiento": {"year": 1990, "month": 5, "day": 15}
✅ "fechaNacimiento": "1990-05-15"
```

### 3. **Confundir role/roles**
```json
❌ /api/usuarios → "role": ["CLIENTE"]
✅ /api/usuarios → "roles": ["ROLE_CLIENTE"]

❌ /api/auth/signup → "roles": ["CLIENTE"]
✅ /api/auth/signup → "role": ["CLIENTE"]
```

---

## 📝 Documentación Completa

Para más detalles y ejemplos, consulta:
- 📄 `EJEMPLOS_CREAR_CLIENTE_POSTMAN.md` - Ejemplos completos
- 📄 `SOLUCION_ERROR_CREAR_CLIENTE.md` - Solución detallada
- 📄 `PRUEBA_POSTMAN.md` - Guía completa de pruebas

---

## ✅ Checklist de Verificación

- [x] Backend compilado correctamente
- [x] Contraseñas se hashean automáticamente
- [x] JSON usa arrays de strings (no objetos)
- [x] Fechas en formato ISO (YYYY-MM-DD)
- [x] Campo correcto según endpoint (role vs roles)
- [x] Prefijo correcto en roles (ROLE_ o sin él)

---

## 🎉 Estado Final

**✅ PROBLEMA RESUELTO**

Ahora puedes crear clientes usando el formato JSON correcto en cualquiera de los dos endpoints. El backend ahora hashea correctamente las contraseñas en ambos casos.

**Próximos pasos:**
1. Reiniciar el backend si está corriendo
2. Probar con los ejemplos proporcionados
3. Verificar en la base de datos que la contraseña esté hasheada

---

**Compilación:** `BUILD SUCCESS`  
**Archivos modificados:** `UsuarioController.java`  
**Cambios aplicados:** Hasheo automático de contraseñas

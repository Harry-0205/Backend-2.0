# 🚨 PROBLEMA: Usuario Admin sin Roles

## ❌ Síntoma del Problema

Al hacer login como admin, la respuesta muestra un **array de roles vacío**:

```json
{
    "documento": "12345678",
    "username": "admin",
    "email": "admin@veterinaria.com",
    "roles": [],  // ❌ VACÍO - PROBLEMA
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer"
}
```

**Respuesta esperada:**
```json
{
    "documento": "12345678",
    "username": "admin",
    "email": "admin@veterinaria.com",
    "roles": ["ROLE_ADMIN"],  // ✅ CORRECTO
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer"
}
```

---

## 🔍 Causa del Problema

El usuario `admin` existe en la tabla `usuarios`, pero **NO tiene ningún rol asignado** en la tabla `usuarios_roles`.

---

## ✅ SOLUCIÓN RÁPIDA

### **Opción 1: Ejecutar SQL en MySQL Workbench o phpMyAdmin**

Ejecuta este script SQL:

```sql
-- Verificar el problema
SELECT 
    u.documento,
    u.username,
    r.nombre as rol
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- Si la columna "rol" está vacía, ejecutar esto:

-- SOLUCIÓN: Asignar rol ADMIN
INSERT INTO usuarios_roles (usuario_documento, rol_id)
VALUES ('12345678', 1)
ON DUPLICATE KEY UPDATE usuario_documento = usuario_documento;

-- Verificar que se asignó correctamente
SELECT 
    u.documento,
    u.username,
    r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';
```

---

### **Opción 2: Script SQL Completo y Seguro**

```sql
-- =====================================================
-- SOLUCIÓN: Asignar Rol ADMIN al usuario admin
-- =====================================================

-- 1. Verificar que el rol ADMIN existe
SELECT id, nombre FROM roles WHERE nombre = 'ROLE_ADMIN';
-- Resultado esperado: id = 1, nombre = ROLE_ADMIN

-- 2. Verificar que el usuario admin existe
SELECT documento, username FROM usuarios WHERE username = 'admin';
-- Resultado esperado: documento = 12345678, username = admin

-- 3. Asignar el rol (solo si no lo tiene)
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT '12345678', r.id
FROM roles r
WHERE r.nombre = 'ROLE_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM usuarios_roles ur
    WHERE ur.usuario_documento = '12345678'
    AND ur.rol_id = r.id
);

-- 4. Verificar que se asignó correctamente
SELECT 
    u.documento,
    u.username,
    u.email,
    r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';
```

---

### **Opción 3: Si el documento del admin es diferente**

Si el documento del admin NO es `12345678`, primero averigua cuál es:

```sql
-- Averiguar el documento del admin
SELECT documento FROM usuarios WHERE username = 'admin';

-- Luego usar ese documento en la inserción
-- Reemplaza 'TU_DOCUMENTO_ADMIN' con el valor obtenido
INSERT INTO usuarios_roles (usuario_documento, rol_id)
VALUES ('TU_DOCUMENTO_ADMIN', 1)
ON DUPLICATE KEY UPDATE usuario_documento = usuario_documento;
```

---

## 📋 Solución para TODOS los Usuarios sin Roles

Si tienes más usuarios sin roles, ejecuta esto:

```sql
-- Ver TODOS los usuarios sin roles
SELECT 
    u.documento,
    u.username,
    u.email,
    COUNT(ur.rol_id) as cantidad_roles
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
GROUP BY u.documento, u.username, u.email
HAVING cantidad_roles = 0;

-- Asignar rol CLIENTE a todos los usuarios sin rol (excepto admin)
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT u.documento, r.id
FROM usuarios u
CROSS JOIN roles r
WHERE r.nombre = 'ROLE_CLIENTE'
AND u.username != 'admin'
AND NOT EXISTS (
    SELECT 1 FROM usuarios_roles ur
    WHERE ur.usuario_documento = u.documento
);

-- Asignar rol ADMIN específicamente al admin
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT u.documento, r.id
FROM usuarios u
CROSS JOIN roles r
WHERE r.nombre = 'ROLE_ADMIN'
AND u.username = 'admin'
AND NOT EXISTS (
    SELECT 1 FROM usuarios_roles ur
    WHERE ur.usuario_documento = u.documento
    AND ur.rol_id = r.id
);
```

---

## 🧪 Verificación Después de la Solución

### **Paso 1: Verificar en la Base de Datos**

```sql
SELECT 
    u.documento,
    u.username,
    r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';
```

**Resultado esperado:**
```
+----------+----------+------------+
| documento| username | rol        |
+----------+----------+------------+
| 12345678 | admin    | ROLE_ADMIN |
+----------+----------+------------+
```

---

### **Paso 2: Probar Login en Postman**

```
POST http://localhost:8080/api/auth/signin
Content-Type: application/json

{
    "username": "admin",
    "password": "123456"
}
```

**Respuesta esperada:**
```json
{
    "token": "eyJhbGciOiJIUzUxMiJ9...",
    "type": "Bearer",
    "documento": "12345678",
    "username": "admin",
    "email": "admin@veterinaria.com",
    "roles": ["ROLE_ADMIN"]  // ✅ Ahora debe aparecer
}
```

---

## 🔄 Reiniciar el Backend (Si es necesario)

Si después de asignar los roles en la BD, el login sigue devolviendo `roles: []`, reinicia el backend:

```bash
# Detener el backend (Ctrl+C en la consola donde está corriendo)

# Iniciar nuevamente
cd c:\xampp\htdocs\Backend-2.0\backend
mvn spring-boot:run
```

---

## 📊 Verificar Todos los Usuarios y sus Roles

```sql
-- Query completa para ver todos los usuarios y sus roles
SELECT 
    u.documento,
    u.username,
    u.email,
    u.activo,
    GROUP_CONCAT(r.nombre ORDER BY r.nombre SEPARATOR ', ') as roles
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
GROUP BY u.documento, u.username, u.email, u.activo
ORDER BY u.username;
```

---

## 🎯 Prevención: Asegurar Roles en el Script Inicial

Para evitar este problema en el futuro, asegúrate de que el script `dataBasePet.sql` incluya:

```sql
-- Insertar usuarios con sus roles
INSERT INTO usuarios_roles (usuario_documento, rol_id) VALUES
('12345678', 1),  -- admin -> ROLE_ADMIN
('87654321', 4),  -- dr.garcia -> ROLE_VETERINARIO
('11223344', 2),  -- recepcionista1 -> ROLE_RECEPCIONISTA
('33333333', 3);  -- cliente1 -> ROLE_CLIENTE
```

---

## ⚠️ Casos Especiales

### **Si el ID del rol ADMIN no es 1:**

```sql
-- Averiguar el ID del rol ADMIN
SELECT id FROM roles WHERE nombre = 'ROLE_ADMIN';

-- Usar ese ID en la inserción
INSERT INTO usuarios_roles (usuario_documento, rol_id)
VALUES ('12345678', [ID_OBTENIDO]);
```

---

### **Si quieres que el admin tenga TODOS los roles:**

```sql
-- Asignar todos los roles al admin
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT '12345678', id FROM roles
WHERE NOT EXISTS (
    SELECT 1 FROM usuarios_roles ur
    WHERE ur.usuario_documento = '12345678'
    AND ur.rol_id = roles.id
);
```

---

## 📝 Resumen de Comandos Rápidos

```sql
-- 1. VERIFICAR PROBLEMA
SELECT u.username, r.nombre as rol
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- 2. SOLUCIONAR (si rol está vacío)
INSERT INTO usuarios_roles (usuario_documento, rol_id)
VALUES ('12345678', 1);

-- 3. VERIFICAR SOLUCIÓN
SELECT u.username, r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';
```

---

## ✅ Confirmación Final

Después de ejecutar el SQL:
1. ✅ Verificar en BD que el admin tenga `ROLE_ADMIN`
2. ✅ Hacer login en Postman
3. ✅ Confirmar que `roles: ["ROLE_ADMIN"]` aparece en la respuesta
4. ✅ Probar crear un usuario con el token de admin

---

**Fecha:** 28 de octubre de 2025  
**Estado:** Solución lista para aplicar

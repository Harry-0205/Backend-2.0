-- =====================================================
-- VERIFICAR DATOS EN LA BASE DE DATOS
-- =====================================================
-- Ejecuta estos queries para verificar qué datos existen
-- =====================================================

USE veterinaria_db;

-- 1. VERIFICAR MASCOTAS DISPONIBLES
SELECT '=== MASCOTAS DISPONIBLES ===' as info;
SELECT 
    id,
    nombre,
    especie,
    raza,
    propietario_documento
FROM mascotas
ORDER BY id;

-- 2. VERIFICAR VETERINARIOS DISPONIBLES
SELECT '=== VETERINARIOS DISPONIBLES ===' as info;
SELECT 
    u.documento,
    u.username,
    u.nombres,
    u.apellidos,
    u.email,
    u.activo,
    r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_VETERINARIO'
ORDER BY u.documento;

-- 3. VERIFICAR TODOS LOS USUARIOS Y SUS ROLES
SELECT '=== TODOS LOS USUARIOS ===' as info;
SELECT 
    u.documento,
    u.username,
    u.nombres,
    u.apellidos,
    GROUP_CONCAT(r.nombre) as roles
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
GROUP BY u.documento, u.username, u.nombres, u.apellidos
ORDER BY u.username;

-- 4. VERIFICAR SI EXISTE LA MASCOTA CON ID 1
SELECT '=== VERIFICAR MASCOTA ID 1 ===' as info;
SELECT * FROM mascotas WHERE id = 1;

-- 5. VERIFICAR SI EXISTE EL VETERINARIO CON DOCUMENTO 87654321
SELECT '=== VERIFICAR VETERINARIO 87654321 ===' as info;
SELECT * FROM usuarios WHERE documento = '87654321';

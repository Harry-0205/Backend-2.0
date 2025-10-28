-- =====================================================
-- VERIFICACIÓN DE ROLES DEL USUARIO ADMIN
-- =====================================================

-- 1. Ver todos los roles disponibles en el sistema
SELECT * FROM roles;

-- 2. Ver el usuario admin
SELECT documento, username, email, activo 
FROM usuarios 
WHERE username = 'admin';

-- 3. Ver los roles asignados al usuario admin
SELECT 
    u.documento,
    u.username,
    u.email,
    r.id as rol_id,
    r.nombre as rol_nombre
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- 4. Si no tiene roles, ESTE ES EL PROBLEMA
-- Resultado esperado: debe mostrar ROLE_ADMIN

-- =====================================================
-- SOLUCIÓN: Asignar rol ADMIN al usuario admin
-- =====================================================

-- Primero verificar el documento del admin
SELECT documento FROM usuarios WHERE username = 'admin';
-- El resultado debería ser: 12345678

-- Verificar el ID del rol ADMIN
SELECT id FROM roles WHERE nombre = 'ROLE_ADMIN';
-- El resultado debería ser: 1

-- ASIGNAR EL ROL ADMIN (si no lo tiene)
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT '12345678', r.id
FROM roles r
WHERE r.nombre = 'ROLE_ADMIN'
AND NOT EXISTS (
    SELECT 1 FROM usuarios_roles ur
    WHERE ur.usuario_documento = '12345678'
    AND ur.rol_id = r.id
);

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que ahora tenga el rol
SELECT 
    u.documento,
    u.username,
    r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- Resultado esperado:
-- documento  | username | rol
-- 12345678   | admin    | ROLE_ADMIN

-- =====================================================
-- SOLUCIÓN RÁPIDA: Asignar Rol ADMIN al usuario admin
-- =====================================================
-- Ejecutar este script en MySQL Workbench o phpMyAdmin
-- Base de datos: veterinaria_db
-- =====================================================

USE veterinaria_db;

-- PASO 1: Verificar el problema actual
SELECT '=== VERIFICACIÓN ACTUAL ===' as paso;
SELECT 
    u.documento,
    u.username,
    u.email,
    COALESCE(r.nombre, 'SIN ROL') as rol_actual
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- PASO 2: Asignar rol ADMIN (solo si no lo tiene)
SELECT '=== ASIGNANDO ROL ADMIN ===' as paso;
INSERT INTO usuarios_roles (usuario_documento, rol_id)
VALUES ('12345678', 1)
ON DUPLICATE KEY UPDATE usuario_documento = usuario_documento;

-- PASO 3: Verificar que se asignó correctamente
SELECT '=== VERIFICACIÓN DESPUÉS DE ASIGNAR ===' as paso;
SELECT 
    u.documento,
    u.username,
    u.email,
    r.nombre as rol_asignado
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'admin';

-- RESULTADO ESPERADO:
-- documento  | username | email                    | rol_asignado
-- 12345678   | admin    | admin@veterinaria.com   | ROLE_ADMIN

SELECT '=== ✅ SOLUCIÓN COMPLETADA ===' as resultado;
SELECT 'Ahora haz login nuevamente en Postman para verificar que roles: ["ROLE_ADMIN"] aparezca' as siguiente_paso;

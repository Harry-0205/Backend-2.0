-- Script para verificar el usuario dr.garcia
USE veterinaria;

SELECT '================================' as '';
SELECT '🔍 VERIFICACIÓN DE USUARIO dr.garcia' as '';
SELECT '================================' as '';

-- Ver información del usuario
SELECT 
    documento,
    username,
    nombres,
    apellidos,
    email,
    activo,
    'Password hash existe' as password_status
FROM usuarios 
WHERE username = 'dr.garcia';

SELECT '================================' as '';
SELECT '🎭 ROLES ASIGNADOS' as '';
SELECT '================================' as '';

-- Ver roles asignados al usuario
SELECT 
    u.username,
    u.nombres,
    u.apellidos,
    r.id as rol_id,
    r.nombre as rol_nombre,
    r.activo as rol_activo
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
WHERE u.username = 'dr.garcia';

SELECT '================================' as '';
SELECT '📋 TODOS LOS ROLES EN LA BD' as '';
SELECT '================================' as '';

-- Ver todos los roles
SELECT * FROM roles ORDER BY id;

SELECT '================================' as '';
SELECT '👥 TODOS LOS USUARIOS Y SUS ROLES' as '';
SELECT '================================' as '';

-- Ver todos los usuarios con sus roles
SELECT 
    u.username,
    u.nombres,
    GROUP_CONCAT(r.nombre SEPARATOR ', ') as roles
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
GROUP BY u.documento, u.username, u.nombres
ORDER BY u.username;

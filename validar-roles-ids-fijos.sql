-- ============================================================================
-- SCRIPT DE VALIDACIÓN DE ROLES CON IDS FIJOS
-- Descripción: Verifica que los IDs de roles sean los correctos
-- ============================================================================

USE veterinaria;

SELECT '================================' as '';
SELECT '✅ VALIDACIÓN DE ROLES' as '';
SELECT '================================' as '';

-- Verificar IDs de roles
SELECT 
    id,
    nombre,
    descripcion,
    activo,
    CASE 
        WHEN id = 1 AND nombre = 'ADMIN' THEN '✅ CORRECTO'
        WHEN id = 2 AND nombre = 'VETERINARIO' THEN '✅ CORRECTO'
        WHEN id = 3 AND nombre = 'CLIENTE' THEN '✅ CORRECTO'
        WHEN id = 4 AND nombre = 'RECEPCIONISTA' THEN '✅ CORRECTO'
        ELSE '❌ ERROR: ID NO COINCIDE'
    END as Estado
FROM roles
ORDER BY id;

SELECT '================================' as '';

-- Verificar que todos los roles existan
SELECT 
    CASE 
        WHEN (SELECT COUNT(*) FROM roles WHERE id IN (1,2,3,4)) = 4 
        THEN '✅ Todos los roles existen con IDs correctos'
        ELSE '❌ ERROR: Faltan roles o tienen IDs incorrectos'
    END as Resultado;

SELECT '================================' as '';
SELECT '📊 RESUMEN DE USUARIOS CON ROLES' as '';
SELECT '================================' as '';

-- Verificar relaciones usuarios_roles
SELECT 
    u.username as Usuario,
    u.nombres as Nombre,
    r.id as ID_Rol,
    r.nombre as Rol,
    CASE 
        WHEN r.id IN (1,2,3,4) THEN '✅ ID Válido'
        ELSE '❌ ID Inválido'
    END as Validacion
FROM usuarios u
INNER JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
INNER JOIN roles r ON ur.rol_id = r.id
ORDER BY r.id, u.username;

SELECT '================================' as '';

-- Verificar integridad de foreign keys
SELECT 
    CASE 
        WHEN NOT EXISTS (
            SELECT 1 
            FROM usuarios_roles ur 
            WHERE ur.rol_id NOT IN (SELECT id FROM roles)
        )
        THEN '✅ Todas las relaciones usuarios_roles son válidas'
        ELSE '❌ ERROR: Existen roles asignados que no existen en la tabla roles'
    END as Integridad_FK;

SELECT '================================' as '';
SELECT '🎯 VALIDACIÓN COMPLETADA' as '';
SELECT '================================' as '';

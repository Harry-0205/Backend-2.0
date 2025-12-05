-- ============================================================================
-- VERIFICACIÓN DE USUARIOS DESACTIVADOS
-- Fecha: 5 de diciembre de 2025
-- ============================================================================

USE veterinaria;

-- Ver todos los usuarios y su estado
SELECT 
    documento,
    username,
    CONCAT(nombres, ' ', apellidos) as nombre_completo,
    email,
    activo,
    CASE 
        WHEN activo = 1 THEN '✅ ACTIVO'
        WHEN activo = 0 THEN '❌ DESACTIVADO'
        ELSE '⚠️ NULL'
    END as estado
FROM usuarios
ORDER BY activo DESC, username;

-- Contar usuarios por estado
SELECT 
    CASE 
        WHEN activo = 1 THEN 'ACTIVOS'
        WHEN activo = 0 THEN 'DESACTIVADOS'
        ELSE 'SIN ESTADO'
    END as estado,
    COUNT(*) as cantidad
FROM usuarios
GROUP BY activo;

-- Ver el usuario específico que intentaste usar (dr.rodriguez)
SELECT 
    documento,
    username,
    CONCAT(nombres, ' ', apellidos) as nombre_completo,
    email,
    activo,
    fecha_registro,
    veterinaria_id
FROM usuarios
WHERE username = 'dr.rodriguez';

-- ============================================================================
-- COMANDOS PARA PRUEBAS
-- ============================================================================

-- Para DESACTIVAR un usuario:
-- UPDATE usuarios SET activo = FALSE WHERE username = 'dr.rodriguez';

-- Para ACTIVAR un usuario:
-- UPDATE usuarios SET activo = TRUE WHERE username = 'dr.rodriguez';

-- Verificar que el cambio se hizo correctamente:
-- SELECT username, activo FROM usuarios WHERE username = 'dr.rodriguez';

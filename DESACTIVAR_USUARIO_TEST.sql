-- ============================================================================
-- SCRIPT PARA DESACTIVAR Y VERIFICAR USUARIO
-- Ejecutar línea por línea para ver los resultados
-- ============================================================================

USE veterinaria;

-- 1. VER ESTADO ACTUAL del usuario
SELECT 
    username,
    activo,
    CASE 
        WHEN activo = 1 THEN '✅ ACTIVO'
        WHEN activo = 0 THEN '❌ DESACTIVADO'
        WHEN activo IS NULL THEN '⚠️ NULL (PROBLEMA!)'
    END as estado_texto
FROM usuarios
WHERE username = 'dr.rodriguez';

-- 2. DESACTIVAR el usuario (ejecutar esta línea)
UPDATE usuarios 
SET activo = 0
WHERE username = 'dr.rodriguez';

-- 3. VERIFICAR que se desactivó correctamente
SELECT 
    username,
    activo,
    CASE 
        WHEN activo = 1 THEN '✅ ACTIVO'
        WHEN activo = 0 THEN '❌ DESACTIVADO'
        WHEN activo IS NULL THEN '⚠️ NULL (PROBLEMA!)'
    END as estado_texto
FROM usuarios
WHERE username = 'dr.rodriguez';

-- RESULTADO ESPERADO: activo = 0, estado_texto = '❌ DESACTIVADO'

-- ============================================================================
-- Si el resultado es activo = 0, entonces el problema está en el BACKEND
-- Si el resultado NO es activo = 0, entonces el UPDATE no funcionó
-- ============================================================================

-- Para REACTIVAR después de las pruebas:
-- UPDATE usuarios SET activo = 1 WHERE username = 'dr.rodriguez';

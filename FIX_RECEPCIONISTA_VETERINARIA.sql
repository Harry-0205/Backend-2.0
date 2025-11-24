-- ============================================================================
-- SCRIPT PARA ASIGNAR VETERINARIA AL RECEPCIONISTA Y CLIENTES
-- ============================================================================

USE veterinaria;

-- Obtener IDs de veterinarias
SET @vet1_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Pet Care' LIMIT 1);
SET @vet2_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Central' LIMIT 1);

-- Asignar veterinaria al recepcionista
UPDATE usuarios 
SET veterinaria_id = @vet1_id
WHERE documento = '22222222' AND username = 'recepcion1';

-- Asignar veterinaria al admin
UPDATE usuarios 
SET veterinaria_id = @vet1_id
WHERE documento = '12345678' AND username = 'admin';

-- Asignar clientes a veterinarias
-- Clientes 1 y 2 a Veterinaria Pet Care
UPDATE usuarios 
SET veterinaria_id = @vet1_id
WHERE documento IN ('33333333', '44444444');

-- Clientes 3 y 4 a Veterinaria Central
UPDATE usuarios 
SET veterinaria_id = @vet2_id
WHERE documento IN ('55555555', '66666666');

-- Verificar los cambios
SELECT 
    u.documento,
    u.username,
    u.nombres,
    u.apellidos,
    r.nombre AS rol,
    u.veterinaria_id,
    v.nombre AS veterinaria_nombre
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id
LEFT JOIN veterinarias v ON u.veterinaria_id = v.id
WHERE u.documento IN ('12345678', '22222222', '33333333', '44444444', '55555555', '66666666')
ORDER BY u.documento;

SELECT 'Usuarios actualizados correctamente' AS mensaje;

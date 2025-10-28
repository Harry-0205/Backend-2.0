-- =====================================================
-- SOLUCIÓN RÁPIDA - Crear datos necesarios para historia clínica
-- =====================================================

USE veterinaria_db;

-- PASO 1: Verificar si existe la mascota con ID 1
SELECT 'Verificando mascota ID 1...' as paso;
SELECT id, nombre FROM mascotas WHERE id = 1;

-- PASO 2: Si NO existe, crear una mascota de prueba
-- (Ajusta el propietario_documento a un cliente que exista)
INSERT INTO mascotas (nombre, especie, raza, fecha_nacimiento, sexo, color, peso, propietario_documento)
SELECT 'Max', 'PERRO', 'Labrador', '2020-05-15', 'MACHO', 'Dorado', 25.5, '33333333'
WHERE NOT EXISTS (SELECT 1 FROM mascotas WHERE id = 1);

-- PASO 3: Verificar si existe el veterinario con documento 87654321
SELECT 'Verificando veterinario 87654321...' as paso;
SELECT documento, username, nombres, apellidos FROM usuarios WHERE documento = '87654321';

-- PASO 4: Verificar que el veterinario tenga el rol VETERINARIO
SELECT 'Verificando rol del veterinario...' as paso;
SELECT u.documento, u.username, r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.documento = '87654321';

-- PASO 5: Si el veterinario NO tiene el rol, asignarlo
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT '87654321', r.id
FROM roles r
WHERE r.nombre = 'ROLE_VETERINARIO'
AND EXISTS (SELECT 1 FROM usuarios WHERE documento = '87654321')
AND NOT EXISTS (
    SELECT 1 FROM usuarios_roles ur
    WHERE ur.usuario_documento = '87654321'
    AND ur.rol_id = r.id
);

-- PASO 6: Mostrar resumen de datos disponibles
SELECT '=== RESUMEN DE DATOS DISPONIBLES ===' as resumen;

SELECT 'MASCOTAS:' as tipo, id, nombre, especie FROM mascotas LIMIT 5;

SELECT 'VETERINARIOS:' as tipo, u.documento, u.username, u.nombres, u.apellidos
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE r.nombre = 'ROLE_VETERINARIO'
LIMIT 5;

-- PASO 7: JSON sugerido para usar en Postman
SELECT '=== USA ESTE JSON EN POSTMAN ===' as sugerencia;
SELECT CONCAT(
    '{\n',
    '  "fechaConsulta": "', DATE_FORMAT(NOW(), '%Y-%m-%dT%H:%i:%s'), '",\n',
    '  "motivoConsulta": "Control de rutina",\n',
    '  "diagnostico": "Saludable",\n',
    '  "peso": 25.8,\n',
    '  "temperatura": 38.5,\n',
    '  "mascota": {"id": ', MIN(m.id), '},\n',
    '  "veterinario": {"documento": "', MIN(u.documento), '"}\n',
    '}'
) as json_sugerido
FROM mascotas m
CROSS JOIN (
    SELECT u.documento
    FROM usuarios u
    JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
    JOIN roles r ON ur.rol_id = r.id
    WHERE r.nombre = 'ROLE_VETERINARIO'
    LIMIT 1
) u;

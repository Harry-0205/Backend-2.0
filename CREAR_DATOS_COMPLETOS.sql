-- =====================================================
-- CREAR DATOS DE PRUEBA PARA HISTORIA CLÍNICA
-- =====================================================
-- Este script crea todos los datos necesarios
-- =====================================================

USE veterinaria_db;

-- ===========================================
-- 1. CREAR UN CLIENTE (propietario de mascota)
-- ===========================================

-- Primero verificar si existe el rol CLIENTE
SELECT 'Verificando rol CLIENTE...' as paso;
SELECT id, nombre FROM roles WHERE nombre = 'ROLE_CLIENTE';

-- Crear usuario cliente si no existe
INSERT INTO usuarios (documento, username, password, nombres, apellidos, email, tipo_documento, activo, fecha_registro)
SELECT 
    '33333333',
    'cliente1',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjFIqPkbXFKLTsI8Y0xQPqIqPFxZs0u', -- password: 123456
    'Juan',
    'Pérez',
    'juan.perez@email.com',
    'CC',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE documento = '33333333');

-- Asignar rol CLIENTE
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT '33333333', r.id
FROM roles r
WHERE r.nombre = 'ROLE_CLIENTE'
AND NOT EXISTS (
    SELECT 1 FROM usuarios_roles 
    WHERE usuario_documento = '33333333' 
    AND rol_id = r.id
);

-- ===========================================
-- 2. CREAR UN VETERINARIO
-- ===========================================

-- Crear usuario veterinario si no existe
INSERT INTO usuarios (documento, username, password, nombres, apellidos, email, tipo_documento, activo, fecha_registro)
SELECT 
    '87654321',
    'dr.garcia',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjFIqPkbXFKLTsI8Y0xQPqIqPFxZs0u', -- password: 123456
    'Carlos',
    'García',
    'carlos.garcia@veterinaria.com',
    'CC',
    true,
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE documento = '87654321');

-- Asignar rol VETERINARIO
INSERT INTO usuarios_roles (usuario_documento, rol_id)
SELECT '87654321', r.id
FROM roles r
WHERE r.nombre = 'ROLE_VETERINARIO'
AND NOT EXISTS (
    SELECT 1 FROM usuarios_roles 
    WHERE usuario_documento = '87654321' 
    AND rol_id = r.id
);

-- ===========================================
-- 3. CREAR MASCOTAS
-- ===========================================

-- Crear mascota 1: Max (Perro)
INSERT INTO mascotas (nombre, especie, raza, fecha_nacimiento, sexo, color, peso, propietario_documento)
SELECT 
    'Max',
    'PERRO',
    'Labrador',
    '2020-05-15',
    'MACHO',
    'Dorado',
    25.5,
    '33333333'
WHERE NOT EXISTS (SELECT 1 FROM mascotas WHERE nombre = 'Max' AND propietario_documento = '33333333');

-- Crear mascota 2: Luna (Gato)
INSERT INTO mascotas (nombre, especie, raza, fecha_nacimiento, sexo, color, peso, propietario_documento)
SELECT 
    'Luna',
    'GATO',
    'Siamés',
    '2021-03-20',
    'HEMBRA',
    'Blanco',
    4.2,
    '33333333'
WHERE NOT EXISTS (SELECT 1 FROM mascotas WHERE nombre = 'Luna' AND propietario_documento = '33333333');

-- Crear mascota 3: Rocky (Perro)
INSERT INTO mascotas (nombre, especie, raza, fecha_nacimiento, sexo, color, peso, propietario_documento)
SELECT 
    'Rocky',
    'PERRO',
    'Pastor Alemán',
    '2019-08-10',
    'MACHO',
    'Negro y Café',
    32.0,
    '33333333'
WHERE NOT EXISTS (SELECT 1 FROM mascotas WHERE nombre = 'Rocky' AND propietario_documento = '33333333');

-- ===========================================
-- 4. VERIFICAR DATOS CREADOS
-- ===========================================

SELECT '========================================' as separador;
SELECT '✅ DATOS CREADOS EXITOSAMENTE' as resultado;
SELECT '========================================' as separador;

SELECT 'USUARIOS CREADOS:' as tipo;
SELECT documento, username, nombres, apellidos, email 
FROM usuarios 
WHERE documento IN ('33333333', '87654321');

SELECT 'ROLES ASIGNADOS:' as tipo;
SELECT u.documento, u.username, r.nombre as rol
FROM usuarios u
JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
JOIN roles r ON ur.rol_id = r.id
WHERE u.documento IN ('33333333', '87654321');

SELECT 'MASCOTAS CREADAS:' as tipo;
SELECT id, nombre, especie, raza, sexo, peso, propietario_documento
FROM mascotas
WHERE propietario_documento = '33333333';

-- ===========================================
-- 5. MOSTRAR IDs PARA USAR EN POSTMAN
-- ===========================================

SELECT '========================================' as separador;
SELECT '📋 USA ESTOS VALORES EN POSTMAN:' as info;
SELECT '========================================' as separador;

SELECT 
    CONCAT('ID de mascota: ', id, ' (', nombre, ')') as datos
FROM mascotas 
WHERE propietario_documento = '33333333'
ORDER BY id;

SELECT 
    CONCAT('Documento veterinario: ', documento, ' (', username, ')') as datos
FROM usuarios
WHERE documento = '87654321';

-- ===========================================
-- 6. JSON PARA COPIAR EN POSTMAN
-- ===========================================

SELECT '========================================' as separador;
SELECT '📝 JSON PARA POSTMAN (copia esto):' as info;
SELECT '========================================' as separador;

SELECT CONCAT(
    '{\n',
    '  "fechaConsulta": "2025-10-28T15:00:00",\n',
    '  "motivoConsulta": "Control de rutina",\n',
    '  "sintomas": "Ninguno aparente",\n',
    '  "diagnostico": "Paciente sano",\n',
    '  "tratamiento": "Continuar rutina normal",\n',
    '  "medicamentos": "Ninguno",\n',
    '  "peso": ', peso, ',\n',
    '  "temperatura": 38.5,\n',
    '  "frecuenciaCardiaca": 80,\n',
    '  "frecuenciaRespiratoria": 20,\n',
    '  "observaciones": "Excelente estado general",\n',
    '  "recomendaciones": "Continuar con alimentación balanceada",\n',
    '  "mascota": {\n',
    '    "id": ', id, '\n',
    '  },\n',
    '  "veterinario": {\n',
    '    "documento": "87654321"\n',
    '  }\n',
    '}'
) as JSON_PARA_POSTMAN
FROM mascotas 
WHERE propietario_documento = '33333333'
LIMIT 1;

SELECT '========================================' as separador;
SELECT '✅ AHORA PUEDES PROBAR EN POSTMAN' as resultado;
SELECT '========================================' as separador;

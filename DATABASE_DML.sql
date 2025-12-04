-- ============================================================================
-- DATABASE DML (Data Manipulation Language) - VETERINARIA
-- Fecha: 29 de octubre de 2025
-- Descripción: Datos iniciales y de ejemplo para la base de datos
-- Incluye: Roles, usuarios, veterinarias, mascotas, citas e historias clínicas
-- ============================================================================

USE veterinaria;

-- ============================================================================
-- LIMPIAR DATOS EXISTENTES (si se ejecuta nuevamente)
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM usuarios_roles;
DELETE FROM historias_clinicas;
DELETE FROM citas;
DELETE FROM mascotas;
DELETE FROM reportes;
DELETE FROM usuarios;
DELETE FROM veterinarias;
DELETE FROM roles;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================================
-- INSERCIÓN DE DATOS BÁSICOS
-- ============================================================================

-- Insertar roles con IDs fijos (no usar AUTO_INCREMENT)
INSERT INTO roles (id, nombre, descripcion, activo) VALUES
(1, 'ROLE_ADMIN', 'Administrador del sistema con acceso completo', true),
(2, 'ROLE_VETERINARIO', 'Veterinario con acceso a consultas y tratamientos', true),
(3, 'ROLE_CLIENTE', 'Cliente/propietario de mascotas', true),
(4, 'ROLE_RECEPCIONISTA', 'Personal de recepción y programación de citas', true);

-- Insertar veterinarias
INSERT INTO veterinarias (nombre, direccion, telefono, email, ciudad, descripcion, servicios, horario_atencion, activo, fecha_registro) VALUES 
('Veterinaria Pet Care', 'Calle Principal 123, Ciudad', '+57 1 234-5678', 'info@petcare.com', 'Bogotá',
 'Clínica veterinaria especializada en cuidado integral de mascotas', 
 'Consulta general, Vacunación, Cirugía, Grooming, Hospitalización, Laboratorio clínico',
 'Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 8:00 AM - 2:00 PM', true, NOW()),
('Veterinaria Central', 'Avenida Central 456, Ciudad', '+57 1 345-6789', 'info@vetcentral.com', 'Medellín',
 'Centro veterinario con servicios especializados y tecnología de punta', 
 'Consulta especializada, Diagnóstico por imágenes, Laboratorio, Cirugía especializada, Odontología',
 'Lunes a Sábado: 9:00 AM - 7:00 PM', true, NOW()),
('Clínica Veterinaria Amigos Peludos', 'Carrera 15 #30-45, Ciudad', '+57 1 456-7890', 'info@amigospeludos.com', 'Cali',
 'Tu mascota en las mejores manos - Atención personalizada', 
 'Consulta general, Vacunación, Grooming, Pet shop, Peluquería canina',
 'Lunes a Viernes: 8:00 AM - 8:00 PM, Sábados y Domingos: 10:00 AM - 4:00 PM', true, NOW());

-- Obtener IDs de veterinarias para asignar a veterinarios
SET @vet1_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Pet Care' LIMIT 1);
SET @vet2_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Central' LIMIT 1);
SET @vet3_id = (SELECT id FROM veterinarias WHERE nombre = 'Clínica Veterinaria Amigos Peludos' LIMIT 1);

-- Insertar usuarios de ejemplo
-- Contraseña para todos: admin123 (hash BCrypt)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, veterinaria_id, creado_por_documento, fecha_registro) VALUES
-- Administrador (creado por el sistema, sin creador)
('12345678', 'CC', 'admin', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Administrador', 'Sistema', 'admin@veterinaria.com', '3001234567', 'Oficina Principal', true, @vet1_id, NULL, NOW()),

-- Veterinarios (creados por el admin)
('87654321', 'CC', 'dr.garcia', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dr. Carlos', 'García López', 'carlos.garcia@veterinaria.com', '3009876543', 'Consultorio 1', true, @vet1_id, '12345678', NOW()),
('11111111', 'CC', 'dra.martinez', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dra. María', 'Martínez Rodríguez', 'maria.martinez@veterinaria.com', '3005555555', 'Consultorio 2', true, @vet2_id, '12345678', NOW()),
('99999999', 'CC', 'dr.rodriguez', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dr. Luis', 'Rodríguez Sánchez', 'luis.rodriguez@veterinaria.com', '3002222222', 'Consultorio 3', true, @vet3_id, '12345678', NOW()),

-- Clientes (creados por recepcionista o admin)
('33333333', 'CC', 'cliente1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Pedro', 'Pérez González', 'pedro.perez@email.com', '3003456789', 'Calle 10 #20-30', true, @vet1_id, '22222222', NOW()),
('44444444', 'CC', 'cliente2', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Laura', 'Gómez Ramírez', 'laura.gomez@email.com', '3009999999', 'Zona Norte #456', true, @vet1_id, '22222222', NOW()),
('55555555', 'CC', 'cliente3', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Juan', 'Ramírez López', 'juan.ramirez@email.com', '3006666666', 'Sector Sur #789', true, @vet2_id, '12345678', NOW()),
('66666666', 'CC', 'cliente4', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Sofia', 'Martín Fernández', 'sofia.martin@email.com', '3004444444', 'Zona Este #321', true, @vet2_id, '12345678', NOW()),

-- Recepcionista (creado por el admin)
('22222222', 'CC', 'recepcion1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Ana', 'González Torres', 'recepcion@veterinaria.com', '3004567890', 'Recepción', true, @vet1_id, '12345678', NOW());

-- Actualizar creado_por_documento en veterinarias (asignar al admin)
UPDATE veterinarias SET creado_por_documento = '12345678' WHERE id IN (@vet1_id, @vet2_id, @vet3_id);

-- Asignar roles a usuarios
INSERT INTO usuarios_roles (usuario_documento, rol_id) VALUES
('12345678', 1),  -- Admin -> ROLE_ADMIN
('87654321', 2),  -- Dr. García -> ROLE_VETERINARIO
('11111111', 2),  -- Dra. Martínez -> ROLE_VETERINARIO
('99999999', 2),  -- Dr. Rodríguez -> ROLE_VETERINARIO
('33333333', 3),  -- Cliente1 -> ROLE_CLIENTE
('44444444', 3),  -- Cliente2 -> ROLE_CLIENTE
('55555555', 3),  -- Cliente3 -> ROLE_CLIENTE
('66666666', 3),  -- Cliente4 -> ROLE_CLIENTE
('22222222', 4);  -- Recepcionista -> ROLE_RECEPCIONISTA

-- ============================================================================
-- INSERCIÓN DE MASCOTAS
-- ============================================================================

INSERT INTO mascotas (nombre, especie, raza, color, sexo, fecha_nacimiento, peso, observaciones, activo, propietario_documento, fecha_registro) VALUES
-- Mascotas de Pedro Pérez (Cliente1 - 33333333)
('Max', 'Perro', 'Golden Retriever', 'Dorado', 'Macho', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 28.5, 
 'Muy juguetón y amigable. Le encanta nadar.', true, '33333333', NOW()),
('Luna', 'Gato', 'Siamés', 'Crema con puntos oscuros', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 4.2, 
 'Tranquila y cariñosa. Esterilizada.', true, '33333333', NOW()),
('Rocky', 'Perro', 'Pastor Alemán', 'Negro y café', 'Macho', DATE_SUB(CURDATE(), INTERVAL 5 YEAR), 32.0, 
 'Muy protector y leal. Bien entrenado.', true, '33333333', NOW()),

-- Mascotas de Laura Gómez (Cliente2 - 44444444)
('Bella', 'Perro', 'Labrador', 'Negro', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 4 YEAR), 25.0, 
 'Obediente y cariñosa. Esterilizada.', true, '44444444', NOW()),
('Mimi', 'Gato', 'Persa', 'Blanco', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 3.5, 
 'Muy independiente. Requiere cepillado diario.', true, '44444444', NOW()),

-- Mascotas de Juan Ramírez (Cliente3 - 55555555)
('Zeus', 'Perro', 'Pastor Alemán', 'Negro y marrón', 'Macho', DATE_SUB(CURDATE(), INTERVAL 6 YEAR), 32.5, 
 'Muy protector, excelente guardián.', true, '55555555', NOW()),
('Kira', 'Gato', 'Angora', 'Blanco con manchas grises', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 3.8, 
 'Muy cariñosa y sociable.', true, '55555555', NOW()),

-- Mascotas de Sofia Martín (Cliente4 - 66666666)
('Bruno', 'Perro', 'Beagle', 'Tricolor', 'Macho', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 15.2, 
 'Enérgico y cazador. Le gusta rastrear olores.', true, '66666666', NOW()),
('Pelusa', 'Gato', 'Común Europeo', 'Naranja atigrado', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 3.2, 
 'Juguetona y activa.', true, '66666666', NOW());

-- ============================================================================
-- INSERCIÓN DE CITAS
-- ============================================================================

-- Obtener IDs de mascotas dinámicamente
SET @max_id = (SELECT id FROM mascotas WHERE nombre = 'Max' AND propietario_documento = '33333333' LIMIT 1);
SET @luna_id = (SELECT id FROM mascotas WHERE nombre = 'Luna' AND propietario_documento = '33333333' LIMIT 1);
SET @rocky_id = (SELECT id FROM mascotas WHERE nombre = 'Rocky' AND propietario_documento = '33333333' LIMIT 1);
SET @bella_id = (SELECT id FROM mascotas WHERE nombre = 'Bella' AND propietario_documento = '44444444' LIMIT 1);
SET @mimi_id = (SELECT id FROM mascotas WHERE nombre = 'Mimi' AND propietario_documento = '44444444' LIMIT 1);
SET @zeus_id = (SELECT id FROM mascotas WHERE nombre = 'Zeus' AND propietario_documento = '55555555' LIMIT 1);
SET @kira_id = (SELECT id FROM mascotas WHERE nombre = 'Kira' AND propietario_documento = '55555555' LIMIT 1);
SET @bruno_id = (SELECT id FROM mascotas WHERE nombre = 'Bruno' AND propietario_documento = '66666666' LIMIT 1);
SET @pelusa_id = (SELECT id FROM mascotas WHERE nombre = 'Pelusa' AND propietario_documento = '66666666' LIMIT 1);

-- Insertar citas programadas y completadas
INSERT INTO citas (fecha_hora, motivo, observaciones, estado, cliente_documento, mascota_id, veterinario_documento, veterinaria_id, fecha_creacion) VALUES
-- Citas completadas (pasadas)
(DATE_SUB(NOW(), INTERVAL 30 DAY), 'Vacunación anual y control', 'Primera vacuna del año', 'COMPLETADA', 
 '33333333', @max_id, '87654321', @vet1_id, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(DATE_SUB(NOW(), INTERVAL 15 DAY), 'Control post-operatorio', 'Revisión después de esterilización', 'COMPLETADA', 
 '33333333', @luna_id, '11111111', @vet2_id, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(DATE_SUB(NOW(), INTERVAL 60 DAY), 'Control geriátrico', 'Revisión de rutina para perro mayor', 'COMPLETADA', 
 '33333333', @rocky_id, '87654321', @vet1_id, DATE_SUB(NOW(), INTERVAL 60 DAY)),
(DATE_SUB(NOW(), INTERVAL 20 DAY), 'Vacunación antirrábica', 'Refuerzo anual', 'COMPLETADA', 
 '44444444', @bella_id, '11111111', @vet2_id, DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- Citas programadas (futuras)
(DATE_ADD(NOW(), INTERVAL 1 DAY), 'Control de rutina', 'Revisión general de salud', 'PROGRAMADA', 
 '33333333', @max_id, '87654321', @vet1_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 2 DAY), 'Consulta por tos', 'Ha estado tosiendo últimamente', 'CONFIRMADA', 
 '33333333', @rocky_id, '87654321', @vet1_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 3 DAY), 'Vacunación pentavalente', 'Segunda dosis', 'PROGRAMADA', 
 '44444444', @bella_id, '11111111', @vet2_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 5 DAY), 'Consulta dermatológica', 'Revisión de piel - posible alergia', 'PROGRAMADA', 
 '44444444', @mimi_id, '99999999', @vet3_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 7 DAY), 'Control de peso', 'Seguimiento de dieta', 'PROGRAMADA', 
 '55555555', @zeus_id, '87654321', @vet1_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 10 DAY), 'Vacunación triple felina', 'Primera dosis', 'PROGRAMADA', 
 '55555555', @kira_id, '11111111', @vet2_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 12 DAY), 'Chequeo general', 'Control de rutina', 'PROGRAMADA', 
 '66666666', @bruno_id, '99999999', @vet3_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 14 DAY), 'Esterilización', 'Cirugía programada', 'CONFIRMADA', 
 '66666666', @pelusa_id, '87654321', @vet1_id, NOW());

-- ============================================================================
-- INSERCIÓN DE HISTORIAS CLÍNICAS
-- ============================================================================

INSERT INTO historias_clinicas (mascota_id, veterinario_documento, fecha_consulta, motivo_consulta, diagnostico, tratamiento, medicamentos, observaciones, recomendaciones, peso, temperatura, frecuencia_cardiaca, frecuencia_respiratoria, activo, fecha_creacion) VALUES
-- Historias clínicas de Max
(@max_id, '87654321', DATE_SUB(NOW(), INTERVAL 30 DAY), 
 'Vacunación y control anual', 
 'Estado general óptimo', 
 'Aplicación de vacuna múltiple y desparasitación', 
 'Vacuna séxtuple canina, Ivermectina',
 'Paciente en excelente condición física. Sin hallazgos patológicos.', 
 'Continuar con alimentación balanceada. Ejercicio regular.',
 28.5, 38.5, 80, 25, true, DATE_SUB(NOW(), INTERVAL 30 DAY)),

-- Historias clínicas de Luna
(@luna_id, '11111111', DATE_SUB(NOW(), INTERVAL 15 DAY), 
 'Control post-operatorio (esterilización)', 
 'Recuperación post-quirúrgica satisfactoria', 
 'Curación de herida quirúrgica, antibióticos preventivos', 
 'Amoxicilina 50mg cada 12h por 7 días, Meloxicam 0.5mg cada 24h por 5 días',
 'Herida quirúrgica en perfectas condiciones. Sin signos de infección.', 
 'Reposo durante 10 días. Evitar saltos. Control en 5 días.',
 4.2, 38.3, 120, 30, true, DATE_SUB(NOW(), INTERVAL 15 DAY)),

-- Historias clínicas de Rocky
(@rocky_id, '87654321', DATE_SUB(NOW(), INTERVAL 60 DAY), 
 'Control geriátrico anual', 
 'Artrosis leve en miembros posteriores', 
 'Manejo paliativo con antiinflamatorios y suplementos articulares', 
 'Condroitina + Glucosamina, Carprofeno según necesidad',
 'Paciente geriátrico con buena calidad de vida. Leve cojera al levantarse.', 
 'Ejercicio moderado. Evitar escaleras. Control en 6 meses.',
 32.0, 38.4, 75, 22, true, DATE_SUB(NOW(), INTERVAL 60 DAY)),

-- Historias clínicas de Bella
(@bella_id, '11111111', DATE_SUB(NOW(), INTERVAL 20 DAY), 
 'Vacunación antirrábica', 
 'Estado general bueno', 
 'Aplicación de vacuna antirrábica', 
 'Vacuna antirrábica anual',
 'Sin complicaciones. Signos vitales normales.', 
 'Próxima vacunación en 1 año.',
 25.0, 38.6, 85, 26, true, DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- Historias clínicas de Zeus
(@zeus_id, '87654321', DATE_SUB(NOW(), INTERVAL 90 DAY), 
 'Consulta por dolor articular', 
 'Displasia de cadera leve', 
 'Manejo con antiinflamatorios y fisioterapia', 
 'Meloxicam 7.5mg cada 24h, Condroprotector',
 'Radiografías muestran displasia grado I. Buena respuesta al tratamiento.', 
 'Control de peso. Natación recomendada. Control en 3 meses.',
 32.5, 38.5, 78, 24, true, DATE_SUB(NOW(), INTERVAL 90 DAY));

-- ============================================================================
-- INSERCIÓN DE REPORTES DE EJEMPLO
-- ============================================================================

INSERT INTO reportes (tipo, titulo, descripcion, fecha_inicio, fecha_fin, contenido_json, fecha_generacion, generado_por) VALUES
('CITAS_MENSUALES', 'Reporte de Citas - Octubre 2025', 
 'Reporte mensual de citas programadas y atendidas', 
 '2025-10-01', '2025-10-31', 
 '{"total_citas": 52, "completadas": 43, "canceladas": 6, "no_asistio": 3, "programadas": 12}', 
 NOW(), '12345678'),

('MASCOTAS_REGISTRADAS', 'Reporte de Mascotas Activas', 
 'Estadísticas de mascotas registradas por especie', 
 '2025-01-01', '2025-10-31', 
 '{"total_mascotas": 175, "perros": 108, "gatos": 62, "otros": 5, "activas": 168}', 
 NOW(), '22222222'),

('VETERINARIOS_ACTIVOS', 'Reporte de Personal Veterinario', 
 'Listado de veterinarios activos por veterinaria', 
 '2025-10-01', '2025-10-31', 
 '{"total_veterinarios": 3, "por_veterinaria": {"Pet Care": 1, "Central": 1, "Amigos Peludos": 1}}', 
 NOW(), '12345678');

-- ============================================================================
-- VERIFICACIÓN Y RESUMEN
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

SELECT '================================' as '';
SELECT '✅ DATOS INSERTADOS EXITOSAMENTE' as RESULTADO;
SELECT '================================' as '';

SELECT 
    'Roles' as Tabla, 
    COUNT(*) as Total,
    GROUP_CONCAT(nombre SEPARATOR ', ') as Datos
FROM roles
UNION ALL
SELECT 
    'Usuarios', 
    COUNT(*),
    GROUP_CONCAT(CONCAT(username, ' (', nombres, ')') SEPARATOR ', ')
FROM usuarios
UNION ALL
SELECT 
    'Veterinarias', 
    COUNT(*),
    GROUP_CONCAT(nombre SEPARATOR ', ')
FROM veterinarias
UNION ALL
SELECT 
    'Mascotas', 
    COUNT(*),
    GROUP_CONCAT(CONCAT(nombre, ' (', especie, ')') SEPARATOR ', ')
FROM mascotas
UNION ALL
SELECT 
    'Citas', 
    COUNT(*),
    CONCAT(COUNT(*), ' citas registradas')
FROM citas
UNION ALL
SELECT 
    'Historias Clínicas', 
    COUNT(*),
    CONCAT(COUNT(*), ' historias registradas')
FROM historias_clinicas
UNION ALL
SELECT 
    'Reportes', 
    COUNT(*),
    CONCAT(COUNT(*), ' reportes generados')
FROM reportes;

SELECT '================================' as '';
SELECT '📋 USUARIOS CON SUS ROLES' as '';
SELECT '================================' as '';

SELECT 
    u.username as Usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as Nombre,
    r.nombre as Rol,
    u.email as Email,
    CASE 
        WHEN u.veterinaria_id IS NOT NULL THEN CONCAT('Asignado a: ', v.nombre)
        ELSE 'Sin veterinaria asignada'
    END as Veterinaria
FROM usuarios u
INNER JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
INNER JOIN roles r ON ur.rol_id = r.id
LEFT JOIN veterinarias v ON u.veterinaria_id = v.id
ORDER BY r.nombre, u.username;

SELECT '================================' as '';
SELECT '🏥 VETERINARIOS POR VETERINARIA' as '';
SELECT '================================' as '';

SELECT 
    v.nombre as Veterinaria,
    COUNT(u.documento) as Total_Veterinarios,
    GROUP_CONCAT(CONCAT(u.nombres, ' ', u.apellidos) SEPARATOR ', ') as Veterinarios
FROM veterinarias v
LEFT JOIN usuarios u ON v.id = u.veterinaria_id
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
LEFT JOIN roles r ON ur.rol_id = r.id AND r.nombre = 'ROLE_VETERINARIO'
WHERE v.activo = true
GROUP BY v.id, v.nombre
ORDER BY v.nombre;

SELECT '================================' as '';
SELECT '🔑 CREDENCIALES DE ACCESO' as '';
SELECT '================================' as '';
SELECT 'Usuario: admin | Contraseña: admin123 | Rol: ADMIN' as Credencial
UNION ALL
SELECT 'Usuario: dr.garcia | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: Pet Care'
UNION ALL
SELECT 'Usuario: dra.martinez | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: Central'
UNION ALL
SELECT 'Usuario: dr.rodriguez | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: Amigos Peludos'
UNION ALL
SELECT 'Usuario: cliente1 | Contraseña: admin123 | Rol: CLIENTE'
UNION ALL
SELECT 'Usuario: cliente2 | Contraseña: admin123 | Rol: CLIENTE'
UNION ALL
SELECT 'Usuario: cliente3 | Contraseña: admin123 | Rol: CLIENTE'
UNION ALL
SELECT 'Usuario: cliente4 | Contraseña: admin123 | Rol: CLIENTE'
UNION ALL
SELECT 'Usuario: recepcion1 | Contraseña: admin123 | Rol: RECEPCIONISTA';

SELECT '================================' as '';
SELECT '🎉 SISTEMA LISTO PARA USAR' as '';
SELECT '================================' as '';
SELECT 'Ejecute DATABASE_DDL.sql primero para crear la estructura' as Instruccion
UNION ALL
SELECT 'Luego ejecute este archivo (DATABASE_DML.sql) para insertar los datos'
UNION ALL
SELECT 'La contraseña por defecto para todos los usuarios es: admin123';

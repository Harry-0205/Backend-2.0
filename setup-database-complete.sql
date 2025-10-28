-- ============================================================================
-- SCRIPT COMPLETO DE INICIALIZACIÓN - VETERINARIA
-- Fecha: 28 de octubre de 2025
-- Descripción: Script unificado para crear y poblar la base de datos
-- ============================================================================

-- Usar la base de datos veterinaria
USE veterinaria;

-- ============================================================================
-- LIMPIAR DATOS EXISTENTES
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
-- INSERTAR DATOS INICIALES
-- ============================================================================

-- Insertar roles con IDs fijos
INSERT INTO roles (id, nombre, descripcion, activo) VALUES
(1, 'ADMIN', 'Administrador del sistema con acceso completo', true),
(2, 'VETERINARIO', 'Veterinario con acceso a consultas y tratamientos', true),
(3, 'CLIENTE', 'Cliente/propietario de mascotas', true),
(4, 'RECEPCIONISTA', 'Personal de recepción y programación de citas', true);

-- Insertar usuarios de ejemplo (contraseña para todos: admin123)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, fecha_registro) VALUES
('12345678', 'CC', 'admin', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Administrador', 'Sistema', 'admin@veterinaria.com', '3001234567', 'Oficina Principal', true, NOW()),
('87654321', 'CC', 'dr.garcia', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Dr. Carlos', 'García López', 'carlos.garcia@veterinaria.com', '3009876543', 'Consultorio 1', true, NOW()),
('11111111', 'CC', 'dra.martinez', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Dra. María', 'Martínez Rodríguez', 'maria.martinez@veterinaria.com', '3005555555', 'Consultorio 2', true, NOW()),
('33333333', 'CC', 'cliente1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Pedro', 'Pérez', 'pedro.perez@email.com', '3003456789', 'Calle 10 #20-30', true, NOW()),
('44444444', 'CC', 'cliente2', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Laura', 'Gómez', 'laura.gomez@email.com', '3009999999', 'Zona Norte #456', true, NOW()),
('22222222', 'CC', 'recepcion1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Ana', 'González', 'recepcion@veterinaria.com', '3004567890', 'Recepción', true, NOW());

-- Asignar roles a usuarios (usando subconsultas dinámicas)
INSERT INTO usuarios_roles (usuario_documento, rol_id) 
SELECT '12345678', id FROM roles WHERE nombre = 'ADMIN'
UNION ALL
SELECT '87654321', id FROM roles WHERE nombre = 'VETERINARIO'
UNION ALL
SELECT '11111111', id FROM roles WHERE nombre = 'VETERINARIO'
UNION ALL
SELECT '33333333', id FROM roles WHERE nombre = 'CLIENTE'
UNION ALL
SELECT '44444444', id FROM roles WHERE nombre = 'CLIENTE'
UNION ALL
SELECT '22222222', id FROM roles WHERE nombre = 'RECEPCIONISTA';

-- Insertar veterinarias
INSERT INTO veterinarias (nombre, direccion, telefono, email, ciudad, descripcion, servicios, horario_atencion, activo, fecha_registro) VALUES 
('Veterinaria Pet Care', 'Calle Principal 123, Ciudad', '+57 1 234-5678', 'info@petcare.com', 'Bogotá',
 'Clínica veterinaria especializada en cuidado integral de mascotas', 'Consulta general, Vacunación, Cirugía, Grooming',
 'Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 8:00 AM - 2:00 PM', true, NOW()),
('Veterinaria Central', 'Avenida Central 456, Ciudad', '+57 1 345-6789', 'info@vetcentral.com', 'Medellín',
 'Centro veterinario con servicios especializados', 'Consulta especializada, Diagnóstico por imágenes, Laboratorio',
 'Lunes a Sábado: 9:00 AM - 7:00 PM', true, NOW()),
('Clínica Veterinaria Amigos Peludos', 'Carrera 15 #30-45, Ciudad', '+57 1 456-7890', 'info@amigospeludos.com', 'Cali',
 'Tu mascota en las mejores manos', 'Consulta general, Vacunación, Grooming, Pet shop',
 'Lunes a Viernes: 8:00 AM - 8:00 PM, Sábados y Domingos: 10:00 AM - 4:00 PM', true, NOW());

-- Insertar mascotas
INSERT INTO mascotas (nombre, especie, raza, color, sexo, fecha_nacimiento, peso, observaciones, activo, propietario_documento, fecha_registro) VALUES
('Max', 'Perro', 'Golden Retriever', 'Dorado', 'M', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 28.5, 'Muy juguetón y amigable', true, '33333333', NOW()),
('Luna', 'Gato', 'Siamés', 'Crema', 'F', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 4.2, 'Tranquila y cariñosa', true, '33333333', NOW()),
('Rocky', 'Perro', 'Pastor Alemán', 'Negro y café', 'M', DATE_SUB(CURDATE(), INTERVAL 5 YEAR), 32.0, 'Muy protector', true, '33333333', NOW()),
('Bella', 'Perro', 'Labrador', 'Negro', 'F', DATE_SUB(CURDATE(), INTERVAL 4 YEAR), 25.0, 'Obediente y cariñosa', true, '44444444', NOW()),
('Mimi', 'Gato', 'Persa', 'Blanco', 'F', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 3.5, 'Muy independiente', true, '44444444', NOW());

-- Obtener IDs dinámicamente para las citas
SET @max_id = (SELECT id FROM mascotas WHERE nombre = 'Max' AND propietario_documento = '33333333' LIMIT 1);
SET @luna_id = (SELECT id FROM mascotas WHERE nombre = 'Luna' AND propietario_documento = '33333333' LIMIT 1);
SET @rocky_id = (SELECT id FROM mascotas WHERE nombre = 'Rocky' AND propietario_documento = '33333333' LIMIT 1);
SET @bella_id = (SELECT id FROM mascotas WHERE nombre = 'Bella' AND propietario_documento = '44444444' LIMIT 1);
SET @mimi_id = (SELECT id FROM mascotas WHERE nombre = 'Mimi' AND propietario_documento = '44444444' LIMIT 1);

SET @vet1_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Pet Care' LIMIT 1);
SET @vet2_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Central' LIMIT 1);
SET @vet3_id = (SELECT id FROM veterinarias WHERE nombre = 'Clínica Veterinaria Amigos Peludos' LIMIT 1);

-- Insertar citas
INSERT INTO citas (fecha_hora, motivo, observaciones, estado, cliente_documento, mascota_id, veterinario_documento, veterinaria_id, fecha_creacion) VALUES
(DATE_ADD(NOW(), INTERVAL 1 DAY), 'Vacunación anual', 'Primera vacuna del año', 'PROGRAMADA', '33333333', @max_id, '87654321', @vet1_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 2 DAY), 'Control de rutina', 'Revisión general de salud', 'PROGRAMADA', '33333333', @luna_id, '11111111', @vet2_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 3 DAY), 'Consulta por tos', 'Ha estado tosiendo últimamente', 'PROGRAMADA', '33333333', @rocky_id, '87654321', @vet1_id, NOW()),
(DATE_SUB(NOW(), INTERVAL 1 DAY), 'Control post-operatorio', 'Revisión después de esterilización', 'COMPLETADA', '33333333', @luna_id, '11111111', @vet3_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 5 DAY), 'Vacunación pentavalente', 'Segunda dosis', 'PROGRAMADA', '44444444', @bella_id, '87654321', @vet2_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 7 DAY), 'Consulta dermatológica', 'Revisión de piel', 'PROGRAMADA', '44444444', @mimi_id, '11111111', @vet1_id, NOW());

-- Insertar historias clínicas
INSERT INTO historias_clinicas (mascota_id, veterinario_documento, fecha_consulta, motivo_consulta, diagnostico, tratamiento, observaciones, peso, temperatura, frecuencia_cardiaca, frecuencia_respiratoria, fecha_creacion) VALUES
(@max_id, '87654321', DATE_SUB(NOW(), INTERVAL 30 DAY), 'Vacunación y control', 'Salud óptima', 'Vacunación múltiple aplicada', 'Control de rutina exitoso', 28.5, 38.5, 80, 25, DATE_SUB(NOW(), INTERVAL 30 DAY)),
(@luna_id, '11111111', DATE_SUB(NOW(), INTERVAL 15 DAY), 'Esterilización', 'Post-operatorio normal', 'Antibióticos y analgésicos por 7 días', 'Recuperación post-quirúrgica satisfactoria', 4.2, 38.3, 120, 30, DATE_SUB(NOW(), INTERVAL 15 DAY)),
(@rocky_id, '87654321', DATE_SUB(NOW(), INTERVAL 60 DAY), 'Control geriátrico', 'Artrosis leve', 'Suplemento articular y analgésicos', 'Paciente de edad avanzada, en buen estado general', 32.0, 38.4, 75, 22, DATE_SUB(NOW(), INTERVAL 60 DAY)),
(@bella_id, '11111111', DATE_SUB(NOW(), INTERVAL 20 DAY), 'Vacunación', 'Estado general bueno', 'Vacuna antirrábica aplicada', 'Sin complicaciones', 25.0, 38.6, 85, 26, DATE_SUB(NOW(), INTERVAL 20 DAY));

-- ============================================================================
-- VERIFICACIÓN Y RESUMEN
-- ============================================================================

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
    GROUP_CONCAT(username SEPARATOR ', ')
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
    GROUP_CONCAT(nombre SEPARATOR ', ')
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
FROM historias_clinicas;

SELECT '================================' as '';
SELECT '📋 USUARIOS CON SUS ROLES' as '';
SELECT '================================' as '';

SELECT 
    u.username as Usuario,
    CONCAT(u.nombres, ' ', u.apellidos) as Nombre,
    r.nombre as Rol,
    u.email as Email
FROM usuarios u
INNER JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
INNER JOIN roles r ON ur.rol_id = r.id
ORDER BY r.nombre, u.username;

SELECT '================================' as '';
SELECT '🔑 CREDENCIALES DE ACCESO' as '';
SELECT '================================' as '';
SELECT 'Usuario: admin | Contraseña: admin123 | Rol: ADMIN' as Credencial
UNION ALL
SELECT 'Usuario: dr.garcia | Contraseña: admin123 | Rol: VETERINARIO'
UNION ALL
SELECT 'Usuario: dra.martinez | Contraseña: admin123 | Rol: VETERINARIO'
UNION ALL
SELECT 'Usuario: cliente1 | Contraseña: admin123 | Rol: CLIENTE'
UNION ALL
SELECT 'Usuario: cliente2 | Contraseña: admin123 | Rol: CLIENTE'
UNION ALL
SELECT 'Usuario: recepcion1 | Contraseña: admin123 | Rol: RECEPCIONISTA';

SELECT '================================' as '';
SELECT '🎉 SISTEMA LISTO PARA USAR' as '';
SELECT '================================' as '';

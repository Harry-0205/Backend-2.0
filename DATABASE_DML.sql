-- ============================================================================
-- DATABASE DML (Data Manipulation Language) - VETERINARIA
-- Fecha: 9 de febrero de 2026
-- Descripción: Datos iniciales y de ejemplo para la base de datos
-- Incluye: Roles, usuarios, veterinarias, mascotas, citas, historias clínicas y reportes
-- Estándar: 15 registros por cada gestión principal
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

-- Insertar veterinarias (15 registros)
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
 'Lunes a Viernes: 8:00 AM - 8:00 PM, Sábados y Domingos: 10:00 AM - 4:00 PM', true, NOW()),
('Veterinaria San Francisco', 'Carrera 7 #45-20, Centro', '+57 1 567-8901', 'contacto@sanfrancisco.com', 'Bogotá',
 'Atención veterinaria de calidad con más de 15 años de experiencia',
 'Consulta general, Cirugía, Vacunación, Hospitalización 24h, Urgencias',
 'Lunes a Domingo: 24 horas', true, NOW()),
('Clínica Veterinaria El Bosque', 'Transversal 10 #80-15, Norte', '+57 1 678-9012', 'info@elbosque.com', 'Bogotá',
 'Especialistas en medicina interna y cirugía veterinaria',
 'Consulta especializada, Cardiología, Dermatología, Oftalmología, Cirugía avanzada',
 'Lunes a Viernes: 7:00 AM - 7:00 PM, Sábados: 8:00 AM - 4:00 PM', true, NOW()),
('Veterinaria Mascotas Felices', 'Calle 50 #25-30, Poblado', '+57 4 789-0123', 'info@mascotasfelices.com', 'Medellín',
 'Centro integral de salud y bienestar animal',
 'Consulta general, Nutrición, Comportamiento, Fisioterapia, Spa canino',
 'Lunes a Sábado: 8:00 AM - 6:00 PM', true, NOW()),
('Clínica Veterinaria La Sabana', 'Avenida 5 #10-50, Sur', '+57 2 890-1234', 'contacto@lasabana.com', 'Cali',
 'Tu clínica veterinaria de confianza en el sur de la ciudad',
 'Consulta general, Vacunación, Desparasitación, Cirugía, Rayos X',
 'Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 9:00 AM - 1:00 PM', true, NOW()),
('Veterinaria Animales Sanos', 'Calle 100 #15-20, Norte', '+57 1 901-2345', 'info@animalessanos.com', 'Bogotá',
 'Especialistas en prevención y cuidado animal',
 'Medicina preventiva, Vacunación, Control de parásitos, Asesoría nutricional',
 'Lunes a Viernes: 9:00 AM - 7:00 PM, Sábados: 9:00 AM - 3:00 PM', true, NOW()),
('Clínica Veterinaria Patitas', 'Carrera 30 #60-10, Occidental', '+57 4 012-3456', 'info@patitas.com', 'Medellín',
 'Amor y cuidado para tus compañeros de cuatro patas',
 'Consulta general, Peluquería, Guardería, Hotel canino, Adiestramiento',
 'Lunes a Domingo: 8:00 AM - 8:00 PM', true, NOW()),
('Veterinaria Vida Animal', 'Avenida 6 #20-45, Centro', '+57 2 123-4567', 'contacto@vidaanimal.com', 'Cali',
 'Comprometidos con la salud y bienestar de tus mascotas',
 'Consulta especializada, Ecografía, Laboratorio clínico, Cirugía, Hospitalización',
 'Lunes a Sábado: 8:00 AM - 7:00 PM', true, NOW()),
('Veterinaria Los Ángeles', 'Diagonal 40 #15-30, Occidente', '+57 1 234-5670', 'info@losangeles.com', 'Bogotá',
 'Centro veterinario familiar con atención 24/7',
 'Urgencias 24h, UCI veterinaria, Hospitalización, Cirugía de emergencia',
 'Lunes a Domingo: 24 horas', true, NOW()),
('Clínica Veterinaria San Martín', 'Calle 80 #25-15, Norte', '+57 4 345-6781', 'contacto@sanmartin.com', 'Medellín',
 'Especialistas en medicina interna y diagnóstico',
 'Cardiología, Neurología, Endoscopía, Ecografía Doppler',
 'Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 9:00 AM - 2:00 PM', true, NOW()),
('Veterinaria Huellitas', 'Avenida 15 #50-20, Centro', '+57 2 456-7892', 'info@huellitas.com', 'Cali',
 'Cuidado integral para tu mejor amigo',
 'Medicina general, Vacunación, Microchip, Pasaporte para mascotas',
 'Lunes a Viernes: 9:00 AM - 7:00 PM, Sábados: 10:00 AM - 4:00 PM', true, NOW()),
('Clínica Veterinaria El Refugio', 'Carrera 50 #30-10, Sur', '+57 1 567-8903', 'contacto@elrefugio.com', 'Bogotá',
 'Tu veterinaria de confianza desde 2005',
 'Medicina preventiva, Geriatría, Rehabilitación, Fisioterapia animal',
 'Lunes a Sábado: 8:00 AM - 6:00 PM', true, NOW()),
('Veterinaria Arca de Noé', 'Transversal 20 #45-30, Oriental', '+57 4 678-9014', 'info@arcadenoe.com', 'Medellín',
 'Especialistas en animales exóticos y convencionales',
 'Consulta para reptiles, aves, mamíferos exóticos, Cirugía especializada',
 'Lunes a Domingo: 9:00 AM - 8:00 PM', true, NOW());

-- Obtener IDs de veterinarias para asignar a veterinarios
SET @vet1_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Pet Care' LIMIT 1);
SET @vet2_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Central' LIMIT 1);
SET @vet3_id = (SELECT id FROM veterinarias WHERE nombre = 'Clínica Veterinaria Amigos Peludos' LIMIT 1);
SET @vet4_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria San Francisco' LIMIT 1);
SET @vet5_id = (SELECT id FROM veterinarias WHERE nombre = 'Clínica Veterinaria El Bosque' LIMIT 1);
SET @vet6_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Mascotas Felices' LIMIT 1);
SET @vet7_id = (SELECT id FROM veterinarias WHERE nombre = 'Veterinaria Los Ángeles' LIMIT 1);

-- Insertar usuarios de ejemplo (15 registros)
-- Contraseña para todos: admin123 (hash BCrypt)

-- PASO 1: Insertar Administrador (creado por el sistema, sin creador)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, veterinaria_id, creado_por_documento, fecha_registro) VALUES
('12345678', 'CC', 'admin', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Administrador', 'Sistema', 'admin@veterinaria.com', '3001234567', 'Oficina Principal', true, @vet1_id, NULL, NOW());

-- PASO 2: Insertar Recepcionistas (creados por el admin)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, veterinaria_id, creado_por_documento, fecha_registro) VALUES
('22222222', 'CC', 'recepcion1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Ana', 'González Torres', 'recepcion@veterinaria.com', '3004567890', 'Recepción', true, @vet1_id, '12345678', NOW()),
('88888888', 'CC', 'recepcion2', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Carolina', 'Vargas Ruiz', 'carolina.vargas@veterinaria.com', '3007778888', 'Recepción', true, @vet2_id, '12345678', NOW());

-- PASO 3: Insertar Veterinarios (creados por el admin)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, veterinaria_id, creado_por_documento, fecha_registro) VALUES
('87654321', 'CC', 'dr.garcia', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dr. Carlos', 'García López', 'carlos.garcia@veterinaria.com', '3009876543', 'Consultorio 1', true, @vet1_id, '12345678', NOW()),
('11111111', 'CC', 'dra.martinez', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dra. María', 'Martínez Rodríguez', 'maria.martinez@veterinaria.com', '3005555555', 'Consultorio 2', true, @vet2_id, '12345678', NOW()),
('99999999', 'CC', 'dr.rodriguez', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dr. Luis', 'Rodríguez Sánchez', 'luis.rodriguez@veterinaria.com', '3002222222', 'Consultorio 3', true, @vet3_id, '12345678', NOW()),
('77777777', 'CC', 'dra.fernandez', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dra. Patricia', 'Fernández Castro', 'patricia.fernandez@veterinaria.com', '3008889999', 'Consultorio 4', true, @vet4_id, '12345678', NOW());

-- PASO 4: Insertar Clientes (creados por recepcionista o admin)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, veterinaria_id, creado_por_documento, fecha_registro) VALUES
('33333333', 'CC', 'cliente1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Pedro', 'Pérez González', 'pedro.perez@email.com', '3003456789', 'Calle 10 #20-30', true, @vet1_id, '22222222', NOW()),
('44444444', 'CC', 'cliente2', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Laura', 'Gómez Ramírez', 'laura.gomez@email.com', '3009999999', 'Zona Norte #456', true, @vet1_id, '22222222', NOW()),
('55555555', 'CC', 'cliente3', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Juan', 'Ramírez López', 'juan.ramirez@email.com', '3006666666', 'Sector Sur #789', true, @vet2_id, '12345678', NOW()),
('66666666', 'CC', 'cliente4', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Sofía', 'Moreno Castro', 'sofia.moreno@email.com', '3001111111', 'Avenida Principal #100', true, @vet3_id, '22222222', NOW()),
('10101010', 'CC', 'cliente5', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Diego', 'Herrera Ruiz', 'diego.herrera@email.com', '3003334444', 'Calle 50 #40-20', true, @vet1_id, '22222222', NOW());

-- PASO 5: Insertar más veterinarios (creados por el admin)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, veterinaria_id, creado_por_documento, fecha_registro) VALUES
('20202020', 'CC', 'dr.lopez', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dr. Andrés', 'López Méndez', 'andres.lopez@veterinaria.com', '3004445555', 'Consultorio 5', true, @vet5_id, '12345678', NOW()),
('30303030', 'CC', 'dra.santos', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Dra. Isabel', 'Santos Duarte', 'isabel.santos@veterinaria.com', '3005556666', 'Consultorio 6', true, @vet6_id, '12345678', NOW());

-- PASO 6: Insertar más recepcionista (creado por el admin)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, veterinaria_id, creado_por_documento, fecha_registro) VALUES
('40404040', 'CC', 'recepcion3', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 
 'Valentina', 'Ortiz Peña', 'valentina.ortiz@veterinaria.com', '3006667777', 'Recepción', true, @vet3_id, '12345678', NOW());

-- Actualizar creado_por_documento en veterinarias (asignar al admin)
UPDATE veterinarias SET creado_por_documento = '12345678';

-- Asignar roles a usuarios (15 usuarios)
INSERT INTO usuarios_roles (usuario_documento, rol_id) VALUES
('12345678', 1),  -- Admin -> ROLE_ADMIN
('87654321', 2),  -- Dr. García -> ROLE_VETERINARIO
('11111111', 2),  -- Dra. Martínez -> ROLE_VETERINARIO
('99999999', 2),  -- Dr. Rodríguez -> ROLE_VETERINARIO
('77777777', 2),  -- Dra. Fernández -> ROLE_VETERINARIO
('20202020', 2),  -- Dr. López -> ROLE_VETERINARIO
('30303030', 2),  -- Dra. Santos -> ROLE_VETERINARIO
('33333333', 3),  -- Cliente1 -> ROLE_CLIENTE
('44444444', 3),  -- Cliente2 -> ROLE_CLIENTE
('55555555', 3),  -- Cliente3 -> ROLE_CLIENTE
('66666666', 3),  -- Cliente4 -> ROLE_CLIENTE
('10101010', 3),  -- Cliente5 -> ROLE_CLIENTE
('22222222', 4),  -- Recepcionista1 -> ROLE_RECEPCIONISTA
('88888888', 4),  -- Recepcionista2 -> ROLE_RECEPCIONISTA
('40404040', 4);  -- Recepcionista3 -> ROLE_RECEPCIONISTA

-- ============================================================================
-- INSERCIÓN DE MASCOTAS (15 registros)
-- ============================================================================

INSERT INTO mascotas (nombre, especie, raza, color, sexo, fecha_nacimiento, peso, observaciones, activo, propietario_documento, fecha_registro) VALUES
-- Mascotas de Pedro Pérez (Cliente1 - 33333333)
('Max', 'Perro', 'Golden Retriever', 'Dorado', 'Macho', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 28.5, 
 'Muy juguetón y amigable. Le encanta nadar.', true, '33333333', NOW()),
('Luna', 'Gato', 'Siamés', 'Crema con puntos oscuros', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 4.2, 
 'Tranquila y cariñosa. Esterilizada.', true, '33333333', NOW()),
('Rocky', 'Perro', 'Pastor Alemán', 'Negro y café', 'Macho', DATE_SUB(CURDATE(), INTERVAL 5 YEAR), 32.0, 
 'Muy protector y leal. Bien entrenado.', true, '33333333', NOW()),
('Coco', 'Perro', 'Poodle', 'Blanco', 'Macho', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 6.8, 
 'Pequeño y juguetón. Le encanta salir a pasear.', true, '33333333', NOW()),

-- Mascotas de Laura Gómez (Cliente2 - 44444444)
('Bella', 'Perro', 'Labrador', 'Negro', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 4 YEAR), 25.0, 
 'Obediente y cariñosa. Esterilizada.', true, '44444444', NOW()),
('Mimi', 'Gato', 'Persa', 'Blanco', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 3.5, 
 'Muy independiente. Requiere cepillado diario.', true, '44444444', NOW()),
('Toby', 'Perro', 'Bulldog Francés', 'Atigrado', 'Macho', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 12.5, 
 'Tranquilo y cariñoso. Problemas respiratorios leves.', true, '44444444', NOW()),

-- Mascotas de Juan Ramírez (Cliente3 - 55555555)
('Zeus', 'Perro', 'Pastor Alemán', 'Negro y marrón', 'Macho', DATE_SUB(CURDATE(), INTERVAL 6 YEAR), 32.5, 
 'Muy protector, excelente guardián.', true, '55555555', NOW()),
('Kira', 'Gato', 'Angora', 'Blanco con manchas grises', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 3.8, 
 'Muy cariñosa y sociable.', true, '55555555', NOW()),
('Simba', 'Gato', 'Maine Coon', 'Naranja atigrado', 'Macho', DATE_SUB(CURDATE(), INTERVAL 4 YEAR), 7.2, 
 'Gato de gran tamaño. Muy amigable con otros animales.', true, '55555555', NOW()),

-- Mascotas de Sofía Moreno (Cliente4 - 66666666)
('Nala', 'Gato', 'Bengala', 'Dorado con manchas', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 4.5, 
 'Muy activa y juguetona. Le gusta trepar.', true, '66666666', NOW()),
('Bruno', 'Perro', 'Boxer', 'Atigrado', 'Macho', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 30.0, 
 'Energético y protector. Excelente con niños.', true, '66666666', NOW()),

-- Mascotas de Diego Herrera (Cliente5 - 10101010)
('Lola', 'Perro', 'Beagle', 'Tricolor', 'Hembra', DATE_SUB(CURDATE(), INTERVAL 2 YEAR), 12.0, 
 'Muy curiosa y olfateadora. Le encanta explorar.', true, '10101010', NOW()),
('Manchas', 'Gato', 'Común Europeo', 'Blanco y negro', 'Macho', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 4.0, 
 'Gato callejero rescatado. Muy cariñoso.', true, '10101010', NOW()),
('Thor', 'Perro', 'Husky Siberiano', 'Gris y blanco', 'Macho', DATE_SUB(CURDATE(), INTERVAL 4 YEAR), 25.0, 
 'Muy energético. Necesita mucho ejercicio diario.', true, '10101010', NOW());

-- ============================================================================
-- INSERCIÓN DE CITAS
-- ============================================================================

-- Obtener IDs de mascotas dinámicamente
SET @max_id = (SELECT id FROM mascotas WHERE nombre = 'Max' AND propietario_documento = '33333333' LIMIT 1);
SET @luna_id = (SELECT id FROM mascotas WHERE nombre = 'Luna' AND propietario_documento = '33333333' LIMIT 1);
SET @rocky_id = (SELECT id FROM mascotas WHERE nombre = 'Rocky' AND propietario_documento = '33333333' LIMIT 1);
SET @coco_id = (SELECT id FROM mascotas WHERE nombre = 'Coco' AND propietario_documento = '33333333' LIMIT 1);
SET @bella_id = (SELECT id FROM mascotas WHERE nombre = 'Bella' AND propietario_documento = '44444444' LIMIT 1);
SET @mimi_id = (SELECT id FROM mascotas WHERE nombre = 'Mimi' AND propietario_documento = '44444444' LIMIT 1);
SET @toby_id = (SELECT id FROM mascotas WHERE nombre = 'Toby' AND propietario_documento = '44444444' LIMIT 1);
SET @zeus_id = (SELECT id FROM mascotas WHERE nombre = 'Zeus' AND propietario_documento = '55555555' LIMIT 1);
SET @kira_id = (SELECT id FROM mascotas WHERE nombre = 'Kira' AND propietario_documento = '55555555' LIMIT 1);
SET @simba_id = (SELECT id FROM mascotas WHERE nombre = 'Simba' AND propietario_documento = '55555555' LIMIT 1);
SET @nala_id = (SELECT id FROM mascotas WHERE nombre = 'Nala' AND propietario_documento = '66666666' LIMIT 1);
SET @bruno_id = (SELECT id FROM mascotas WHERE nombre = 'Bruno' AND propietario_documento = '66666666' LIMIT 1);
SET @lola_id = (SELECT id FROM mascotas WHERE nombre = 'Lola' AND propietario_documento = '10101010' LIMIT 1);
SET @manchas_id = (SELECT id FROM mascotas WHERE nombre = 'Manchas' AND propietario_documento = '10101010' LIMIT 1);
SET @thor_id = (SELECT id FROM mascotas WHERE nombre = 'Thor' AND propietario_documento = '10101010' LIMIT 1);

-- Insertar citas programadas y completadas (15 registros)
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
(DATE_SUB(NOW(), INTERVAL 45 DAY), 'Control dermatológico', 'Revisión de piel irritada', 'COMPLETADA', 
 '55555555', @zeus_id, '99999999', @vet3_id, DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- Citas programadas (futuras)
(DATE_ADD(NOW(), INTERVAL 1 DAY), 'Control de rutina', 'Revisión general de salud', 'PROGRAMADA', 
 '33333333', @max_id, '87654321', @vet1_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 2 DAY), 'Consulta por tos', 'Ha estado tosiendo últimamente', 'CONFIRMADA', 
 '33333333', @rocky_id, '87654321', @vet1_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 3 DAY), 'Vacunación pentavalente', 'Segunda dosis', 'PROGRAMADA', 
 '44444444', @bella_id, '11111111', @vet2_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 5 DAY), 'Peluquería y baño', 'Servicio de grooming completo', 'PROGRAMADA', 
 '44444444', @mimi_id, '99999999', @vet3_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 7 DAY), 'Control de peso', 'Seguimiento de dieta', 'CONFIRMADA', 
 '55555555', @zeus_id, '77777777', @vet4_id, NOW()),

-- Citas adicionales
(DATE_ADD(NOW(), INTERVAL 10 DAY), 'Primera consulta', 'Revisión general de nueva mascota', 'PROGRAMADA', 
 '66666666', @nala_id, '20202020', @vet5_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 12 DAY), 'Vacunación múltiple', 'Refuerzo de vacunas', 'PROGRAMADA', 
 '66666666', @bruno_id, '30303030', @vet6_id, NOW()),
(DATE_ADD(NOW(), INTERVAL 14 DAY), 'Control de rutina', 'Examen general de salud', 'CONFIRMADA', 
 '10101010', @lola_id, '87654321', @vet1_id, NOW()),
(DATE_SUB(NOW(), INTERVAL 10 DAY), 'Consulta por herida', 'Lesión en pata trasera', 'COMPLETADA', 
 '10101010', @manchas_id, '11111111', @vet2_id, DATE_SUB(NOW(), INTERVAL 10 DAY)),
(DATE_ADD(NOW(), INTERVAL 20 DAY), 'Baño y corte de uñas', 'Servicio de grooming', 'PROGRAMADA', 
 '10101010', @thor_id, '99999999', @vet3_id, NOW());

-- ============================================================================
-- INSERCIÓN DE HISTORIAS CLÍNICAS (15 registros)
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

-- Historias clínicas de Coco
(@coco_id, '87654321', DATE_SUB(NOW(), INTERVAL 10 DAY), 
 'Primera consulta y vacunación', 
 'Cachorro sano, desarrollo normal', 
 'Vacunación inicial y desparasitación', 
 'Vacuna triple canina, Pamoato de pirantel',
 'Cachorro en perfecto estado. Peso adecuado para su edad.', 
 'Completar esquema de vacunación. Próxima cita en 3 semanas.',
 6.8, 38.7, 100, 28, true, DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Historias clínicas de Bella
(@bella_id, '11111111', DATE_SUB(NOW(), INTERVAL 20 DAY), 
 'Vacunación antirrábica', 
 'Estado general bueno', 
 'Aplicación de vacuna antirrábica', 
 'Vacuna antirrábica anual',
 'Sin complicaciones. Signos vitales normales.', 
 'Próxima vacunación en 1 año.',
 25.0, 38.6, 85, 26, true, DATE_SUB(NOW(), INTERVAL 20 DAY)),

-- Historias clínicas de Mimi
(@mimi_id, '99999999', DATE_SUB(NOW(), INTERVAL 25 DAY), 
 'Consulta por vómito', 
 'Gastritis leve por cambio de alimentación', 
 'Dieta blanda y protector gástrico', 
 'Omeprazol 5mg cada 24h por 5 días, Probióticos',
 'Paciente mejora con el tratamiento. Signos vitales estables.', 
 'Cambio gradual de alimento. Evitar dar comida humana.',
 3.5, 38.4, 130, 32, true, DATE_SUB(NOW(), INTERVAL 25 DAY)),

-- Historias clínicas de Toby
(@toby_id, '11111111', DATE_SUB(NOW(), INTERVAL 40 DAY), 
 'Control respiratorio', 
 'Síndrome braquiocefálico leve', 
 'Manejo conservador y control de peso', 
 'No requiere medicación actualmente',
 'Dificultad respiratoria leve característica de la raza.', 
 'Evitar ejercicio en horas de calor. Control de peso estricto.',
 12.5, 38.8, 90, 30, true, DATE_SUB(NOW(), INTERVAL 40 DAY)),

-- Historias clínicas de Zeus
(@zeus_id, '99999999', DATE_SUB(NOW(), INTERVAL 45 DAY), 
 'Consulta por dermatitis', 
 'Dermatitis alérgica por picadura de pulgas', 
 'Antihistamínicos y tratamiento tópico', 
 'Cetirizina 10mg cada 12h, Champú medicado',
 'Lesiones en piel por rascado. Presencia de pulgas.', 
 'Desparasitación externa mensual. Baño con champú medicado 2 veces por semana.',
 32.5, 38.5, 78, 24, true, DATE_SUB(NOW(), INTERVAL 45 DAY)),

-- Historias clínicas de Kira
(@kira_id, '11111111', DATE_SUB(NOW(), INTERVAL 35 DAY), 
 'Control y vacunación felina', 
 'Estado general excelente', 
 'Vacuna triple felina y antiparasitario', 
 'Vacuna triple felina, Selamectina tópica',
 'Gata en perfecto estado de salud. Sin hallazgos anormales.', 
 'Continuar con alimentación balanceada. Control anual.',
 3.8, 38.2, 140, 35, true, DATE_SUB(NOW(), INTERVAL 35 DAY)),

-- Historias clínicas de Simba
(@simba_id, '77777777', DATE_SUB(NOW(), INTERVAL 50 DAY), 
 'Chequeo preventivo', 
 'Paciente sano, peso ideal', 
 'Control general y desparasitación', 
 'Ivermectina oral',
 'Gato de gran tamaño en excelente condición. Temperamento dócil.', 
 'Cepillado diario por su pelaje largo. Control en 6 meses.',
 7.2, 38.3, 135, 33, true, DATE_SUB(NOW(), INTERVAL 50 DAY)),

-- Historias clínicas de Nala
(@nala_id, '20202020', DATE_SUB(NOW(), INTERVAL 5 DAY), 
 'Primera consulta', 
 'Gata joven en excelente estado de salud', 
 'Vacunación inicial y desparasitación', 
 'Vacuna triple felina, Praziquantel',
 'Gata muy activa y saludable. Peso ideal para su edad.', 
 'Completar esquema de vacunación. Próxima cita en 21 días.',
 4.5, 38.5, 145, 35, true, DATE_SUB(NOW(), INTERVAL 5 DAY)),

-- Historias clínicas de Bruno
(@bruno_id, '30303030', DATE_SUB(NOW(), INTERVAL 12 DAY), 
 'Control anual', 
 'Estado general excelente', 
 'Vacunación anual y examen físico completo', 
 'Vacuna séxtuple canina',
 'Perro en óptimas condiciones. Musculatura bien desarrollada.', 
 'Continuar con ejercicio regular. Control en 1 año.',
 30.0, 38.6, 85, 26, true, DATE_SUB(NOW(), INTERVAL 12 DAY)),

-- Historias clínicas de Lola
(@lola_id, '87654321', DATE_SUB(NOW(), INTERVAL 8 DAY), 
 'Consulta por otitis', 
 'Otitis externa leve', 
 'Limpieza auricular y antibiótico tópico', 
 'Gotas óticas con neomicina, Limpiador auricular',
 'Oreja derecha con leve inflamación. Buena respuesta al tratamiento.', 
 'Aplicar gotas 2 veces al día por 7 días. Evitar baños. Control en 1 semana.',
 12.0, 38.5, 95, 28, true, DATE_SUB(NOW(), INTERVAL 8 DAY)),

-- Historias clínicas de Manchas
(@manchas_id, '11111111', DATE_SUB(NOW(), INTERVAL 10 DAY), 
 'Herida en pata trasera', 
 'Lesión superficial por traumatismo', 
 'Limpieza, desinfección y vendaje', 
 'Amoxicilina 10mg cada 12h por 5 días, Analgésico',
 'Herida limpia, sin signos de infección. Buena cicatrización.', 
 'Mantener vendaje limpio y seco. Cambio de vendaje cada 2 días. Control en 5 días.',
 4.0, 38.4, 140, 32, true, DATE_SUB(NOW(), INTERVAL 10 DAY)),

-- Historias clínicas de Thor
(@thor_id, '99999999', DATE_SUB(NOW(), INTERVAL 18 DAY), 
 'Vacunación y control', 
 'Perro joven sano y activo', 
 'Vacunación anual y examen general', 
 'Vacuna antirrábica, Desparasitante',
 'Perro de raza grande en excelente condición física.', 
 'Ejercicio diario intenso recomendado. Dieta balanceada para razas grandes. Control en 1 año.',
 25.0, 38.7, 82, 24, true, DATE_SUB(NOW(), INTERVAL 18 DAY));

-- ============================================================================
-- INSERCIÓN DE REPORTES DE EJEMPLO (15 registros)
-- ============================================================================

INSERT INTO reportes (tipo, titulo, descripcion, fecha_inicio, fecha_fin, contenido_json, fecha_generacion, generado_por) VALUES
('CITAS_MENSUALES', 'Reporte de Citas - Diciembre 2025', 
 'Reporte mensual de citas programadas y atendidas', 
 '2025-12-01', '2025-12-31', 
 '{"total_citas": 10, "completadas": 5, "canceladas": 0, "no_asistio": 0, "programadas": 5}', 
 NOW(), '12345678'),

('CITAS_MENSUALES', 'Reporte de Citas - Noviembre 2025', 
 'Reporte mensual de citas programadas y atendidas', 
 '2025-11-01', '2025-11-30', 
 '{"total_citas": 45, "completadas": 38, "canceladas": 4, "no_asistio": 3, "programadas": 0}', 
 NOW(), '12345678'),

('MASCOTAS_REGISTRADAS', 'Reporte de Mascotas Activas', 
 'Estadísticas de mascotas registradas por especie', 
 '2025-01-01', '2025-12-31', 
 '{"total_mascotas": 10, "perros": 6, "gatos": 4, "otros": 0, "activas": 10}', 
 NOW(), '22222222'),

('VETERINARIOS_ACTIVOS', 'Reporte de Personal Veterinario', 
 'Listado de veterinarios activos por veterinaria', 
 '2025-12-01', '2025-12-31', 
 '{"total_veterinarios": 4, "por_veterinaria": {"Pet Care": 1, "Central": 1, "Amigos Peludos": 1, "San Francisco": 1}}', 
 NOW(), '12345678'),

('HISTORIAS_CLINICAS', 'Reporte de Historias Clínicas - Diciembre 2025', 
 'Resumen de historias clínicas registradas en el mes', 
 '2025-12-01', '2025-12-31', 
 '{"total_historias": 10, "consultas_generales": 4, "vacunaciones": 3, "cirugias": 1, "emergencias": 2}', 
 NOW(), '87654321'),

('INGRESOS_MENSUALES', 'Reporte de Ingresos - Noviembre 2025', 
 'Reporte financiero de ingresos por servicios', 
 '2025-11-01', '2025-11-30', 
 '{"total_ingresos": 15600000, "consultas": 8500000, "vacunaciones": 3200000, "cirugias": 2800000, "otros": 1100000}', 
 NOW(), '12345678'),

('CLIENTES_NUEVOS', 'Reporte de Clientes Nuevos - Diciembre 2025', 
 'Estadísticas de clientes registrados en el mes', 
 '2025-12-01', '2025-12-31', 
 '{"total_clientes_nuevos": 3, "total_mascotas_nuevas": 10, "veterinaria_mas_popular": "Pet Care"}', 
 NOW(), '22222222'),

('VACUNACIONES', 'Reporte de Vacunaciones - Noviembre 2025', 
 'Control de vacunaciones realizadas', 
 '2025-11-01', '2025-11-30', 
 '{"total_vacunaciones": 28, "caninas": 18, "felinas": 10, "antirrabica": 15, "polivalentes": 13}', 
 NOW(), '87654321'),

('OCUPACION_VETERINARIOS', 'Reporte de Ocupación de Veterinarios - Noviembre 2025', 
 'Análisis de carga de trabajo por veterinario', 
 '2025-11-01', '2025-11-30', 
 '{"dr_garcia": 15, "dra_martinez": 12, "dr_rodriguez": 10, "dra_fernandez": 8}', 
 NOW(), '12345678'),

('SERVICIOS_POPULARES', 'Reporte de Servicios Más Solicitados - Noviembre 2025', 
 'Análisis de servicios más demandados', 
 '2025-11-01', '2025-11-30', 
 '{"consulta_general": 35, "vacunacion": 28, "cirugia": 8, "grooming": 12, "laboratorio": 6}', 
 NOW(), '22222222'),

('CITAS_MENSUALES', 'Reporte de Citas - Octubre 2025', 
 'Reporte mensual de citas programadas y atendidas', 
 '2025-10-01', '2025-10-31', 
 '{"total_citas": 52, "completadas": 45, "canceladas": 5, "programadas": 2}', 
 NOW(), '12345678'),

('HISTORIAS_CLINICAS', 'Reporte de Historias Clínicas - Noviembre 2025', 
 'Resumen de historias clínicas registradas en el mes', 
 '2025-11-01', '2025-11-30', 
 '{"total_historias": 48, "consultas_generales": 25, "vacunaciones": 15, "cirugias": 5, "emergencias": 3}', 
 NOW(), '87654321'),

('INGRESOS_MENSUALES', 'Reporte de Ingresos - Octubre 2025', 
 'Reporte financiero de ingresos por servicios', 
 '2025-10-01', '2025-10-31', 
 '{"total_ingresos": 18200000, "consultas": 9500000, "vacunaciones": 4200000, "cirugias": 3500000, "otros": 1000000}', 
 NOW(), '12345678'),

('MASCOTAS_REGISTRADAS', 'Reporte de Mascotas por Especie - Noviembre 2025', 
 'Estadísticas detalladas de mascotas por especie', 
 '2025-11-01', '2025-11-30', 
 '{"total_mascotas": 15, "perros": 9, "gatos": 6, "otros": 0, "nuevos_registros": 5}', 
 NOW(), '22222222'),

('OCUPACION_VETERINARIOS', 'Reporte de Ocupación de Veterinarios - Diciembre 2025', 
 'Análisis de carga de trabajo por veterinario', 
 '2025-12-01', '2025-12-31', 
 '{"dr_garcia": 18, "dra_martinez": 15, "dr_rodriguez": 12, "dra_fernandez": 10, "dr_lopez": 8, "dra_santos": 7}', 
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
SELECT '🔑 CREDENCIALES DE ACCESO (15 usuarios)' as '';
SELECT '================================' as '';
SELECT 'Usuario: admin | Contraseña: admin123 | Rol: ADMIN | Veterinaria: Pet Care' as Credencial
UNION ALL
SELECT 'Usuario: dr.garcia | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: Pet Care'
UNION ALL
SELECT 'Usuario: dra.martinez | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: Central'
UNION ALL
SELECT 'Usuario: dr.rodriguez | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: Amigos Peludos'
UNION ALL
SELECT 'Usuario: dra.fernandez | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: San Francisco'
UNION ALL
SELECT 'Usuario: dr.lopez | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: El Bosque'
UNION ALL
SELECT 'Usuario: dra.santos | Contraseña: admin123 | Rol: VETERINARIO | Veterinaria: Mascotas Felices'
UNION ALL
SELECT 'Usuario: recepcion1 | Contraseña: admin123 | Rol: RECEPCIONISTA | Veterinaria: Pet Care'
UNION ALL
SELECT 'Usuario: recepcion2 | Contraseña: admin123 | Rol: RECEPCIONISTA | Veterinaria: Central'
UNION ALL
SELECT 'Usuario: recepcion3 | Contraseña: admin123 | Rol: RECEPCIONISTA | Veterinaria: Amigos Peludos'
UNION ALL
SELECT 'Usuario: cliente1 | Contraseña: admin123 | Rol: CLIENTE | Veterinaria: Pet Care'
UNION ALL
SELECT 'Usuario: cliente2 | Contraseña: admin123 | Rol: CLIENTE | Veterinaria: Pet Care'
UNION ALL
SELECT 'Usuario: cliente3 | Contraseña: admin123 | Rol: CLIENTE | Veterinaria: Central'
UNION ALL
SELECT 'Usuario: cliente4 | Contraseña: admin123 | Rol: CLIENTE | Veterinaria: Amigos Peludos'
UNION ALL
SELECT 'Usuario: cliente5 | Contraseña: admin123 | Rol: CLIENTE | Veterinaria: Pet Care';

SELECT '================================' as '';
SELECT '🎉 SISTEMA LISTO PARA USAR' as '';
SELECT '================================' as '';
SELECT 'Ejecute DATABASE_DDL.sql primero para crear la estructura' as Instruccion
UNION ALL
SELECT 'Luego ejecute este archivo (DATABASE_DML.sql) para insertar los datos'
UNION ALL
SELECT 'La contraseña por defecto para todos los usuarios es: admin123';

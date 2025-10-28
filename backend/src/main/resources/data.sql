-- Crear la base de datos si no existe
CREATE DATABASE IF NOT EXISTS veterinaria;
USE veterinaria;

-- Insertar roles
INSERT INTO roles (nombre, descripcion, activo) VALUES
('ADMIN', 'Administrador del sistema con acceso completo', true),
('RECEPCIONISTA', 'Recepcionista', true),
('VETERINARIO', 'Veterinario', true),
('CLIENTE', 'Cliente', true)
ON DUPLICATE KEY UPDATE nombre=nombre;

-- Insertar usuarios de ejemplo (contraseña para todos: admin123)
INSERT INTO usuarios (documento, tipo_documento, username, password, nombres, apellidos, email, telefono, direccion, activo, fecha_registro) VALUES
('12345678', 'CC', 'admin', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Administrador', 'Sistema', 'admin@veterinaria.com', '3001234567', 'Oficina Principal', true, NOW()),
('11223344', 'CC', 'drsmith', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Dr. Juan', 'Smith', 'juan.smith@veterinaria.com', '3002345678', 'Consultorio 1', true, NOW()),
('44332211', 'CC', 'cliente1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'Ana', 'Pérez', 'ana.perez@email.com', '3003456789', 'Calle 10 #20-30', true, NOW()),
('87654321', 'CC', 'recepcion1', '$2a$10$Cda6MdESFq1Iv94lGg9lwumKaKtzwh4TuT7OEdT7h68nxy3dlrcgy', 'María', 'González', 'maria.gonzalez@veterinaria.com', '3004567890', 'Recepción', true, NOW())
ON DUPLICATE KEY UPDATE username=username;

-- Asignar roles a usuarios
INSERT INTO usuario_roles (usuario_documento, rol_id) 
SELECT u.documento, r.id FROM usuarios u, roles r 
WHERE u.username = 'admin' AND r.nombre = 'ADMIN'
ON DUPLICATE KEY UPDATE usuario_documento=usuario_documento;

INSERT INTO usuario_roles (usuario_documento, rol_id) 
SELECT u.documento, r.id FROM usuarios u, roles r 
WHERE u.username = 'drsmith' AND r.nombre = 'VETERINARIO'
ON DUPLICATE KEY UPDATE usuario_documento=usuario_documento;

INSERT INTO usuario_roles (usuario_documento, rol_id) 
SELECT u.documento, r.id FROM usuarios u, roles r 
WHERE u.username = 'cliente1' AND r.nombre = 'CLIENTE'
ON DUPLICATE KEY UPDATE usuario_documento=usuario_documento;

INSERT INTO usuario_roles (usuario_documento, rol_id) 
SELECT u.documento, r.id FROM usuarios u, roles r 
WHERE u.username = 'recepcion1' AND r.nombre = 'RECEPCIONISTA'
ON DUPLICATE KEY UPDATE usuario_documento=usuario_documento;

-- Insertar veterinaria ejemplo
INSERT INTO veterinarias (nombre, direccion, telefono, email, descripcion, horario_atencion, activo, fecha_registro) VALUES 
('Veterinaria Pet Care', 'Calle Principal 123, Ciudad', '+57 1 234-5678', 'info@petcare.com', 
 'Clínica veterinaria especializada en cuidado integral de mascotas', 
 'Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 8:00 AM - 2:00 PM', true, NOW());
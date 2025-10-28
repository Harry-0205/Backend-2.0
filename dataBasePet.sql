-- ============================================================================
-- DATABASAPET - SCRIPT COMPLETO DE BASE DE DATOS VETERINARIA
-- Fecha: 27 de octubre de 2025
-- Versión: 2.1 - Compatible con phpMyAdmin
-- Descripción: Script unificado que incluye creación, datos y verificaciones
-- ============================================================================

-- Configuración inicial compatible con phpMyAdmin
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
SET time_zone = "+00:00";

-- Eliminar base de datos si existe y crearla nuevamente
DROP DATABASE IF EXISTS veterinaria_db;
CREATE DATABASE veterinaria_db CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE veterinaria_db;

-- ============================================================================
-- CREACIÓN DE TABLAS
-- ============================================================================

-- Tabla de roles
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de usuarios
CREATE TABLE usuarios (
    documento VARCHAR(20) PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nombres VARCHAR(255) NOT NULL,
    apellidos VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion TEXT,
    tipo_documento VARCHAR(10) NOT NULL DEFAULT 'CC',
    fecha_nacimiento DATE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla intermedia para usuarios y roles (relación muchos a muchos)
CREATE TABLE usuarios_roles (
    usuario_documento VARCHAR(20),
    rol_id BIGINT,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_documento, rol_id),
    FOREIGN KEY (usuario_documento) REFERENCES usuarios(documento) ON DELETE CASCADE,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de veterinarias
CREATE TABLE veterinarias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(255),
    ciudad VARCHAR(100),
    descripcion TEXT,
    servicios TEXT,
    horario_atencion VARCHAR(255),
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de mascotas
CREATE TABLE mascotas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    especie VARCHAR(255) NOT NULL,
    raza VARCHAR(255),
    sexo VARCHAR(10),
    fecha_nacimiento DATE,
    peso DECIMAL(5,2),
    color TEXT,
    observaciones TEXT,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    propietario_documento VARCHAR(20) NOT NULL,
    FOREIGN KEY (propietario_documento) REFERENCES usuarios(documento) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de citas
CREATE TABLE citas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL,
    motivo TEXT,
    estado ENUM('PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO') DEFAULT 'PROGRAMADA',
    observaciones TEXT,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cliente_documento VARCHAR(20) NOT NULL,
    mascota_id BIGINT NOT NULL,
    veterinario_documento VARCHAR(20),
    veterinaria_id BIGINT,
    FOREIGN KEY (cliente_documento) REFERENCES usuarios(documento) ON DELETE RESTRICT,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE RESTRICT,
    FOREIGN KEY (veterinario_documento) REFERENCES usuarios(documento) ON DELETE SET NULL,
    FOREIGN KEY (veterinaria_id) REFERENCES veterinarias(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de historias clínicas
CREATE TABLE historias_clinicas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_consulta DATETIME NOT NULL,
    motivo_consulta TEXT,
    sintomas TEXT,
    diagnostico TEXT,
    tratamiento TEXT,
    medicamentos TEXT,
    peso DECIMAL(5,2),
    temperatura DECIMAL(4,2),
    frecuencia_cardiaca INT,
    frecuencia_respiratoria INT,
    observaciones TEXT,
    recomendaciones TEXT,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    mascota_id BIGINT NOT NULL,
    veterinario_documento VARCHAR(20) NOT NULL,
    cita_id BIGINT,
    FOREIGN KEY (mascota_id) REFERENCES mascotas(id) ON DELETE RESTRICT,
    FOREIGN KEY (veterinario_documento) REFERENCES usuarios(documento) ON DELETE RESTRICT,
    FOREIGN KEY (cita_id) REFERENCES citas(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de reportes
CREATE TABLE reportes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(255) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    contenido_json TEXT,
    fecha_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generado_por VARCHAR(20) NOT NULL,
    FOREIGN KEY (generado_por) REFERENCES usuarios(documento) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================================
-- INSERCIÓN DE DATOS INICIALES
-- ============================================================================

-- Insertar roles básicos
INSERT INTO roles (nombre, descripcion) VALUES
('ADMIN', 'Administrador del sistema con acceso completo'),
('VETERINARIO', 'Veterinario con acceso a consultas y tratamientos'),
('CLIENTE', 'Cliente/propietario de mascotas'),
('RECEPCIONISTA', 'Personal de recepción y programación de citas');

-- Insertar usuarios iniciales
-- Contraseña por defecto: "123456" -> Hash BCrypt actualizado
INSERT INTO usuarios (documento, username, password, nombres, apellidos, email, telefono, direccion, tipo_documento, fecha_nacimiento, fecha_registro, activo) VALUES
('12345678', 'admin', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'Administrador', 'Sistema', 'admin@veterinaria.com', '3001234567', 'Oficina Principal', 'CC', '1980-01-01', NOW(), TRUE),
('87654321', 'dr.garcia', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'Carlos', 'García López', 'carlos.garcia@veterinaria.com', '3009876543', 'Calle 123 #45-67', 'CC', '1975-05-15', NOW(), TRUE),
('11111111', 'dra.martinez', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'María', 'Martínez Rodríguez', 'maria.martinez@veterinaria.com', '3005555555', 'Avenida Principal #789', 'CC', '1982-09-20', NOW(), TRUE),
('22222222', 'recepcionista1', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'Ana', 'Recepción González', 'recepcion@veterinaria.com', '3007777777', 'Centro de la ciudad', 'CC', '1990-03-10', NOW(), TRUE),
('33333333', 'cliente1', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'Pedro', 'Cliente Pérez', 'pedro.perez@email.com', '3008888888', 'Barrio Residencial #123', 'CC', '1985-07-25', NOW(), TRUE),
('44444444', 'cliente2', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'Laura', 'Cliente Gómez', 'laura.gomez@email.com', '3009999999', 'Zona Norte #456', 'CC', '1988-12-03', NOW(), TRUE),
('55555555', 'cliente3', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'Juan', 'Cliente Ramírez', 'juan.ramirez@email.com', '3006666666', 'Sector Sur #789', 'CC', '1992-04-18', NOW(), TRUE),
('66666666', 'cliente4', '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW', 'Sofia', 'Cliente Martín', 'sofia.martin@email.com', '3004444444', 'Zona Este #321', 'CC', '1990-08-14', NOW(), TRUE);

-- Asignar roles a usuarios
INSERT INTO usuarios_roles (usuario_documento, rol_id) VALUES
('12345678', 1), -- Admin -> ADMIN
('87654321', 2), -- Dr. García -> VETERINARIO
('11111111', 2), -- Dra. Martínez -> VETERINARIO
('22222222', 4), -- Recepcionista -> RECEPCIONISTA
('33333333', 3), -- Cliente1 -> CLIENTE
('44444444', 3), -- Cliente2 -> CLIENTE
('55555555', 3), -- Cliente3 -> CLIENTE
('66666666', 3); -- Cliente4 -> CLIENTE

-- Insertar veterinarias
INSERT INTO veterinarias (nombre, direccion, telefono, email, ciudad, descripcion, servicios, horario_atencion, fecha_registro, activo) VALUES
('Veterinaria Central', 'Calle Principal #123, Centro', '601-2345678', 'info@veterinariacentral.com', 'Bogotá', 'Veterinaria especializada en atención integral de mascotas', 'Consulta general, Vacunación, Cirugía, Odontología veterinaria, Grooming, Hospitalización', 'Lunes a Viernes: 8:00 AM - 6:00 PM, Sábados: 8:00 AM - 2:00 PM', NOW(), TRUE),
('Clínica Veterinaria Norte', 'Avenida Norte #456, Zona Norte', '601-3456789', 'contacto@clinicavetnorte.com', 'Bogotá', 'Clínica moderna con tecnología de punta', 'Consulta especializada, Diagnóstico por imágenes, Laboratorio clínico, Cirugía especializada', 'Lunes a Sábado: 7:00 AM - 7:00 PM', NOW(), TRUE),
('Pet Care Sur', 'Carrera Sur #789, Zona Sur', '601-4567890', 'info@petcaresur.com', 'Bogotá', 'Centro de atención veterinaria y pet shop', 'Consulta general, Vacunación, Grooming, Venta de productos para mascotas', 'Lunes a Domingo: 9:00 AM - 5:00 PM', NOW(), TRUE);

-- Insertar mascotas de ejemplo
INSERT INTO mascotas (nombre, especie, raza, sexo, fecha_nacimiento, peso, color, observaciones, fecha_registro, activo, propietario_documento) VALUES
('Max', 'Perro', 'Golden Retriever', 'Macho', '2020-03-15', 25.5, 'Dorado', 'Muy activo y juguetón', NOW(), TRUE, '33333333'),
('Bella', 'Perro', 'Labrador', 'Hembra', '2019-07-22', 22.0, 'Negro', 'Obediente y cariñosa', NOW(), TRUE, '33333333'),
('Miau', 'Gato', 'Siamés', 'Hembra', '2021-01-10', 3.8, 'Crema y marrón', 'Muy independiente', NOW(), TRUE, '44444444'),
('Rocky', 'Perro', 'Bulldog Francés', 'Macho', '2022-05-08', 12.3, 'Gris', 'Tranquilo y hogareño', NOW(), TRUE, '44444444'),
('Luna', 'Gato', 'Persa', 'Hembra', '2020-11-30', 4.2, 'Blanco', 'Pelo largo, necesita cepillado frecuente', NOW(), TRUE, '55555555'),
('Zeus', 'Perro', 'Pastor Alemán', 'Macho', '2018-09-12', 32.0, 'Negro y marrón', 'Muy protector, bien entrenado', NOW(), TRUE, '55555555'),
('Nala', 'Gato', 'Angora', 'Hembra', '2021-06-20', 3.5, 'Blanco con manchas grises', 'Muy cariñosa', NOW(), TRUE, '66666666'),
('Bruno', 'Perro', 'Beagle', 'Macho', '2020-01-08', 15.2, 'Tricolor', 'Enérgico y cazador', NOW(), TRUE, '66666666');

-- Insertar citas de ejemplo
INSERT INTO citas (fecha_hora, motivo, estado, observaciones, fecha_creacion, cliente_documento, mascota_id, veterinario_documento, veterinaria_id) VALUES
('2025-10-28 09:00:00', 'Consulta de rutina y vacunación', 'PROGRAMADA', 'Primera consulta del año', NOW(), '33333333', 1, '87654321', 1),
('2025-10-28 10:30:00', 'Revisión general', 'PROGRAMADA', 'Control de peso', NOW(), '33333333', 2, '11111111', 1),
('2025-10-29 14:00:00', 'Consulta por comportamiento', 'PROGRAMADA', 'Problemas de ansiedad', NOW(), '44444444', 3, '87654321', 2),
('2025-10-30 11:15:00', 'Vacunación pentavalente', 'CONFIRMADA', 'Segundo refuerzo', NOW(), '44444444', 4, '11111111', 1),
('2025-11-02 16:00:00', 'Grooming y revisión dental', 'PROGRAMADA', 'Limpieza dental programada', NOW(), '55555555', 5, '87654321', 3),
('2025-11-05 08:30:00', 'Control post-operatorio', 'PROGRAMADA', 'Seguimiento después de esterilización', NOW(), '55555555', 6, '11111111', 2),
('2025-11-07 15:00:00', 'Consulta de rutina felina', 'PROGRAMADA', 'Chequeo anual', NOW(), '66666666', 7, '87654321', 1),
('2025-11-10 10:00:00', 'Vacunación antirrábica', 'PROGRAMADA', 'Refuerzo anual', NOW(), '66666666', 8, '11111111', 3);

-- Insertar historias clínicas de ejemplo
INSERT INTO historias_clinicas (fecha_consulta, motivo_consulta, sintomas, diagnostico, tratamiento, medicamentos, peso, temperatura, frecuencia_cardiaca, frecuencia_respiratoria, observaciones, recomendaciones, fecha_creacion, mascota_id, veterinario_documento, cita_id) VALUES
('2025-10-15 10:00:00', 'Consulta de rutina', 'Ninguno', 'Paciente sano', 'Vacunación y desparasitación', 'Vacuna pentavalente, Ivermectina', 25.5, 38.5, 80, 20, 'Excelente estado general', 'Continuar con alimentación balanceada', NOW(), 1, '87654321', NULL),
('2025-10-20 14:30:00', 'Vómitos frecuentes', 'Vómito, pérdida de apetito', 'Gastritis leve', 'Dieta blanda, medicación', 'Omeprazol, Sucralfato', 22.0, 39.2, 85, 22, 'Respuesta positiva al tratamiento', 'Evitar cambios bruscos en la dieta', NOW(), 2, '11111111', NULL),
('2025-10-22 09:15:00', 'Revisión de rutina felina', 'Ninguno', 'Estado general bueno', 'Vacunación triple felina', 'Vacuna triple felina', 3.8, 38.8, 140, 30, 'Gata en perfecto estado', 'Mantener ambiente enriquecido', NOW(), 3, '87654321', NULL),
('2025-10-25 11:00:00', 'Control de peso', 'Sobrepeso leve', 'Sobrepeso', 'Dieta controlada y ejercicio', 'Sin medicamentos', 13.8, 38.2, 85, 25, 'Necesita reducir peso', 'Dieta especial y ejercicio diario', NOW(), 4, '11111111', NULL);

-- Insertar reportes de ejemplo
INSERT INTO reportes (tipo, titulo, descripcion, fecha_inicio, fecha_fin, contenido_json, fecha_generacion, generado_por) VALUES
('CITAS_MENSUALES', 'Reporte de Citas - Octubre 2025', 'Reporte mensual de citas programadas y atendidas', '2025-10-01', '2025-10-31', '{"total_citas": 48, "completadas": 40, "canceladas": 5, "no_asistio": 3, "programadas": 8}', NOW(), '12345678'),
('INGRESOS_MENSUALES', 'Reporte de Ingresos - Octubre 2025', 'Análisis de ingresos mensuales por servicios', '2025-10-01', '2025-10-31', '{"total_ingresos": 2750000, "consultas": 1350000, "cirugias": 900000, "vacunaciones": 500000}', NOW(), '12345678'),
('MASCOTAS_REGISTRADAS', 'Reporte de Mascotas Registradas', 'Estadísticas de mascotas registradas por especie', '2025-01-01', '2025-10-31', '{"total_mascotas": 158, "perros": 95, "gatos": 57, "otros": 6}', NOW(), '22222222');

-- ============================================================================
-- ÍNDICES PARA OPTIMIZACIÓN DE RENDIMIENTO
-- ============================================================================

-- Índices principales
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_username ON usuarios(username);
CREATE INDEX idx_usuarios_activo ON usuarios(activo);
CREATE INDEX idx_mascotas_propietario ON mascotas(propietario_documento);
CREATE INDEX idx_mascotas_especie ON mascotas(especie);
CREATE INDEX idx_mascotas_activo ON mascotas(activo);
CREATE INDEX idx_citas_fecha_hora ON citas(fecha_hora);
CREATE INDEX idx_citas_cliente ON citas(cliente_documento);
CREATE INDEX idx_citas_veterinario ON citas(veterinario_documento);
CREATE INDEX idx_citas_estado ON citas(estado);
CREATE INDEX idx_historias_mascota ON historias_clinicas(mascota_id);
CREATE INDEX idx_historias_veterinario ON historias_clinicas(veterinario_documento);
CREATE INDEX idx_historias_fecha ON historias_clinicas(fecha_consulta);
CREATE INDEX idx_reportes_tipo ON reportes(tipo);
CREATE INDEX idx_reportes_fecha ON reportes(fecha_generacion);

-- ============================================================================
-- VISTAS ÚTILES PARA CONSULTAS FRECUENTES
-- ============================================================================

-- Vista completa de mascotas con información del propietario
CREATE VIEW vista_mascotas_completa AS
SELECT 
    m.id,
    m.nombre,
    m.especie,
    m.raza,
    m.sexo,
    m.fecha_nacimiento,
    TIMESTAMPDIFF(YEAR, m.fecha_nacimiento, CURDATE()) as edad_años,
    TIMESTAMPDIFF(MONTH, m.fecha_nacimiento, CURDATE()) % 12 as edad_meses,
    m.peso,
    m.color,
    m.observaciones,
    m.fecha_registro,
    m.activo,
    u.documento as propietario_documento,
    CONCAT(u.nombres, ' ', u.apellidos) as propietario_nombre,
    u.telefono as propietario_telefono,
    u.email as propietario_email,
    u.direccion as propietaria_direccion
FROM mascotas m
INNER JOIN usuarios u ON m.propietario_documento = u.documento;

-- Vista completa de citas con toda la información relacionada
CREATE VIEW vista_citas_completa AS
SELECT 
    c.id,
    c.fecha_hora,
    DATE(c.fecha_hora) as fecha,
    TIME(c.fecha_hora) as hora,
    c.motivo,
    c.estado,
    c.observaciones,
    c.fecha_creacion,
    c.cliente_documento,
    CONCAT(cliente.nombres, ' ', cliente.apellidos) as cliente_nombre,
    cliente.telefono as cliente_telefono,
    cliente.email as cliente_email,
    c.mascota_id,
    m.nombre as mascota_nombre,
    m.especie as mascota_especie,
    m.raza as mascota_raza,
    c.veterinario_documento,
    CONCAT(vet.nombres, ' ', vet.apellidos) as veterinario_nombre,
    c.veterinaria_id,
    v.nombre as veterinaria_nombre,
    v.direccion as veterinaria_direccion,
    v.telefono as veterinaria_telefono
FROM citas c
INNER JOIN usuarios cliente ON c.cliente_documento = cliente.documento
INNER JOIN mascotas m ON c.mascota_id = m.id
LEFT JOIN usuarios vet ON c.veterinario_documento = vet.documento
LEFT JOIN veterinarias v ON c.veterinaria_id = v.id;

-- Vista de historias clínicas con información completa
CREATE VIEW vista_historias_completas AS
SELECT 
    hc.id,
    hc.fecha_consulta,
    hc.motivo_consulta,
    hc.sintomas,
    hc.diagnostico,
    hc.tratamiento,
    hc.medicamentos,
    hc.peso,
    hc.temperatura,
    hc.frecuencia_cardiaca,
    hc.frecuencia_respiratoria,
    hc.observaciones,
    hc.recomendaciones,
    hc.fecha_creacion,
    m.id as mascota_id,
    m.nombre as mascota_nombre,
    m.especie as mascota_especie,
    CONCAT(prop.nombres, ' ', prop.apellidos) as propietario_nombre,
    prop.telefono as propietario_telefono,
    CONCAT(vet.nombres, ' ', vet.apellidos) as veterinario_nombre,
    hc.cita_id
FROM historias_clinicas hc
INNER JOIN mascotas m ON hc.mascota_id = m.id
INNER JOIN usuarios prop ON m.propietario_documento = prop.documento
INNER JOIN usuarios vet ON hc.veterinario_documento = vet.documento;

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================================================

DELIMITER //

-- Procedimiento para obtener estadísticas del dashboard
CREATE PROCEDURE obtener_estadisticas_dashboard()
BEGIN
    SELECT 
        (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE) as total_usuarios,
        (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE AND documento IN (SELECT usuario_documento FROM usuarios_roles WHERE rol_id = 3)) as total_clientes,
        (SELECT COUNT(*) FROM usuarios WHERE activo = TRUE AND documento IN (SELECT usuario_documento FROM usuarios_roles WHERE rol_id = 2)) as total_veterinarios,
        (SELECT COUNT(*) FROM mascotas WHERE activo = TRUE) as total_mascotas,
        (SELECT COUNT(*) FROM citas WHERE DATE(fecha_hora) = CURDATE()) as citas_hoy,
        (SELECT COUNT(*) FROM citas WHERE DATE(fecha_hora) = CURDATE() AND estado = 'COMPLETADA') as citas_completadas_hoy,
        (SELECT COUNT(*) FROM citas WHERE estado = 'PROGRAMADA' AND fecha_hora > NOW()) as citas_pendientes,
        (SELECT COUNT(*) FROM veterinarias WHERE activo = TRUE) as total_veterinarias,
        (SELECT COUNT(*) FROM historias_clinicas WHERE DATE(fecha_consulta) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)) as consultas_ultimo_mes,
        (SELECT COUNT(*) FROM historias_clinicas WHERE DATE(fecha_consulta) = CURDATE()) as consultas_hoy;
END //

-- Procedimiento para obtener citas por fecha
CREATE PROCEDURE obtener_citas_por_fecha(IN fecha_consulta DATE)
BEGIN
    SELECT * FROM vista_citas_completa 
    WHERE DATE(fecha_hora) = fecha_consulta 
    ORDER BY hora;
END //

-- Procedimiento para obtener historial de una mascota
CREATE PROCEDURE obtener_historial_mascota(IN mascota_id_param BIGINT)
BEGIN
    SELECT * FROM vista_historias_completas 
    WHERE mascota_id = mascota_id_param 
    ORDER BY fecha_consulta DESC;
END //

-- Procedimiento para validar credenciales de usuario
CREATE PROCEDURE validar_usuario(IN username_param VARCHAR(255))
BEGIN
    SELECT 
        u.documento,
        u.username,
        u.password,
        u.nombres,
        u.apellidos,
        u.email,
        u.activo,
        GROUP_CONCAT(r.nombre SEPARATOR ',') as roles
    FROM usuarios u
    LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
    LEFT JOIN roles r ON ur.rol_id = r.id
    WHERE u.username = username_param AND u.activo = TRUE
    GROUP BY u.documento;
END //

DELIMITER ;

-- ============================================================================
-- CONFIGURACIÓN DE SEGURIDAD Y OPTIMIZACIÓN
-- ============================================================================

-- Restaurar configuración de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Confirmar transacción
COMMIT;

-- ============================================================================
-- VERIFICACIONES Y PRUEBAS AUTOMÁTICAS
-- ============================================================================

-- Verificar que todas las tablas se crearon correctamente
SELECT 'VERIFICACIÓN DE TABLAS CREADAS' as seccion;
SHOW TABLES;

-- Verificar conteo de registros por tabla
SELECT 'CONTEO DE REGISTROS POR TABLA' as seccion;
SELECT 
    'ROLES' as tabla, COUNT(*) as registros FROM roles
UNION ALL
SELECT 'USUARIOS' as tabla, COUNT(*) as registros FROM usuarios
UNION ALL
SELECT 'USUARIOS_ROLES' as tabla, COUNT(*) as registros FROM usuarios_roles
UNION ALL
SELECT 'MASCOTAS' as tabla, COUNT(*) as registros FROM mascotas
UNION ALL
SELECT 'VETERINARIAS' as tabla, COUNT(*) as registros FROM veterinarias
UNION ALL
SELECT 'CITAS' as tabla, COUNT(*) as registros FROM citas
UNION ALL
SELECT 'HISTORIAS_CLINICAS' as tabla, COUNT(*) as registros FROM historias_clinicas
UNION ALL
SELECT 'REPORTES' as tabla, COUNT(*) as registros FROM reportes;

-- Verificar usuarios con sus roles
SELECT 'VERIFICACIÓN DE USUARIOS Y ROLES' as seccion;
SELECT 
    u.documento,
    u.username,
    CONCAT(u.nombres, ' ', u.apellidos) as nombre_completo,
    u.email,
    u.activo,
    GROUP_CONCAT(r.nombre SEPARATOR ', ') as roles,
    CASE 
        WHEN u.password LIKE '$2a$%' THEN 'BCrypt Hash ✅'
        WHEN u.password = '123456' THEN 'Texto Plano ❌'
        ELSE 'Otro formato ⚠️'
    END as password_status
FROM usuarios u
LEFT JOIN usuarios_roles ur ON u.documento = ur.usuario_documento  
LEFT JOIN roles r ON ur.rol_id = r.id
GROUP BY u.documento, u.username, u.nombres, u.apellidos, u.email, u.activo, u.password
ORDER BY u.username;

-- Verificar que las contraseñas estén correctamente hasheadas
SELECT 'VERIFICACIÓN DE CONTRASEÑAS BCRYPT' as seccion;
SELECT 
    username,
    CASE 
        WHEN password = '$2a$10$CU4gEmph2e96GPdXVgSN2eszX3BNf06DOXs4cAmaUwAjcSCQ/8GVW' THEN 'Hash correcto ✅'
        WHEN password = '123456' THEN 'Texto plano - NECESITA ACTUALIZAR ❌'
        ELSE 'Hash diferente - Verificar ⚠️'
    END as hash_status,
    LENGTH(password) as hash_length
FROM usuarios 
ORDER BY username;

-- Verificar mascotas con sus propietarios
SELECT 'VERIFICACIÓN DE MASCOTAS Y PROPIETARIOS' as seccion;
SELECT 
    m.id,
    m.nombre as mascota,
    m.especie,
    m.raza,
    CONCAT(u.nombres, ' ', u.apellidos) as propietario,
    u.username,
    u.telefono
FROM mascotas m
JOIN usuarios u ON m.propietario_documento = u.documento
WHERE m.activo = TRUE
ORDER BY u.nombres, m.nombre;

-- Verificar citas programadas
SELECT 'VERIFICACIÓN DE CITAS PROGRAMADAS' as seccion;
SELECT 
    c.id,
    DATE(c.fecha_hora) as fecha,
    TIME(c.fecha_hora) as hora,
    c.estado,
    m.nombre as mascota,
    CONCAT(cliente.nombres, ' ', cliente.apellidos) as cliente,
    CONCAT(vet.nombres, ' ', vet.apellidos) as veterinario
FROM citas c
JOIN mascotas m ON c.mascota_id = m.id
JOIN usuarios cliente ON c.cliente_documento = cliente.documento
LEFT JOIN usuarios vet ON c.veterinario_documento = vet.documento
WHERE c.fecha_hora >= CURDATE()
ORDER BY c.fecha_hora;

-- Estadísticas generales del sistema
SELECT 'ESTADÍSTICAS GENERALES DEL SISTEMA' as seccion;
CALL obtener_estadisticas_dashboard();

-- ============================================================================
-- MENSAJE FINAL DE CONFIRMACIÓN
-- ============================================================================

SELECT 
    '🎉 ¡BASE DE DATOS DATABASAPET CREADA EXITOSAMENTE!' as mensaje,
    'Base de datos: veterinaria_db' as database_name,
    'Usuarios de prueba: admin, dr.garcia, cliente1, cliente2, etc.' as usuarios_disponibles,
    'Contraseña para todos: 123456 (Hash BCrypt)' as credenciales,
    '8 usuarios, 8 mascotas, 3 veterinarias, 8 citas, 4 historias clínicas' as datos_insertados,
    'Vistas, procedimientos e índices configurados' as funcionalidades,
    '✅ Sistema listo para usar' as estado;

-- ============================================================================
-- NOTAS IMPORTANTES
-- ============================================================================

/*
CREDENCIALES DE ACCESO:
- admin / 123456 (Rol: ADMIN)
- dr.garcia / 123456 (Rol: VETERINARIO)
- dra.martinez / 123456 (Rol: VETERINARIO)
- recepcionista1 / 123456 (Rol: RECEPCIONISTA)
- cliente1 / 123456 (Rol: CLIENTE)
- cliente2 / 123456 (Rol: CLIENTE)
- cliente3 / 123456 (Rol: CLIENTE)
- cliente4 / 123456 (Rol: CLIENTE)

CARACTERÍSTICAS:
✅ Contraseñas hasheadas con BCrypt
✅ Índices para optimización de consultas
✅ Vistas para consultas complejas
✅ Procedimientos almacenados
✅ Constraints de integridad referencial
✅ Datos de prueba completos
✅ Verificaciones automáticas

VISTAS DISPONIBLES:
- vista_mascotas_completa
- vista_citas_completa
- vista_historias_completas

PROCEDIMIENTOS DISPONIBLES:
- obtener_estadisticas_dashboard()
- obtener_citas_por_fecha(fecha)
- obtener_historial_mascota(id)
- validar_usuario(username)
*/
-- ============================================================================
-- DATABASE DDL (Data Definition Language) - VETERINARIA
-- Fecha: 29 de octubre de 2025
-- Descripción: Definición completa de la estructura de la base de datos
-- Incluye: Creación de tablas, índices, constraints y relaciones
-- ============================================================================

-- Configuración inicial
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
SET time_zone = "+00:00";

-- Eliminar y crear base de datos
DROP DATABASE IF EXISTS veterinaria;
CREATE DATABASE veterinaria CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE veterinaria;

-- ============================================================================
-- CREACIÓN DE TABLAS
-- ============================================================================

-- Tabla de roles
CREATE TABLE roles (
    id BIGINT PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL UNIQUE,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_roles_nombre (nombre),
    INDEX idx_roles_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Catálogo de roles del sistema';

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
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    INDEX idx_veterinarias_nombre (nombre),
    INDEX idx_veterinarias_ciudad (ciudad),
    INDEX idx_veterinarias_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Clínicas veterinarias registradas';

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
    activo BOOLEAN DEFAULT TRUE NOT NULL,
    veterinaria_id BIGINT NULL COMMENT 'ID de la veterinaria a la que pertenece el veterinario',
    INDEX idx_usuarios_username (username),
    INDEX idx_usuarios_email (email),
    INDEX idx_usuarios_activo (activo),
    INDEX idx_usuarios_veterinaria_id (veterinaria_id),
    CONSTRAINT fk_usuario_veterinaria 
        FOREIGN KEY (veterinaria_id) 
        REFERENCES veterinarias(id)
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Usuarios del sistema (Admin, Veterinarios, Clientes, Recepcionistas)';

-- Tabla intermedia para usuarios y roles (relación muchos a muchos)
CREATE TABLE usuarios_roles (
    usuario_documento VARCHAR(20),
    rol_id BIGINT,
    fecha_asignacion DATETIME DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usuario_documento, rol_id),
    CONSTRAINT fk_usuarios_roles_usuario 
        FOREIGN KEY (usuario_documento) 
        REFERENCES usuarios(documento) 
        ON DELETE CASCADE,
    CONSTRAINT fk_usuarios_roles_rol 
        FOREIGN KEY (rol_id) 
        REFERENCES roles(id) 
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Relación entre usuarios y roles';

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
    INDEX idx_mascotas_nombre (nombre),
    INDEX idx_mascotas_especie (especie),
    INDEX idx_mascotas_propietario (propietario_documento),
    INDEX idx_mascotas_activo (activo),
    CONSTRAINT fk_mascota_propietario 
        FOREIGN KEY (propietario_documento) 
        REFERENCES usuarios(documento) 
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Registro de mascotas de los clientes';

-- Tabla de citas
CREATE TABLE citas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fecha_hora DATETIME NOT NULL,
    motivo TEXT,
    estado ENUM('PROGRAMADA', 'CONFIRMADA', 'EN_CURSO', 'COMPLETADA', 'CANCELADA', 'NO_ASISTIO') DEFAULT 'PROGRAMADA' NOT NULL,
    observaciones TEXT,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    cliente_documento VARCHAR(20) NOT NULL,
    mascota_id BIGINT NOT NULL,
    veterinario_documento VARCHAR(20),
    veterinaria_id BIGINT,
    INDEX idx_citas_fecha_hora (fecha_hora),
    INDEX idx_citas_estado (estado),
    INDEX idx_citas_cliente (cliente_documento),
    INDEX idx_citas_mascota (mascota_id),
    INDEX idx_citas_veterinario (veterinario_documento),
    INDEX idx_citas_veterinaria (veterinaria_id),
    CONSTRAINT fk_cita_cliente 
        FOREIGN KEY (cliente_documento) 
        REFERENCES usuarios(documento) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_cita_mascota 
        FOREIGN KEY (mascota_id) 
        REFERENCES mascotas(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_cita_veterinario 
        FOREIGN KEY (veterinario_documento) 
        REFERENCES usuarios(documento) 
        ON DELETE SET NULL,
    CONSTRAINT fk_cita_veterinaria 
        FOREIGN KEY (veterinaria_id) 
        REFERENCES veterinarias(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Registro de citas médicas';

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
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    mascota_id BIGINT NOT NULL,
    veterinario_documento VARCHAR(20) NOT NULL,
    cita_id BIGINT,
    INDEX idx_historias_fecha (fecha_consulta),
    INDEX idx_historias_mascota (mascota_id),
    INDEX idx_historias_veterinario (veterinario_documento),
    INDEX idx_historias_cita (cita_id),
    CONSTRAINT fk_historia_mascota 
        FOREIGN KEY (mascota_id) 
        REFERENCES mascotas(id) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_historia_veterinario 
        FOREIGN KEY (veterinario_documento) 
        REFERENCES usuarios(documento) 
        ON DELETE RESTRICT,
    CONSTRAINT fk_historia_cita 
        FOREIGN KEY (cita_id) 
        REFERENCES citas(id) 
        ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Historias clínicas de las mascotas';

-- Tabla de reportes
CREATE TABLE reportes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    titulo VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATE,
    fecha_fin DATE,
    contenido_json TEXT,
    fecha_generacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    generado_por VARCHAR(20) NOT NULL,
    INDEX idx_reportes_tipo (tipo),
    INDEX idx_reportes_fecha (fecha_generacion),
    INDEX idx_reportes_generado_por (generado_por),
    CONSTRAINT fk_reporte_generado_por 
        FOREIGN KEY (generado_por) 
        REFERENCES usuarios(documento) 
        ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Reportes generados por el sistema';

-- ============================================================================
-- VISTAS ÚTILES
-- ============================================================================

-- Vista completa de mascotas con información del propietario
CREATE OR REPLACE VIEW vista_mascotas_completa AS
SELECT 
    m.id,
    m.nombre AS mascota_nombre,
    m.especie,
    m.raza,
    m.sexo,
    m.fecha_nacimiento,
    m.peso,
    m.color,
    m.observaciones,
    m.activo AS mascota_activa,
    CONCAT(u.nombres, ' ', u.apellidos) AS propietario_nombre,
    u.documento AS propietario_documento,
    u.telefono AS propietario_telefono,
    u.email AS propietario_email,
    TIMESTAMPDIFF(YEAR, m.fecha_nacimiento, CURDATE()) AS edad_anos,
    TIMESTAMPDIFF(MONTH, m.fecha_nacimiento, CURDATE()) % 12 AS edad_meses
FROM mascotas m
INNER JOIN usuarios u ON m.propietario_documento = u.documento;

-- Vista de citas con información completa
CREATE OR REPLACE VIEW vista_citas_completa AS
SELECT 
    c.id,
    c.fecha_hora,
    c.motivo,
    c.estado,
    c.observaciones,
    m.nombre AS mascota_nombre,
    m.especie AS mascota_especie,
    CONCAT(cliente.nombres, ' ', cliente.apellidos) AS cliente_nombre,
    cliente.telefono AS cliente_telefono,
    CONCAT(vet.nombres, ' ', vet.apellidos) AS veterinario_nombre,
    v.nombre AS veterinaria_nombre,
    c.fecha_creacion
FROM citas c
INNER JOIN mascotas m ON c.mascota_id = m.id
INNER JOIN usuarios cliente ON c.cliente_documento = cliente.documento
LEFT JOIN usuarios vet ON c.veterinario_documento = vet.documento
LEFT JOIN veterinarias v ON c.veterinaria_id = v.id;

-- Vista de veterinarios por veterinaria
CREATE OR REPLACE VIEW vista_veterinarios_por_veterinaria AS
SELECT 
    u.documento,
    CONCAT(u.nombres, ' ', u.apellidos) AS veterinario_nombre,
    u.email,
    u.telefono,
    v.id AS veterinaria_id,
    v.nombre AS veterinaria_nombre,
    u.activo
FROM usuarios u
INNER JOIN usuarios_roles ur ON u.documento = ur.usuario_documento
INNER JOIN roles r ON ur.rol_id = r.id
LEFT JOIN veterinarias v ON u.veterinaria_id = v.id
WHERE r.nombre = 'ROLE_VETERINARIO';

-- ============================================================================
-- PROCEDIMIENTOS ALMACENADOS ÚTILES
-- ============================================================================

DELIMITER //

-- Procedimiento para obtener estadísticas de citas
CREATE PROCEDURE sp_estadisticas_citas(
    IN fecha_inicio DATE,
    IN fecha_fin DATE
)
BEGIN
    SELECT 
        DATE(fecha_hora) as fecha,
        COUNT(*) as total_citas,
        SUM(CASE WHEN estado = 'COMPLETADA' THEN 1 ELSE 0 END) as completadas,
        SUM(CASE WHEN estado = 'CANCELADA' THEN 1 ELSE 0 END) as canceladas,
        SUM(CASE WHEN estado = 'NO_ASISTIO' THEN 1 ELSE 0 END) as no_asistio,
        SUM(CASE WHEN estado IN ('PROGRAMADA', 'CONFIRMADA') THEN 1 ELSE 0 END) as pendientes
    FROM citas
    WHERE DATE(fecha_hora) BETWEEN fecha_inicio AND fecha_fin
    GROUP BY DATE(fecha_hora)
    ORDER BY fecha;
END //

-- Procedimiento para obtener mascotas de un propietario
CREATE PROCEDURE sp_mascotas_por_propietario(
    IN propietario_doc VARCHAR(20)
)
BEGIN
    SELECT 
        m.*,
        TIMESTAMPDIFF(YEAR, m.fecha_nacimiento, CURDATE()) AS edad_anos,
        COUNT(DISTINCT c.id) as total_citas,
        COUNT(DISTINCT hc.id) as total_historias
    FROM mascotas m
    LEFT JOIN citas c ON m.id = c.mascota_id
    LEFT JOIN historias_clinicas hc ON m.id = hc.mascota_id
    WHERE m.propietario_documento = propietario_doc
    GROUP BY m.id
    ORDER BY m.fecha_registro DESC;
END //

DELIMITER ;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

DELIMITER //

-- Trigger para actualizar fecha de última modificación en usuarios
CREATE TRIGGER trg_usuarios_before_update
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
    -- Aquí se pueden agregar validaciones adicionales
    IF NEW.email != OLD.email THEN
        -- Validar que el nuevo email no exista
        IF EXISTS (SELECT 1 FROM usuarios WHERE email = NEW.email AND documento != NEW.documento) THEN
            SIGNAL SQLSTATE '45000' 
            SET MESSAGE_TEXT = 'El email ya está registrado para otro usuario';
        END IF;
    END IF;
END //

DELIMITER ;

-- ============================================================================
-- CONFIGURACIÓN FINAL
-- ============================================================================

SET FOREIGN_KEY_CHECKS = 1;
COMMIT;

-- Mensaje de finalización
SELECT '================================' as '';
SELECT '✅ ESTRUCTURA DE BASE DE DATOS CREADA EXITOSAMENTE' as RESULTADO;
SELECT '================================' as '';
SELECT 'Base de datos: veterinaria' as Info
UNION ALL
SELECT CONCAT('Tablas creadas: ', COUNT(*), ' tablas') FROM information_schema.tables WHERE table_schema = 'veterinaria'
UNION ALL
SELECT CONCAT('Vistas creadas: ', COUNT(*), ' vistas') FROM information_schema.views WHERE table_schema = 'veterinaria';

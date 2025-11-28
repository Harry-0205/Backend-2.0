-- Script para agregar la columna 'activo' a la tabla historias_clinicas
-- Ejecutar este script en la base de datos MySQL

USE veterinaria;

-- Agregar la columna activo con valor por defecto TRUE
ALTER TABLE historias_clinicas 
ADD COLUMN activo BOOLEAN NOT NULL DEFAULT TRUE;

-- Verificar que la columna se agregó correctamente
DESCRIBE historias_clinicas;

-- Mensaje de confirmación
SELECT 'Columna activo agregada exitosamente a la tabla historias_clinicas' AS Resultado;

-- Trigger MEJORADO - Sincroniza SIEMPRE que se actualice un usuario conductor
-- SIN verificar si enabled cambió (más robusto)

DELIMITER $$

-- Eliminar el trigger si ya existe
DROP TRIGGER IF EXISTS sync_conductor_estado_on_user_update$$

CREATE TRIGGER sync_conductor_estado_on_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    -- Sincronizar el conductor asociado basándose en el estado actual del usuario
    -- SIN importar si cambió o no
    UPDATE conductores 
    SET estado = CASE 
        WHEN NEW.enabled = 0 THEN 'INACTIVO'
        WHEN NEW.enabled = 1 THEN 'ACTIVO'
        ELSE estado
    END
    WHERE user_id = NEW.id;
END$$

DELIMITER ;

-- Sincronizar registros existentes
UPDATE conductores c
INNER JOIN users u ON c.user_id = u.id
SET c.estado = CASE 
    WHEN u.enabled = 0 THEN 'INACTIVO'
    WHEN u.enabled = 1 THEN 'ACTIVO'
    ELSE c.estado
END
WHERE (u.enabled = 0 AND c.estado = 'ACTIVO') 
   OR (u.enabled = 1 AND c.estado = 'INACTIVO');

-- Verificar que el trigger se creó correctamente
SHOW TRIGGERS WHERE `Table` = 'users';

SELECT '✅ Trigger mejorado creado - Sincronizará SIEMPRE en cada UPDATE' as status;

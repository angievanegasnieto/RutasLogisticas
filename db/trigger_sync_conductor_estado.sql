-- Trigger para sincronizar el estado del conductor cuando se desactiva un usuario
-- Cuando users.enabled cambia a 0, conductores.estado cambia a 'INACTIVO'
-- Cuando users.enabled cambia a 1, conductores.estado cambia a 'ACTIVO'

DELIMITER $$

-- Eliminar el trigger si ya existe
DROP TRIGGER IF EXISTS sync_conductor_estado_on_user_update$$

CREATE TRIGGER sync_conductor_estado_on_user_update
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    -- Si el campo enabled cambió
    IF OLD.enabled != NEW.enabled THEN
        -- Si el usuario fue desactivado (enabled = 0)
        IF NEW.enabled = 0 THEN
            UPDATE conductores 
            SET estado = 'INACTIVO' 
            WHERE user_id = NEW.id;
        
        -- Si el usuario fue activado (enabled = 1)
        ELSEIF NEW.enabled = 1 THEN
            UPDATE conductores 
            SET estado = 'ACTIVO' 
            WHERE user_id = NEW.id;
        END IF;
    END IF;
END$$

DELIMITER ;

-- Sincronizar registros existentes (por si hay inconsistencias)
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

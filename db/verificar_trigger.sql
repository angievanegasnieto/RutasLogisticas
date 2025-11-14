-- Script para verificar y solucionar la sincronización entre users y conductores

-- 1. Verificar que el trigger existe
SHOW TRIGGERS WHERE `Table` = 'users';

-- 2. Ver usuarios y sus conductores asociados
SELECT 
    u.id as user_id,
    u.name,
    u.enabled as user_enabled,
    c.id as conductor_id,
    c.nombre_completo,
    c.estado as conductor_estado,
    CASE 
        WHEN u.enabled = 0 AND c.estado = 'ACTIVO' THEN '❌ DESINCRONIZADO'
        WHEN u.enabled = 1 AND c.estado = 'INACTIVO' THEN '❌ DESINCRONIZADO'
        ELSE '✅ OK'
    END as sincronizacion
FROM users u
LEFT JOIN conductores c ON c.user_id = u.id
WHERE u.role = 'CONDUCTOR'
ORDER BY u.id;

-- 3. Sincronizar manualmente todos los registros desincronizados
UPDATE conductores c
INNER JOIN users u ON c.user_id = u.id
SET c.estado = CASE 
    WHEN u.enabled = 0 THEN 'INACTIVO'
    WHEN u.enabled = 1 THEN 'ACTIVO'
    ELSE c.estado
END
WHERE (u.enabled = 0 AND c.estado = 'ACTIVO') 
   OR (u.enabled = 1 AND c.estado = 'INACTIVO');

-- 4. Verificar que todo quedó sincronizado
SELECT 
    u.id as user_id,
    u.name,
    u.enabled as user_enabled,
    c.id as conductor_id,
    c.estado as conductor_estado,
    CASE 
        WHEN u.enabled = 0 AND c.estado = 'ACTIVO' THEN '❌ DESINCRONIZADO'
        WHEN u.enabled = 1 AND c.estado = 'INACTIVO' THEN '❌ DESINCRONIZADO'
        ELSE '✅ OK'
    END as sincronizacion
FROM users u
LEFT JOIN conductores c ON c.user_id = u.id
WHERE u.role = 'CONDUCTOR'
ORDER BY u.id;

-- 5. Prueba del trigger - Desactivar usuario ID 29 (ajusta el ID según necesites)
-- UPDATE users SET enabled = 0 WHERE id = 29;
-- SELECT * FROM conductores WHERE user_id = 29;

-- 6. Prueba del trigger - Reactivar usuario ID 29
-- UPDATE users SET enabled = 1 WHERE id = 29;
-- SELECT * FROM conductores WHERE user_id = 29;

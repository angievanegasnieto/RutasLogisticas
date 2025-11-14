-- Script para limpiar conductores huérfanos (conductores sin usuario asociado)
-- Ejecutar este script en la base de datos para eliminar los registros de conductores
-- cuyos usuarios ya no existen

-- Ver conductores huérfanos antes de eliminar
SELECT c.* 
FROM conductores c
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Ver asignaciones de ruta de conductores huérfanos
SELECT ar.* 
FROM asignaciones_ruta ar
INNER JOIN conductores c ON ar.conductor_id = c.id
LEFT JOIN users u ON c.user_id = u.id
WHERE u.id IS NULL;

-- Desactivar el modo seguro temporalmente
SET SQL_SAFE_UPDATES = 0;

-- PASO 1: Eliminar pedidos asignados a conductores huérfanos
DELETE FROM pedidos
WHERE conductor_id IN (
    SELECT id FROM conductores 
    WHERE user_id IS NULL 
       OR user_id NOT IN (SELECT id FROM users)
);

-- PASO 2: Eliminar asignaciones de ruta de conductores huérfanos
DELETE FROM asignaciones_ruta
WHERE conductor_id IN (
    SELECT id FROM conductores 
    WHERE user_id IS NULL 
       OR user_id NOT IN (SELECT id FROM users)
);

-- PASO 3: Eliminar asignaciones de vehículos de conductores huérfanos (si existen)
DELETE FROM asignaciones_vehiculo
WHERE conductor_id IN (
    SELECT id FROM conductores 
    WHERE user_id IS NULL 
       OR user_id NOT IN (SELECT id FROM users)
);

-- PASO 4: Ahora sí eliminar los conductores huérfanos
DELETE FROM conductores
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM users);

-- Reactivar el modo seguro
SET SQL_SAFE_UPDATES = 1;

-- Verificar que se hayan eliminado
SELECT COUNT(*) as conductores_restantes FROM conductores;
SELECT COUNT(*) as pedidos_restantes FROM pedidos;
SELECT COUNT(*) as asignaciones_ruta_restantes FROM asignaciones_ruta;
SELECT COUNT(*) as asignaciones_vehiculo_restantes FROM asignaciones_vehiculo;

-- Script para actualizar la tabla eventos_entrega existente
-- Agrega columnas para soportar registro directo de eventos de pedidos
-- (además del esquema existente con paradas_ruta)

-- Agregar columnas nuevas si no existen
ALTER TABLE eventos_entrega 
ADD COLUMN IF NOT EXISTS pedido_id BIGINT NULL AFTER parada_ruta_id,
ADD COLUMN IF NOT EXISTS conductor_id BIGINT NULL AFTER pedido_id,
ADD COLUMN IF NOT EXISTS estado_anterior VARCHAR(50) NULL AFTER conductor_id,
ADD COLUMN IF NOT EXISTS estado_nuevo VARCHAR(50) NULL AFTER estado_anterior,
ADD COLUMN IF NOT EXISTS notas VARCHAR(500) NULL AFTER mensaje,
ADD COLUMN IF NOT EXISTS latitud DECIMAL(10,7) NULL AFTER notas,
ADD COLUMN IF NOT EXISTS longitud DECIMAL(10,7) NULL AFTER latitud;

-- Agregar índices para mejorar rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_evento_pedido ON eventos_entrega(pedido_id);
CREATE INDEX IF NOT EXISTS idx_evento_conductor ON eventos_entrega(conductor_id);

-- Agregar foreign key para pedido_id si no existe
ALTER TABLE eventos_entrega 
ADD CONSTRAINT IF NOT EXISTS fk_evento_pedido 
FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE;

-- Agregar foreign key para conductor_id si no existe
ALTER TABLE eventos_entrega 
ADD CONSTRAINT IF NOT EXISTS fk_evento_conductor 
FOREIGN KEY (conductor_id) REFERENCES conductores(id) ON DELETE SET NULL;

-- Hacer parada_ruta_id nullable para permitir eventos directos de pedidos
ALTER TABLE eventos_entrega 
MODIFY COLUMN parada_ruta_id BIGINT NULL;

-- Consultas útiles para reportes

-- Ver historial de un pedido específico
-- SELECT * FROM eventos_entrega WHERE pedido_id = ? ORDER BY fecha_evento DESC;

-- Contar reintentos por pedido
-- SELECT pedido_id, COUNT(*) as total_reintentos 
-- FROM eventos_entrega 
-- WHERE tipo_evento = 'REINTENTO' AND pedido_id IS NOT NULL
-- GROUP BY pedido_id;

-- Pedidos con más reintentos
-- SELECT p.id, c.nombre_completo as cliente, COUNT(e.id) as reintentos
-- FROM pedidos p
-- INNER JOIN clientes c ON p.cliente_id = c.id
-- LEFT JOIN eventos_entrega e ON p.id = e.pedido_id AND e.tipo_evento = 'REINTENTO'
-- GROUP BY p.id, c.nombre_completo
-- HAVING COUNT(e.id) > 0
-- ORDER BY reintentos DESC;

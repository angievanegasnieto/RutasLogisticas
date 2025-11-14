# Solución: Eliminación en Cascada de Conductores

## Problema Resuelto
Cuando se eliminaba un usuario con rol CONDUCTOR, el registro en la tabla `conductores` permanecía en la base de datos, creando registros huérfanos.

## Cambios Implementados

### 1. Backend - Microservicio Auth (`AdminUserService.java`)
- Se agregó comunicación con el microservicio backend para eliminar el conductor antes de eliminar el usuario
- Se usa RestTemplate para llamar al endpoint DELETE `/api/conductores/usuario/{userId}`
- Si no existe el conductor o hay error, continúa con la eliminación del usuario sin fallar

### 2. Backend - Microservicio Principal (`ConductoresController.java`)
Se agregaron dos nuevos endpoints DELETE:

**Eliminar conductor por ID:**
```
DELETE /api/conductores/{id}
```

**Eliminar conductor por userId (cascada):**
```
DELETE /api/conductores/usuario/{userId}
```

### 3. Script SQL de Limpieza
Se creó el archivo `db/limpiar_conductores_huerfanos.sql` para limpiar los registros huérfanos existentes.

## Pasos para Aplicar la Solución

### Paso 1: Compilar los microservicios
```powershell
# Compilar microservicio Auth
cd "c:\INGSOFT\angie elmer kevin\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\auth\RutasLogisticas"
mvn clean package -DskipTests

# Compilar microservicio Backend
cd "c:\INGSOFT\angie elmer kevin\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\backend\RutasLogisticas"
mvn clean package -DskipTests
```

### Paso 2: Limpiar registros huérfanos existentes
Ejecuta el script SQL en tu base de datos:

```sql
-- Ver conductores huérfanos
SELECT c.* 
FROM conductores c
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

-- PASO 3: Eliminar asignaciones de vehículos de conductores huérfanos
DELETE FROM asignaciones_vehiculo
WHERE conductor_id IN (
    SELECT id FROM conductores 
    WHERE user_id IS NULL 
       OR user_id NOT IN (SELECT id FROM users)
);

-- PASO 4: Eliminar conductores huérfanos
DELETE FROM conductores
WHERE user_id IS NULL 
   OR user_id NOT IN (SELECT id FROM users);

-- Reactivar el modo seguro
SET SQL_SAFE_UPDATES = 1;
```

**IMPORTANTE:** 
- Esto eliminará TODOS los datos relacionados con conductores huérfanos (pedidos, asignaciones de ruta, asignaciones de vehículos)
- Luego eliminará los registros de conductores con IDs 1-8 que ya no tienen usuario asociado
- Se respetan las restricciones de clave foránea eliminando las dependencias en el orden correcto

### Paso 3: Reiniciar los servicios
1. Detén ambos microservicios (Auth y Backend)
2. Inícialo de nuevo con docker-compose o manualmente

### Paso 4: Verificar
1. Crea un nuevo usuario con rol CONDUCTOR
2. Elimina ese usuario desde el panel de administración
3. Verifica en la base de datos que el registro del conductor también se eliminó:
   ```sql
   SELECT * FROM conductores WHERE user_id = {id_del_usuario_eliminado};
   ```
   No debería retornar ningún registro.

## Funcionamiento

Cuando ahora elimines un usuario:

1. El `AdminUserService` detecta que se va a eliminar un usuario
2. Hace una llamada HTTP DELETE al backend: `/api/conductores/usuario/{userId}`
3. El backend busca el conductor con ese `user_id`
4. Si lo encuentra, lo elimina de la tabla `conductores`
5. El servicio auth continúa y elimina el usuario de la tabla `users`

De esta forma, NO quedarán registros huérfanos en la tabla de conductores.

## Notas Importantes
- La eliminación del conductor es opcional (no falla si no existe)
- Los conductores con `user_id` NULL o que no existen en `users` son considerados huérfanos
- La solución usa comunicación entre microservicios vía HTTP
- Asegúrate de que ambos microservicios estén corriendo en sus puertos correctos (8080 para auth, 8081 para backend)

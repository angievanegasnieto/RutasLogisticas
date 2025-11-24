# 🎯 PASOS FINALES - Copiar Backend e Iniciar Sistema

## ✅ YA COMPLETADO (Automático)

1. ✅ **Backend Integration Files** - Todos los archivos Java están en:
   - `src/backend-integration/entity/` (Cliente, Direccion, Auditoria, Pedido)
   - `src/backend-integration/Repository/` (4 repositorios)
   - `src/backend-integration/Service/` (PedidoService, NotificacionService)
   - `src/backend-integration/Controller/` (PedidosController)
   - `src/backend-integration/Request/` (CreatePedidoRequest)
   - `src/backend-integration/View/` (PedidoView)

2. ✅ **Frontend Angular** - Todo integrado:
   - ✅ `src/app/pages/pedidos/pedidos.component.ts` creado
   - ✅ `src/app/core/pedidos.service.ts` creado
   - ✅ `src/app/core/models.ts` actualizado con interfaces Pedido, Cliente, Direccion, etc.
   - ✅ Ruta `/pedidos` ya configurada en `app.routes.ts`

---

## 📋 PASO 1: COPIAR ARCHIVOS BACKEND AL PROYECTO REAL

Debes copiar **MANUALMENTE** los archivos de `src/backend-integration/` al backend real que está fuera del workspace.

### Desde (este workspace):
```
C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\frontend\frontend-app\src\backend-integration\
```

### Hacia (tu backend real):
```
C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\backend\RutasLogisticas\src\main\java\rutaslogisticas\
```

### Archivos a copiar:

#### 📁 entity/
- `Cliente.java`
- `Direccion.java`
- `Auditoria.java`
- `Pedido.java`

#### 📁 Repository/
- `ClienteRepository.java`
- `DireccionRepository.java`
- `AuditoriaRepository.java`
- `PedidoRepository.java`

#### 📁 Service/
- `PedidoService.java`
- `NotificacionService.java`

#### 📁 Controller/
- `PedidosController.java`

#### 📁 Request/
- `CreatePedidoRequest.java`

#### 📁 View/
- `PedidoView.java`

---

## 🔧 PASO 2: COMPILAR BACKEND

Abre el backend en NetBeans y compila:

```bash
cd C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\backend\RutasLogisticas
mvn clean install
```

✅ **Verificar:**
- No hay errores de compilación
- Tablas nuevas creadas en MySQL: `clientes`, `direcciones`, `pedidos`, `auditoria`

---

## 🚀 PASO 3: INICIAR SERVICIOS

### 1. MySQL (si no está corriendo)
```bash
# Verificar que MySQL esté activo en puerto 3306
# Base de datos: logisticsdb
```

### 2. Backend Auth (Puerto 8081)
```bash
cd C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\auth\RutasLogisticas
mvn spring-boot:run
```

### 3. Backend Principal (Puerto configurado)
```bash
cd C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\backend\RutasLogisticas
mvn spring-boot:run
```

### 4. Gateway (Puerto 8080)
```bash
cd C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\gateway
mvn spring-boot:run
```

### 5. Frontend Angular (Puerto 4200)
```bash
cd C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\frontend\frontend-app
npm start
```

---

## 🧪 PASO 4: PRUEBAS

### Prueba 1: Backend con Postman

**Endpoint clave:**
```
PATCH http://localhost:8081/api/pedidos/1/estado?estado=EN_RUTA
Authorization: Bearer <TU_TOKEN_JWT>
```

Respuesta esperada:
```json
{
  "id": 1,
  "estado": "EN_RUTA",
  "clienteNombre": "Cliente Test",
  "direccionCompleta": "Calle 123",
  "volumen": 10.0,
  "peso": 500.0
}
```

### Prueba 2: Frontend Angular

1. Abrir: http://localhost:4200
2. Login con: `operador@logistica.com` / `123456`
3. Navegar a: **Pedidos** (menú lateral)
4. Verificar:
   - ✅ Lista de pedidos se muestra
   - ✅ Filtro por estado funciona
   - ✅ Dropdown "Cambiar Estado" permite seleccionar nuevo estado
   - ✅ Al cambiar estado, se actualiza inmediatamente la lista

---

## 📊 ENDPOINTS DISPONIBLES

### GET `/api/pedidos`
Listar todos los pedidos

### GET `/api/pedidos/{id}`
Obtener pedido por ID

### POST `/api/pedidos`
Crear nuevo pedido

### PATCH `/api/pedidos/{id}/estado?estado={ESTADO}`
**⭐ ENDPOINT PRINCIPAL:** Cambiar estado de pedido
- Estados: `PENDIENTE`, `ASIGNADO`, `EN_RUTA`, `ENTREGADO`, `FALLIDO`, `REINTENTO`

### GET `/api/pedidos/notificaciones`
Obtener historial de notificaciones (cambios de estado)

### GET `/api/pedidos/dashboard/resumen`
Estadísticas de pedidos por estado

---

## 🎨 ESTADOS Y COLORES

| Estado | Color | Significado |
|--------|-------|-------------|
| PENDIENTE | Gris `#94a3b8` | Pedido creado, sin asignar |
| ASIGNADO | Azul `#3b82f6` | Asignado a conductor/vehículo |
| EN_RUTA | Amarillo `#f59e0b` | Conductor en camino |
| ENTREGADO | Verde `#22c55e` | Pedido entregado exitosamente |
| FALLIDO | Rojo `#ef4444` | Entrega fallida |
| REINTENTO | Morado `#8b5cf6` | Reintento programado |

---

## 🔍 ESTRUCTURA DE NOTIFICACIONES

Cuando cambias el estado de un pedido:

1. **Frontend** llama:
   ```typescript
   PATCH /api/pedidos/1/estado?estado=EN_RUTA
   ```

2. **PedidosController** recibe la petición

3. **PedidoService.actualizarEstadoPedido()** guarda el nuevo estado

4. **NotificacionService.enviarNotificacionCambioEstado()** registra en tabla `auditoria`:
   ```sql
   INSERT INTO auditoria (accion, tipo_entidad, entidad_id, mensaje, nivel, creado_en)
   VALUES ('CAMBIO_ESTADO_PEDIDO', 'PEDIDO', 1, 'Pedido #1 cambió de PENDIENTE → EN_RUTA', 'INFO', NOW());
   ```

5. **Frontend** puede consultar:
   ```typescript
   GET /api/pedidos/notificaciones
   ```

---

## 🚨 SOLUCIÓN DE PROBLEMAS

### Error: "Table 'logisticsdb.pedidos' doesn't exist"
**Solución:**
1. Verificar `application.properties`:
   ```properties
   spring.jpa.hibernate.ddl-auto=update
   ```
2. Reiniciar backend para que JPA cree las tablas

### Error 404 en `/api/pedidos`
**Solución:**
1. Verificar que PedidosController esté copiado correctamente
2. Verificar que backend esté corriendo
3. Verificar proxy.conf.json apunta a puerto correcto

### Frontend no muestra pedidos
**Solución:**
1. Abrir DevTools (F12) → Console
2. Verificar llamadas HTTP: debe ser `GET http://localhost:4200/api/pedidos`
3. Si falla, verificar que `npm start` esté usando proxy:
   ```bash
   ng serve --port 4200 --proxy-config proxy.conf.json
   ```

### No se guardan notificaciones
**Solución:**
1. Verificar que tabla `auditoria` existe en MySQL
2. Verificar que AuditoriaRepository esté copiado
3. Verificar logs del backend: debe aparecer "🔔 NOTIFICACIÓN: ..."

---

## 📝 RESUMEN DE ARCHIVOS

### Backend (14 archivos Java):
- 4 Entities
- 4 Repositories
- 2 Services
- 1 Controller
- 2 DTOs (Request, View)

### Frontend (3 archivos TypeScript):
- `pedidos.component.ts` (459 líneas con template inline)
- `pedidos.service.ts` (109 líneas)
- `models.ts` (actualizado con ~15 interfaces nuevas)

---

## ✅ CHECKLIST FINAL

Antes de probar, asegúrate:

- [ ] Archivos backend copiados desde `src/backend-integration/` al proyecto real
- [ ] Backend compilado sin errores (`mvn clean install`)
- [ ] MySQL corriendo (puerto 3306)
- [ ] Backend Auth corriendo (puerto 8081)
- [ ] Backend Principal corriendo
- [ ] Gateway corriendo (puerto 8080)
- [ ] Frontend corriendo (puerto 4200 con proxy)
- [ ] Login exitoso en frontend
- [ ] Menú "Pedidos" visible

---

## 🎉 LISTO!

Si todo está correcto, tendrás:
- ✅ Sistema completo de gestión de pedidos
- ✅ Cambio de estado con 6 estados
- ✅ Notificaciones automáticas guardadas en auditoría
- ✅ UI con filtros y selector de estado
- ✅ Colores visuales por estado
- ✅ Auto-refresh cada 30 segundos

**¡A probar! 🚀**

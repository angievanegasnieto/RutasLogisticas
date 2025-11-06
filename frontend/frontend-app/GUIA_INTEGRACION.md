# 📋 GUÍA DE INTEGRACIÓN - Sistema de Pedidos y Notificaciones

Esta guía describe paso a paso cómo integrar el sistema de cambio de estado de pedidos y notificaciones desde los archivos copiados al proyecto principal.

---

## 🎯 OBJETIVO
Integrar funcionalidad de:
- Gestión de pedidos (CRUD)
- Cambio de estado de pedidos (PENDIENTE → ASIGNADO → EN_RUTA → ENTREGADO/FALLIDO)
- Sistema de notificaciones automáticas al cambiar estado
- UI para visualizar y gestionar pedidos

---

## 📦 PARTE 1: INTEGRACIÓN BACKEND

### Ruta Base Backend
**Destino:** `C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\backend\RutasLogisticas\src\main\java\rutaslogisticas`

### Paso 1️⃣: Copiar Entidades (Entity)

**Desde:** `frontend-app\copia back\rutaslogisticas\entity\`
**Hacia:** `backend\RutasLogisticas\src\main\java\rutaslogisticas\entity\`

Archivos a copiar:

1. ✅ **Cliente.java** (54 líneas)
   - Entidad principal para clientes
   - Campos: id, nombre, nit, correoContacto, telefonoContacto
   - Relación: OneToMany con Direccion

2. ✅ **Direccion.java** (99 líneas)
   - Direcciones de clientes con geocodificación
   - Campos: id, cliente, direccion, ciudad, departamento, pais, lat, lng, verificada
   - Enum: PrecisionGeocodificacion (ALTA, MEDIA, BAJA)

3. ✅ **Auditoria.java** (74 líneas)
   - Registro de acciones para notificaciones
   - Campos: id, usuarioId, accion, tipoEntidad, entidadId, nivel, mensaje, creadoEn
   - Enum: Nivel (INFO, ADVERTENCIA, ERROR)

4. ✅ **Pedido.java** (Leer archivo completo)
   - Entidad principal del sistema
   - Campos: id, cliente, direccion, fechaProgramada, ventanaInicio, ventanaFin, volumen, peso, estado, creadoEn
   - **Enum: EstadoPedido** (PENDIENTE, ASIGNADO, EN_RUTA, ENTREGADO, FALLIDO, REINTENTO)
   - Relaciones: ManyToOne con Cliente y Direccion

⚠️ **VERIFICAR:** Si ya existe `User.java` en el proyecto principal, NO sobrescribir. Las entidades pueden coexistir.

---

### Paso 2️⃣: Copiar Repositorios (Repository)

**Desde:** `frontend-app\copia back\rutaslogisticas\Repository\`
**Hacia:** `backend\RutasLogisticas\src\main\java\rutaslogisticas\Repository\`

Archivos a copiar:

1. ✅ **ClienteRepository.java**
   ```java
   public interface ClienteRepository extends JpaRepository<Cliente, Long> {
       Optional<Cliente> findByNit(String nit);
   }
   ```

2. ✅ **DireccionRepository.java**
   ```java
   public interface DireccionRepository extends JpaRepository<Direccion, Long> {
       List<Direccion> findByClienteId(Long clienteId);
   }
   ```

3. ✅ **AuditoriaRepository.java**
   ```java
   public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
       List<Auditoria> findByTipoEntidadAndEntidadId(String tipoEntidad, Long entidadId);
   }
   ```

4. ✅ **PedidoRepository.java**
   ```java
   public interface PedidoRepository extends JpaRepository<Pedido, Long> {
       List<Pedido> findByEstado(Pedido.EstadoPedido estado);
       List<Pedido> findByClienteId(Long clienteId);
   }
   ```

---

### Paso 3️⃣: Copiar Servicios (Service)

**Desde:** `frontend-app\copia back\rutaslogisticas\Service\`
**Hacia:** `backend\RutasLogisticas\src\main\java\rutaslogisticas\Service\`

Archivos a copiar:

1. ✅ **PedidoService.java**
   - Métodos principales:
     - `List<Pedido> obtenerTodos()`
     - `Optional<Pedido> obtenerPorId(Long id)`
     - `Pedido crearPedido(CreatePedidoRequest request)`
     - `Pedido actualizarEstadoPedido(Long id, EstadoPedido nuevoEstado)` ⭐ **MÉTODO CLAVE**
     - `void eliminarPedido(Long id)`
   
   ⚠️ **IMPORTANTE:** Este servicio llama a `NotificacionService.enviarNotificacionCambioEstado()` al cambiar estado

2. ✅ **NotificacionService.java**
   - Métodos principales:
     - `void enviarNotificacionCambioEstado(Pedido pedido, EstadoPedido estadoAnterior, EstadoPedido estadoNuevo)`
     - `List<Auditoria> obtenerNotificacionesPedido(Long pedidoId)`
   
   📝 Guarda en tabla `auditoria` el cambio de estado como notificación

---

### Paso 4️⃣: Copiar Controladores (Controller)

**Desde:** `frontend-app\copia back\rutaslogisticas\Controller\`
**Hacia:** `backend\RutasLogisticas\src\main\java\rutaslogisticas\Controller\`

Archivos a copiar:

1. ✅ **PedidosController.java** (145 líneas)
   
   **Endpoints principales:**
   
   ```java
   GET    /api/pedidos                        // Listar todos
   GET    /api/pedidos/{id}                   // Obtener por ID
   POST   /api/pedidos                        // Crear nuevo
   PATCH  /api/pedidos/{id}/estado?estado=... // ⭐ CAMBIAR ESTADO (CORE)
   DELETE /api/pedidos/{id}                   // Eliminar
   GET    /api/pedidos/estado/{estado}        // Filtrar por estado
   GET    /api/pedidos/notificaciones         // Historial notificaciones
   ```

   ⚠️ **ENDPOINT CLAVE:** 
   ```java
   @PatchMapping("/{id}/estado")
   public ResponseEntity<PedidoView> actualizarEstado(
       @PathVariable Long id,
       @RequestParam("estado") Pedido.EstadoPedido nuevoEstado
   )
   ```

---

### Paso 5️⃣: Copiar DTOs (Request/View)

**Desde:** `frontend-app\copia back\rutaslogisticas\Request\` y `View\`
**Hacia:** `backend\RutasLogisticas\src\main\java\rutaslogisticas\Request\` y `View\`

Archivos a copiar:

**Request (DTOs de entrada):**
1. ✅ **CreatePedidoRequest.java**
2. ✅ **UpdatePedidoRequest.java** (si existe)

**View (DTOs de salida):**
1. ✅ **PedidoView.java**
2. ✅ **ClienteView.java** (si existe)
3. ✅ **DireccionView.java** (si existe)

---

### Paso 6️⃣: Compilar Backend

Desde NetBeans o terminal:

```bash
cd C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\backend\RutasLogisticas
mvn clean install
```

✅ **VERIFICAR:** No hay errores de compilación
✅ **VERIFICAR:** MySQL creó nuevas tablas: `clientes`, `direcciones`, `pedidos`, `auditoria`

---

## 🎨 PARTE 2: INTEGRACIÓN FRONTEND

### Ruta Base Frontend
**Destino:** `C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\frontend\frontend-app\src\app`

### Paso 1️⃣: Copiar Componente de Pedidos

**Desde:** `frontend-app\copia front\frontend-app\src\app\pages\pedidos\`
**Hacia:** `frontend\frontend-app\src\app\pages\pedidos\`

Archivos a copiar:

1. ✅ **pedidos.component.ts** (459 líneas)
   - Funciones principales:
     - `cargarPedidos()` - Carga lista de pedidos
     - `filtrarPorEstado(estado)` - Filtro por estado
     - `cambiarEstado(pedido, nuevoEstado)` - Cambio de estado con confirmación
     - `verDetalles(pedido)` - Modal de detalles
   
2. ✅ **pedidos.component.html**
   - UI con cards de pedidos
   - Dropdown selector de estado
   - Badges de colores según estado
   - Modal de detalles

3. ✅ **pedidos.component.css**
   - Estilos para badges, cards, estado
   - Colores por estado:
     - PENDIENTE: amarillo (#ffc107)
     - ASIGNADO: azul (#17a2b8)
     - EN_RUTA: naranja (#fd7e14)
     - ENTREGADO: verde (#28a745)
     - FALLIDO: rojo (#dc3545)

---

### Paso 2️⃣: Copiar Componente de Notificaciones

**Desde:** `frontend-app\copia front\frontend-app\src\app\components\notificaciones\`
**Hacia:** `frontend\frontend-app\src\app\components\notificaciones\`

Archivos a copiar:

1. ✅ **notificaciones.component.ts** (377 líneas)
   - Funciones:
     - `cargarNotificaciones()` - Auto-refresh cada 30s
     - `marcarVista(notif)` - Marcar como leída
     - `marcarTodasVistas()` - Marcar todas
   
2. ✅ **notificaciones.component.html**
   - Badge con contador de no leídas
   - Lista de notificaciones con transición de estados
   - Timestamps relativos

3. ✅ **notificaciones.component.css**
   - Estilos para badge, lista, transiciones

---

### Paso 3️⃣: Copiar Servicio de Pedidos

**Desde:** `frontend-app\copia front\frontend-app\src\app\core\pedidos.service.ts`
**Hacia:** `frontend\frontend-app\src\app\core\pedidos.service.ts`

Métodos principales:
```typescript
getPedidos(): Observable<Pedido[]>
getPedidoById(id: number): Observable<Pedido>
createPedido(pedido: any): Observable<Pedido>
actualizarEstadoPedido(id: number, estado: EstadoPedido): Observable<Pedido>  // ⭐ CLAVE
deletePedido(id: number): Observable<void>
getPedidosByEstado(estado: EstadoPedido): Observable<Pedido[]>
getNotificaciones(): Observable<Notificacion[]>
```

---

### Paso 4️⃣: Actualizar Modelos (Models)

**Archivo:** `frontend\frontend-app\src\app\core\models.ts`

**Agregar al final del archivo:**

```typescript
// ====== PEDIDOS Y NOTIFICACIONES ======

export enum EstadoPedido {
  PENDIENTE = 'PENDIENTE',
  ASIGNADO = 'ASIGNADO',
  EN_RUTA = 'EN_RUTA',
  ENTREGADO = 'ENTREGADO',
  FALLIDO = 'FALLIDO',
  REINTENTO = 'REINTENTO'
}

export interface Cliente {
  id: number;
  nombre: string;
  nit: string;
  correoContacto?: string;
  telefonoContacto?: string;
}

export interface Direccion {
  id: number;
  etiqueta?: string;
  direccion: string;
  ciudad: string;
  departamento?: string;
  pais: string;
  codigoPostal?: string;
  lat?: number;
  lng?: number;
  verificada: boolean;
}

export interface Pedido {
  id: number;
  cliente: Cliente;
  direccion: Direccion;
  fechaProgramada: string;
  ventanaInicio?: string;
  ventanaFin?: string;
  volumen?: number;
  peso?: number;
  estado: EstadoPedido;
  creadoEn: string;
}

export interface NotificacionPedido {
  id: number;
  pedidoId: number;
  mensaje: string;
  estadoAnterior: EstadoPedido;
  estadoNuevo: EstadoPedido;
  creadoEn: string;
  visto: boolean;
}
```

---

### Paso 5️⃣: Actualizar Rutas (app.routes.ts)

**Archivo:** `frontend\frontend-app\src\app\app.routes.ts`

**Agregar ruta de pedidos:**

```typescript
import { PedidosComponent } from './pages/pedidos/pedidos.component';

export const routes: Routes = [
  // ... rutas existentes ...
  
  {
    path: 'pedidos',
    component: PedidosComponent,
    canActivate: [authGuard]
  },
  
  // ... resto de rutas ...
];
```

⚠️ **NOTA:** Si tienes un menú de navegación, agregar enlace a `/pedidos`

---

## ✅ PARTE 3: VALIDACIÓN Y PRUEBAS

### Prueba 1: Backend con Postman

**1. Listar pedidos:**
```
GET http://localhost:8081/api/pedidos
Authorization: Bearer <TU_JWT_TOKEN>
```

**2. Cambiar estado de pedido (CORE):**
```
PATCH http://localhost:8081/api/pedidos/1/estado?estado=EN_RUTA
Authorization: Bearer <TU_JWT_TOKEN>
```

Respuesta esperada:
```json
{
  "id": 1,
  "estado": "EN_RUTA",
  "cliente": {...},
  "direccion": {...}
}
```

**3. Ver notificaciones:**
```
GET http://localhost:8081/api/pedidos/notificaciones
Authorization: Bearer <TU_JWT_TOKEN>
```

---

### Prueba 2: Frontend Angular

**1. Iniciar frontend:**
```bash
cd C:\INGSOFT\RutasLogisticas-feature-DiegoFrontend\RutasLogisticas-feature-DiegoFrontend\frontend\frontend-app
npm start
```

**2. Navegar a:** http://localhost:4200/pedidos

**3. Verificar:**
- ✅ Lista de pedidos se carga
- ✅ Filtros por estado funcionan
- ✅ Dropdown "Cambiar Estado" aparece
- ✅ Al cambiar estado, se actualiza inmediatamente
- ✅ Componente de notificaciones muestra cambio
- ✅ Badge de notificaciones incrementa contador

---

## 🚨 PROBLEMAS COMUNES

### Error: "Table 'logisticsdb.clientes' doesn't exist"
**Solución:** JPA debe crear las tablas automáticamente. Verificar `application.properties`:
```properties
spring.jpa.hibernate.ddl-auto=update
```

### Error: "Cannot find PedidoService"
**Solución:** Verificar que todos los archivos de Service/ estén copiados y compilados

### Error 404 en /api/pedidos
**Solución:** 
1. Verificar que PedidosController esté en el paquete correcto
2. Verificar que el backend esté corriendo en puerto 8081
3. Verificar proxy.conf.json apunta a localhost:8080 para /api

### Notificaciones no se muestran
**Solución:**
1. Verificar que AuditoriaRepository esté copiado
2. Verificar que NotificacionService.enviarNotificacionCambioEstado() se llame en PedidoService
3. Verificar query en NotificacionService: `findByTipoEntidadAndEntidadId("PEDIDO", pedidoId)`

---

## 📝 RESUMEN DE ARCHIVOS

### Backend (14 archivos):
- entity/: Cliente, Direccion, Auditoria, Pedido
- Repository/: ClienteRepository, DireccionRepository, AuditoriaRepository, PedidoRepository
- Service/: PedidoService, NotificacionService
- Controller/: PedidosController
- Request/: CreatePedidoRequest
- View/: PedidoView

### Frontend (8 archivos):
- pages/pedidos/: pedidos.component.ts + .html + .css
- components/notificaciones/: notificaciones.component.ts + .html + .css
- core/: pedidos.service.ts
- core/models.ts: Agregar interfaces Pedido, Cliente, Direccion, NotificacionPedido, EstadoPedido

---

## 🎉 COMPLETADO

Después de seguir esta guía tendrás:
- ✅ CRUD completo de pedidos
- ✅ Sistema de cambio de estado con 6 estados
- ✅ Notificaciones automáticas al cambiar estado
- ✅ UI con filtros y dropdowns
- ✅ Historial de auditoría

**¿Dudas?** Revisa los archivos originales en `copia back/` y `copia front/` para referencia completa.

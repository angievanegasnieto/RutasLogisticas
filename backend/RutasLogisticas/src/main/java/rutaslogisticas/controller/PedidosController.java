package rutaslogisticas.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.Service.PedidoService;
import rutaslogisticas.Service.NotificacionService;
import rutaslogisticas.View.PedidoView;
import rutaslogisticas.Request.CreatePedidoRequest;
import rutaslogisticas.entity.Pedido;
import rutaslogisticas.entity.Auditoria;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "http://localhost:4200")
public class PedidosController {

    @Autowired
    private PedidoService pedidoService;

    @Autowired
    private NotificacionService notificacionService;

    /**
     * 📋 Obtener todos los pedidos
     */
    @GetMapping
    public ResponseEntity<List<PedidoView>> obtenerTodosLosPedidos() {
        List<PedidoView> pedidos = pedidoService.obtenerTodosPedidos();
        return ResponseEntity.ok(pedidos);
    }

    /**
     * 📋 Obtener pedido por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<PedidoView> obtenerPedidoPorId(@PathVariable Long id) {
        return pedidoService.obtenerPedidoPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * ✅ Crear nuevo pedido (con notificación)
     */
    @PostMapping
    public ResponseEntity<PedidoView> crearPedido(@RequestBody CreatePedidoRequest request) {
        try {
            PedidoView nuevoPedido = pedidoService.crearPedido(request);
            return ResponseEntity.ok(nuevoPedido);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 🔔 ACTUALIZAR ESTADO DE PEDIDO (NÚCLEO DE NOTIFICACIONES)
     * pendiente → en curso → finalizado con notificación visual
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<PedidoView> actualizarEstadoPedido(
            @PathVariable Long id,
            @RequestParam String estado) {
        try {
            Pedido.EstadoPedido nuevoEstado = Pedido.EstadoPedido.valueOf(estado.toUpperCase());
            PedidoView pedidoActualizado = pedidoService.actualizarEstadoPedido(id, nuevoEstado);
            return ResponseEntity.ok(pedidoActualizado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 🔍 Filtrar pedidos por estado
     */
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PedidoView>> obtenerPedidosPorEstado(@PathVariable String estado) {
        try {
            Pedido.EstadoPedido estadoPedido = Pedido.EstadoPedido.valueOf(estado.toUpperCase());
            List<PedidoView> pedidos = pedidoService.obtenerPedidosPorEstado(estadoPedido);
            return ResponseEntity.ok(pedidos);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 🔔 OBTENER NOTIFICACIONES DE PEDIDOS
     */
    @GetMapping("/notificaciones")
    public ResponseEntity<List<Auditoria>> obtenerNotificaciones() {
        List<Auditoria> notificaciones = notificacionService.obtenerNotificacionesPedidos();
        return ResponseEntity.ok(notificaciones);
    }

    /**
     * 🗑️ Eliminar pedido
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminarPedido(@PathVariable Long id) {
        try {
            pedidoService.eliminarPedido(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 📊 DASHBOARD: Resumen de estados con conteos
     */
    @GetMapping("/dashboard/resumen")
    public ResponseEntity<Map<String, Object>> obtenerResumenEstados() {
        try {
            Map<String, Long> resumen = pedidoService.obtenerResumenEstados();

            // Calcular total
            long total = resumen.values().stream().mapToLong(value -> value).sum();

            // Crear respuesta con información adicional
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("conteos", resumen);
            respuesta.put("total", total);
            respuesta.put("timestamp", System.currentTimeMillis());

            // Agregar colores para el frontend
            Map<String, String> colores = new HashMap<>();
            colores.put("pendientes", "#FFA500");    // Naranja
            colores.put("asignados", "#4169E1");     // Azul real
            colores.put("enRuta", "#1E90FF");        // Azul dodger
            colores.put("entregados", "#32CD32");    // Verde lima
            colores.put("fallidos", "#FF6347");      // Rojo tomate
            colores.put("reintentos", "#FF69B4");    // Rosa fuerte
            respuesta.put("colores", colores);

            return ResponseEntity.ok(respuesta);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
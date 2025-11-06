package rutaslogisticas.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rutaslogisticas.Repository.*;
import rutaslogisticas.entity.*;
import rutaslogisticas.View.PedidoView;
import rutaslogisticas.Request.CreatePedidoRequest;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.HashMap;
import java.util.Map;

@Service
@Transactional
public class PedidoService {

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DireccionRepository direccionRepository;

    @Autowired
    private NotificacionService notificacionService;

    public List<PedidoView> obtenerTodosPedidos() {
        return pedidoRepository.findAllWithDetails()
                .stream()
                .map(PedidoView::new)
                .collect(Collectors.toList());
    }

    public Optional<PedidoView> obtenerPedidoPorId(Long id) {
        return pedidoRepository.findById(id)
                .map(PedidoView::new);
    }

    public PedidoView crearPedido(CreatePedidoRequest request) {
        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Direccion direccion = direccionRepository.findById(request.getDireccionId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

        Pedido pedido = new Pedido(cliente, direccion, request.getFechaProgramada());
        pedido.setVentanaInicio(request.getVentanaInicio());
        pedido.setVentanaFin(request.getVentanaFin());
        pedido.setVolumen(request.getVolumen());
        pedido.setPeso(request.getPeso());

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 🔔 NOTIFICACIÓN: Nuevo pedido creado
        notificacionService.enviarNotificacion(
                "Nuevo pedido creado #" + pedidoGuardado.getId(),
                "Se ha creado un nuevo pedido para " + cliente.getNombre(),
                "NUEVO_PEDIDO"
        );

        return new PedidoView(pedidoGuardado);
    }

    public PedidoView actualizarEstadoPedido(Long id, Pedido.EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Pedido.EstadoPedido estadoAnterior = pedido.getEstado();
        pedido.setEstado(nuevoEstado);
        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        // 🔔 NOTIFICACIÓN: Cambio de estado
        notificacionService.enviarNotificacionCambioEstado(
                pedidoActualizado,
                estadoAnterior,
                nuevoEstado
        );

        return new PedidoView(pedidoActualizado);
    }

    public List<PedidoView> obtenerPedidosPorEstado(Pedido.EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado)
                .stream()
                .map(PedidoView::new)
                .collect(Collectors.toList());
    }

    public void eliminarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        pedidoRepository.delete(pedido);

        // 🔔 NOTIFICACIÓN: Pedido eliminado
        notificacionService.enviarNotificacion(
            "Pedido eliminado #" + id,
            "El pedido ha sido eliminado del sistema",
            "PEDIDO_ELIMINADO"
        );
    }

    // 📊 MÉTODOS PARA DASHBOARD
    public long contarPedidosPorEstado(Pedido.EstadoPedido estado) {
        return pedidoRepository.findByEstado(estado).size();
    }

    public Map<String, Long> obtenerResumenEstados() {
        Map<String, Long> resumen = new HashMap<>();
        resumen.put("pendientes", contarPedidosPorEstado(Pedido.EstadoPedido.PENDIENTE));
        resumen.put("asignados", contarPedidosPorEstado(Pedido.EstadoPedido.ASIGNADO));
        resumen.put("enRuta", contarPedidosPorEstado(Pedido.EstadoPedido.EN_RUTA));
        resumen.put("entregados", contarPedidosPorEstado(Pedido.EstadoPedido.ENTREGADO));
        resumen.put("fallidos", contarPedidosPorEstado(Pedido.EstadoPedido.FALLIDO));
        resumen.put("reintentos", contarPedidosPorEstado(Pedido.EstadoPedido.REINTENTO));
        return resumen;
    }
}

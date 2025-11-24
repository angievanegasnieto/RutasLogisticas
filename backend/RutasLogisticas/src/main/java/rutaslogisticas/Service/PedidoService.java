package rutaslogisticas.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rutaslogisticas.repository.PedidoRepository;
import rutaslogisticas.repository.ClienteRepository;
import rutaslogisticas.repository.DireccionRepository;
import rutaslogisticas.repository.ConductorRepository;
import rutaslogisticas.entity.Pedido;
import rutaslogisticas.entity.Cliente;
import rutaslogisticas.entity.Direccion;
import rutaslogisticas.entity.Conductor;
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
    private ConductorRepository conductorRepository;

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
        pedido.setProducto(request.getProducto());
        pedido.setCantidad(request.getCantidad());
        pedido.setLatitud(request.getLatitud());
        pedido.setLongitud(request.getLongitud());
        // Asignar conductor si viene en el request
        if (request.getConductorId() != null) {
            Conductor conductor = conductorRepository.findById(request.getConductorId())
                    .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));
            pedido.setConductor(conductor);
            // Si se asigna, asegurar estado ASIGNADO
            if (pedido.getEstado() == Pedido.EstadoPedido.PENDIENTE) {
                pedido.setEstado(Pedido.EstadoPedido.ASIGNADO);
            }
        }

        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // 🔔 NOTIFICACIÓN: Nuevo pedido creado
        notificacionService.enviarNotificacion(
                "Nuevo pedido creado #" + pedidoGuardado.getId(),
                "Se ha creado un nuevo pedido para " + cliente.getNombre(),
                "NUEVO_PEDIDO"
        );

        return new PedidoView(pedidoGuardado);
    }

    public PedidoView actualizarPedido(Long id, CreatePedidoRequest request) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        Cliente cliente = clienteRepository.findById(request.getClienteId())
                .orElseThrow(() -> new RuntimeException("Cliente no encontrado"));

        Direccion direccion = direccionRepository.findById(request.getDireccionId())
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

        // Actualizar todos los campos
        pedido.setCliente(cliente);
        pedido.setDireccion(direccion);
        pedido.setFechaProgramada(request.getFechaProgramada());
        pedido.setVentanaInicio(request.getVentanaInicio());
        pedido.setVentanaFin(request.getVentanaFin());
        pedido.setVolumen(request.getVolumen());
        pedido.setPeso(request.getPeso());
        pedido.setProducto(request.getProducto());
        pedido.setCantidad(request.getCantidad());
        pedido.setLatitud(request.getLatitud());
        pedido.setLongitud(request.getLongitud());
        
        // Actualizar estado si viene en el request
        if (request.getEstado() != null) {
            pedido.setEstado(request.getEstado());
        }

        // Asignar conductor si viene en el request
        if (request.getConductorId() != null) {
            Conductor conductor = conductorRepository.findById(request.getConductorId())
                    .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));
            pedido.setConductor(conductor);
            if (pedido.getEstado() == Pedido.EstadoPedido.PENDIENTE) {
                pedido.setEstado(Pedido.EstadoPedido.ASIGNADO);
            }
        }

        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        // 🔔 NOTIFICACIÓN: Pedido actualizado
        notificacionService.enviarNotificacion(
                "Pedido actualizado #" + id,
                "El pedido ha sido actualizado",
                "PEDIDO_ACTUALIZADO"
        );

        return new PedidoView(pedidoActualizado);
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

    // 🔄 ACTUALIZAR PEDIDO PARCIALMENTE (para reintentos)
    public PedidoView actualizarPedidoParcial(Long id, Map<String, Object> cambios) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Actualizar solo los campos que vienen en el mapa
        if (cambios.containsKey("fechaProgramada")) {
            String fechaStr = (String) cambios.get("fechaProgramada");
            pedido.setFechaProgramada(java.time.LocalDate.parse(fechaStr));
        }
        
        if (cambios.containsKey("ventanaInicio")) {
            String horaStr = (String) cambios.get("ventanaInicio");
            pedido.setVentanaInicio(java.time.LocalTime.parse(horaStr));
        }
        
        if (cambios.containsKey("ventanaFin")) {
            String horaStr = (String) cambios.get("ventanaFin");
            pedido.setVentanaFin(java.time.LocalTime.parse(horaStr));
        }
        
        if (cambios.containsKey("estado")) {
            String estadoStr = (String) cambios.get("estado");
            Pedido.EstadoPedido nuevoEstado = Pedido.EstadoPedido.valueOf(estadoStr.toUpperCase());
            pedido.setEstado(nuevoEstado);
        }

        Pedido pedidoActualizado = pedidoRepository.save(pedido);

        // 🔔 NOTIFICACIÓN: Pedido reprogramado
        if (cambios.containsKey("fechaProgramada")) {
            notificacionService.enviarNotificacion(
                "Pedido reprogramado #" + id,
                "El pedido ha sido reprogramado para " + cambios.get("fechaProgramada"),
                "PEDIDO_REPROGRAMADO"
            );
        }

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
    
    // 🚗 ASIGNAR CONDUCTOR A PEDIDO
    public PedidoView asignarConductor(Long pedidoId, Long conductorId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
                
        Conductor conductor = conductorRepository.findById(conductorId)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));
        
        pedido.setConductor(conductor);
        
        // Si el pedido está PENDIENTE, cambiar a ASIGNADO
        if (pedido.getEstado() == Pedido.EstadoPedido.PENDIENTE) {
            pedido.setEstado(Pedido.EstadoPedido.ASIGNADO);
        }
        
        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        
        // 🔔 NOTIFICACIÓN: Conductor asignado
        notificacionService.enviarNotificacion(
            "Conductor asignado al pedido #" + pedidoId,
            "El conductor " + conductor.getNombreCompleto() + " ha sido asignado al pedido",
            "CONDUCTOR_ASIGNADO"
        );
        
        return new PedidoView(pedidoActualizado);
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
        return resumen;
    }
}

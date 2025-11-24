package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.entity.EventoEntrega;
import rutaslogisticas.repository.EventoEntregaRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/eventos-entrega")
@CrossOrigin(origins = "http://localhost:4200")
public class EventosEntregaController {

    @Autowired
    private EventoEntregaRepository eventoRepository;

    /**
     * Registrar un nuevo evento de entrega
     */
    @PostMapping
    public ResponseEntity<EventoEntrega> registrarEvento(@RequestBody EventoRequest request) {
        try {
            EventoEntrega evento = new EventoEntrega();
            evento.setPedidoId(request.pedidoId);
            evento.setConductorId(request.conductorId);
            evento.setTipoEvento(EventoEntrega.TipoEvento.valueOf(request.tipoEvento));
            evento.setEstadoAnterior(request.estadoAnterior);
            evento.setEstadoNuevo(request.estadoNuevo);
            evento.setNotas(request.notas);
            
            EventoEntrega guardado = eventoRepository.save(evento);
            return ResponseEntity.ok(guardado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Obtener historial de eventos de un pedido
     */
    @GetMapping("/pedido/{pedidoId}")
    public ResponseEntity<List<EventoEntrega>> obtenerEventosPorPedido(@PathVariable Long pedidoId) {
        List<EventoEntrega> eventos = eventoRepository.findByPedidoIdOrderByFechaEventoDesc(pedidoId);
        return ResponseEntity.ok(eventos);
    }

    /**
     * Obtener todos los eventos
     */
    @GetMapping
    public ResponseEntity<List<EventoEntrega>> obtenerTodos() {
        List<EventoEntrega> eventos = eventoRepository.findAll();
        return ResponseEntity.ok(eventos);
    }

    // DTO para el request
    public static class EventoRequest {
        public Long pedidoId;
        public Long conductorId;
        public String tipoEvento;
        public String estadoAnterior;
        public String estadoNuevo;
        public String notas;
    }
}

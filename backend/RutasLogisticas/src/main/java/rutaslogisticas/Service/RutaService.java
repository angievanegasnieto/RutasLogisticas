package rutaslogisticas.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rutaslogisticas.entity.*;
import rutaslogisticas.repository.*;
import rutaslogisticas.View.RutaView;
import rutaslogisticas.View.ParadaRutaView;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class RutaService {

    @Autowired
    private RutaRepository rutaRepository;
    
    @Autowired
    private ParadaRutaRepository paradaRutaRepository;
    
    @Autowired
    private PedidoRepository pedidoRepository;
    
    @Autowired
    private EventoEntregaRepository eventoEntregaRepository;

    /**
     * Obtener todas las rutas con detalles
     */
    public List<RutaView> obtenerTodasLasRutas() {
        return rutaRepository.findAll().stream()
            .map(RutaView::new)
            .collect(Collectors.toList());
    }

    /**
     * Obtener ruta por ID con detalles
     */
    public Optional<RutaView> obtenerRutaPorId(Long id) {
        Ruta ruta = rutaRepository.findByIdWithDetails(id);
        return Optional.ofNullable(ruta).map(RutaView::new);
    }

    /**
     * Obtener rutas asignadas a un conductor
     */
    public List<RutaView> obtenerRutasPorConductor(Long conductorId) {
        return rutaRepository.findByConductorId(conductorId).stream()
            .map(RutaView::new)
            .collect(Collectors.toList());
    }

    /**
     * Obtener paradas de una ruta
     */
    public List<ParadaRutaView> obtenerParadasDeRuta(Long rutaId) {
        return paradaRutaRepository.findByRutaIdWithPedidoDetails(rutaId).stream()
            .map(ParadaRutaView::new)
            .collect(Collectors.toList());
    }

    /**
     * INICIAR RUTA - Cambia el estado de la ruta a EN_PROGRESO
     */
    @Transactional
    public RutaView iniciarRuta(Long rutaId) {
        Ruta ruta = rutaRepository.findById(rutaId)
            .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));
        
        // Verificar que la ruta esté asignada
        if (ruta.getEstado() != Ruta.EstadoRuta.ASIGNADA && 
            ruta.getEstado() != Ruta.EstadoRuta.PAUSADA) {
            throw new RuntimeException("La ruta debe estar ASIGNADA o PAUSADA para iniciarla");
        }
        
        // Cambiar estado de la ruta
        ruta.setEstado(Ruta.EstadoRuta.EN_PROGRESO);
        rutaRepository.save(ruta);
        
        // Registrar evento de inicio de ruta en la primera parada
        List<ParadaRuta> paradas = paradaRutaRepository.findByRutaIdOrderBySecuenciaAsc(rutaId);
        if (!paradas.isEmpty()) {
            ParadaRuta primeraParada = paradas.get(0);
            EventoEntrega evento = new EventoEntrega(
                primeraParada, 
                EventoEntrega.TipoEvento.INICIO_RUTA, 
                "Ruta iniciada"
            );
            eventoEntregaRepository.save(evento);
        }
        
        return new RutaView(ruta);
    }

    /**
     * FINALIZAR RUTA - Cambia el estado de la ruta a COMPLETADA
     */
    @Transactional
    public RutaView finalizarRuta(Long rutaId) {
        Ruta ruta = rutaRepository.findById(rutaId)
            .orElseThrow(() -> new RuntimeException("Ruta no encontrada"));
        
        // Cambiar estado de la ruta
        ruta.setEstado(Ruta.EstadoRuta.COMPLETADA);
        rutaRepository.save(ruta);
        
        // Registrar evento
        List<ParadaRuta> paradas = paradaRutaRepository.findByRutaIdOrderBySecuenciaAsc(rutaId);
        if (!paradas.isEmpty()) {
            ParadaRuta ultimaParada = paradas.get(paradas.size() - 1);
            EventoEntrega evento = new EventoEntrega(
                ultimaParada, 
                EventoEntrega.TipoEvento.FIN_RUTA, 
                "Ruta finalizada"
            );
            eventoEntregaRepository.save(evento);
        }
        
        return new RutaView(ruta);
    }

    /**
     * ACTUALIZAR ESTADO DE PARADA (Estado del pedido individual)
     * Estados: PENDIENTE, ENTREGADO, FALLIDO, REINTENTO
     */
    @Transactional
    public ParadaRutaView actualizarEstadoParada(Long paradaId, ParadaRuta.EstadoParada nuevoEstado, String nota) {
        ParadaRuta parada = paradaRutaRepository.findById(paradaId)
            .orElseThrow(() -> new RuntimeException("Parada no encontrada"));
        
        // Actualizar estado de la parada
        parada.setEstado(nuevoEstado);
        if (nota != null && !nota.isEmpty()) {
            parada.setNota(nota);
        }
        
        // Registrar tiempo de llegada si es la primera vez
        if (parada.getAta() == null) {
            parada.setAta(LocalDateTime.now());
        }
        
        paradaRutaRepository.save(parada);
        
        // Actualizar también el estado del pedido
        Pedido pedido = parada.getPedido();
        switch (nuevoEstado) {
            case ENTREGADO:
                pedido.setEstado(Pedido.EstadoPedido.ENTREGADO);
                break;
            case FALLIDO:
                pedido.setEstado(Pedido.EstadoPedido.FALLIDO);
                break;
            default:
                break;
        }
        pedidoRepository.save(pedido);
        
        // Registrar evento
        EventoEntrega.TipoEvento tipoEvento = EventoEntrega.TipoEvento.ENTREGADO;
        switch (nuevoEstado) {
            case ENTREGADO:
                tipoEvento = EventoEntrega.TipoEvento.ENTREGADO;
                break;
            case FALLIDO:
                tipoEvento = EventoEntrega.TipoEvento.FALLIDO;
                break;
            default:
                break;
        }
        
        EventoEntrega evento = new EventoEntrega(
            parada, 
            tipoEvento, 
            nota != null ? nota : "Estado cambiado a " + nuevoEstado
        );
        eventoEntregaRepository.save(evento);
        
        return new ParadaRutaView(parada);
    }
}

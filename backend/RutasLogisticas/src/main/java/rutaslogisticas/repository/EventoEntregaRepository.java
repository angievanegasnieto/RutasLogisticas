package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.EventoEntrega;
import java.util.List;

@Repository
public interface EventoEntregaRepository extends JpaRepository<EventoEntrega, Long> {
    // Métodos para paradas_ruta (original)
    List<EventoEntrega> findByParadaRutaIdOrderByFechaEventoDesc(Long paradaRutaId);
    
    // Métodos para pedidos directos (nuevos)
    List<EventoEntrega> findByPedidoIdOrderByFechaEventoDesc(Long pedidoId);
    Long countByPedidoIdAndTipoEvento(Long pedidoId, EventoEntrega.TipoEvento tipoEvento);
    
    // Filtros por tipo de evento
    List<EventoEntrega> findByTipoEvento(EventoEntrega.TipoEvento tipoEvento);
    
    // Obtener eventos por conductor
    List<EventoEntrega> findByConductorIdOrderByFechaEventoDesc(Long conductorId);
}


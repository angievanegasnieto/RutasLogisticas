package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.ParadaRuta;
import java.util.List;

@Repository
public interface ParadaRutaRepository extends JpaRepository<ParadaRuta, Long> {
    List<ParadaRuta> findByRutaIdOrderBySecuenciaAsc(Long rutaId);
    List<ParadaRuta> findByPedidoId(Long pedidoId);
    List<ParadaRuta> findByEstado(ParadaRuta.EstadoParada estado);
    
    @Query("SELECT pr FROM ParadaRuta pr LEFT JOIN FETCH pr.pedido p " +
           "LEFT JOIN FETCH p.cliente LEFT JOIN FETCH p.direccion " +
           "WHERE pr.ruta.id = ?1 ORDER BY pr.secuencia ASC")
    List<ParadaRuta> findByRutaIdWithPedidoDetails(Long rutaId);
}

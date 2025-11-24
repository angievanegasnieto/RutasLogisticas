package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.Pedido;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByEstado(Pedido.EstadoPedido estado);
    List<Pedido> findByFechaProgramada(LocalDate fecha);
    List<Pedido> findByClienteId(Long clienteId);

    @Query("SELECT p FROM Pedido p WHERE p.fechaProgramada BETWEEN ?1 AND ?2")
    List<Pedido> findByFechaProgramadaBetween(LocalDate fechaInicio, LocalDate fechaFin);

    @Query("SELECT p FROM Pedido p WHERE p.estado = 'PENDIENTE' AND p.fechaProgramada = ?1")
    List<Pedido> findPedidosPendientesPorFecha(LocalDate fecha);

    @Query("SELECT p FROM Pedido p LEFT JOIN FETCH p.cliente LEFT JOIN FETCH p.direccion")
    List<Pedido> findAllWithDetails();
}

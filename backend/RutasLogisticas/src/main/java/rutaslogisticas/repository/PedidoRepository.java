package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rutaslogisticas.model.Pedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
}

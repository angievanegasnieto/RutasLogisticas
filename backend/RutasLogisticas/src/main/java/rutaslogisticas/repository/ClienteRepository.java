package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.Cliente;
import java.util.List;
import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<Cliente, Long> {
    Optional<Cliente> findByNit(String nit);
    List<Cliente> findByNombreContainingIgnoreCase(String nombre);
    boolean existsByNit(String nit);

    @Query("SELECT c FROM Cliente c LEFT JOIN FETCH c.direcciones")
    List<Cliente> findAllWithDirecciones();
}

package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.Conductor;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConductorRepository extends JpaRepository<Conductor, Long> {
    List<Conductor> findByEstado(Conductor.EstadoConductor estado);
    Optional<Conductor> findByLicencia(String licencia);
    Optional<Conductor> findByUserId(Long userId);
    Optional<Conductor> findByTelefono(String telefono);
}

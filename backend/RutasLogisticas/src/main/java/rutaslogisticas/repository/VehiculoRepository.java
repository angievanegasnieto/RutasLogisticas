package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.Vehiculo;
import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculoRepository extends JpaRepository<Vehiculo, Long> {
    List<Vehiculo> findByEstado(Vehiculo.EstadoVehiculo estado);
    Optional<Vehiculo> findByPlaca(String placa);
}

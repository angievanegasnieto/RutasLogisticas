package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rutaslogisticas.entity.Vehicle;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    boolean existsByPlate(String plate);
}

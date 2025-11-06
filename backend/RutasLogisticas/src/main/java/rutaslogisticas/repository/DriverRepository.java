package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rutaslogisticas.entity.Driver;
import java.util.Optional;

public interface DriverRepository extends JpaRepository<Driver, Long> {
    Optional<Driver> findByEmail(String email);
}


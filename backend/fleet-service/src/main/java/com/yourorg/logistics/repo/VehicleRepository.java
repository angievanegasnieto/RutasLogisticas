package com.yourorg.logistics.repo;
import com.yourorg.logistics.domain.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page; import org.springframework.data.domain.Pageable;
import java.util.Optional;
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
  boolean existsByPlate(String plate);
  Optional<Vehicle> findByPlate(String plate);
  Page<Vehicle> findByStatusIgnoreCase(String status, Pageable pageable);
  Page<Vehicle> findByAssignedDriver_Id(Long driverId, Pageable pageable);
}

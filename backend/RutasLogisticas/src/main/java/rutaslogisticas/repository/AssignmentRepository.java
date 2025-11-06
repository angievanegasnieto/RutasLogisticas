package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rutaslogisticas.entity.Assignment;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByEndedAtIsNull();
    Optional<Assignment> findFirstByDriver_IdAndEndedAtIsNullOrderByAssignedAtDesc(Long driverId);
    boolean existsByDriver_IdAndEndedAtIsNull(Long driverId);
    boolean existsByVehicle_IdAndEndedAtIsNull(Long vehicleId);
    boolean existsByDriver_Id(Long driverId);
    boolean existsByVehicle_Id(Long vehicleId);

    List<Assignment> findAllByDriver_IdAndEndedAtIsNull(Long driverId);
    List<Assignment> findAllByVehicle_IdAndEndedAtIsNull(Long vehicleId);

    List<Assignment> findByActiveFalseAndPlannedStartIsNotNullAndEndedAtIsNullAndPlannedStartLessThanEqual(LocalDateTime now);
}

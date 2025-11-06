package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import rutaslogisticas.entity.ChangeRequest;
import java.util.List;

public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {
    List<ChangeRequest> findByStatus(String status);
}


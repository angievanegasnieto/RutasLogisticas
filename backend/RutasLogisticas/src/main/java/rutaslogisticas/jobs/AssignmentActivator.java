package rutaslogisticas.jobs;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import rutaslogisticas.entity.Assignment;
import rutaslogisticas.repository.AssignmentRepository;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AssignmentActivator {
    private static final Logger log = LoggerFactory.getLogger(AssignmentActivator.class);
    private final AssignmentRepository repo;

    public AssignmentActivator(AssignmentRepository repo) {
        this.repo = repo;
    }

    // Corre cada minuto y activa asignaciones programadas cuyo inicio ya pasó
    @Scheduled(fixedDelay = 60_000)
    public void activateScheduled() {
        LocalDateTime now = LocalDateTime.now();
        List<Assignment> pending = repo.findByActiveFalseAndPlannedStartIsNotNullAndEndedAtIsNullAndPlannedStartLessThanEqual(now);
        for (Assignment a : pending) {
            a.setActive(true);
            // Mantener status; aceptación la hace el conductor
            repo.save(a);
            log.info("Assignment {} activated (plannedStart {} <= now)", a.getId(), a.getPlannedStart());
        }
    }
}


package rutaslogisticas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.entity.Assignment;
import rutaslogisticas.entity.Driver;
import rutaslogisticas.entity.Vehicle;
import rutaslogisticas.repository.AssignmentRepository;
import rutaslogisticas.repository.DriverRepository;
import rutaslogisticas.repository.VehicleRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/assignments")
@CrossOrigin(origins = "*")
public class AssignmentsController {
    private final AssignmentRepository assignmentRepo;
    private final DriverRepository driverRepo;
    private final VehicleRepository vehicleRepo;

    public AssignmentsController(AssignmentRepository assignmentRepo,
                                 DriverRepository driverRepo,
                                 VehicleRepository vehicleRepo) {
        this.assignmentRepo = assignmentRepo;
        this.driverRepo = driverRepo;
        this.vehicleRepo = vehicleRepo;
    }

    @GetMapping
    public List<Assignment> list(){ return assignmentRepo.findAll(); }

    @GetMapping("/active")
    public ResponseEntity<Assignment> activeByDriver(@RequestParam(required = false) String email,
                                                     @RequestParam(required = false) Long driverId) {
        Long id = driverId;
        if (id == null && email != null) {
            Optional<Driver> d = driverRepo.findByEmail(email);
            if (d.isEmpty()) return ResponseEntity.notFound().build();
            id = d.get().getId();
        }
        if (id == null) return ResponseEntity.ok().body(null);
        return assignmentRepo.findFirstByDriver_IdAndEndedAtIsNullOrderByAssignedAtDesc(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.ok().body(null));
    }

    @GetMapping("/scheduled")
    public ResponseEntity<List<Assignment>> scheduledByDriver(@RequestParam(required = false) String email,
                                                              @RequestParam(required = false) Long driverId) {
        Long id = driverId;
        if (id == null && email != null) {
            Optional<Driver> d = driverRepo.findByEmail(email);
            if (d.isEmpty()) return ResponseEntity.ok(List.of());
            id = d.get().getId();
        }
        if (id == null) return ResponseEntity.ok(List.of());
        List<Assignment> list = assignmentRepo.findAllByDriver_IdAndEndedAtIsNull(id).stream()
                .filter(a -> !a.isActive() && a.getPlannedStart()!=null)
                .sorted((a,b) -> a.getPlannedStart().compareTo(b.getPlannedStart()))
                .toList();
        return ResponseEntity.ok(list);
    }

    public record CreateAssignmentRequest(Long driverId, Long vehicleId, LocalDateTime plannedStart, LocalDateTime plannedEnd) {}

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateAssignmentRequest req){
        if (req == null || req.driverId() == null || req.vehicleId() == null)
            return ResponseEntity.badRequest().body(Map.of("error", "driverId y vehicleId son requeridos"));

        if (assignmentRepo.existsByDriver_IdAndEndedAtIsNull(req.driverId()))
            return ResponseEntity.badRequest().body(Map.of("error", "El conductor ya tiene una asignación activa"));
        if (assignmentRepo.existsByVehicle_IdAndEndedAtIsNull(req.vehicleId()))
            return ResponseEntity.badRequest().body(Map.of("error", "El vehículo ya está asignado"));

        Driver d = driverRepo.findById(req.driverId()).orElse(null);
        Vehicle v = vehicleRepo.findById(req.vehicleId()).orElse(null);
        if (d == null || v == null)
            return ResponseEntity.badRequest().body(Map.of("error", "Conductor o vehículo no existe"));

        Assignment a = new Assignment();
        a.setDriver(d);
        a.setVehicle(v);
        LocalDateTime now = LocalDateTime.now();
        a.setAssignedAt(now);
        a.setPlannedStart(req.plannedStart());
        a.setPlannedEnd(req.plannedEnd());
        a.setStatus(Assignment.Status.PENDING);
        boolean future = (req.plannedStart()!=null && req.plannedStart().isAfter(now));
        a.setActive(!future);

        // Overlap validation
        LocalDateTime newStart = (req.plannedStart()!=null ? req.plannedStart() : now);
        LocalDateTime newEnd = (req.plannedEnd()!=null ? req.plannedEnd() : LocalDateTime.of(9999,12,31,23,59));

        for (Assignment e : assignmentRepo.findAllByDriver_IdAndEndedAtIsNull(req.driverId())){
            LocalDateTime es = (e.getPlannedStart()!=null ? e.getPlannedStart() : e.getAssignedAt());
            LocalDateTime ee = (e.getPlannedStart()!=null ? (e.getPlannedEnd()!=null ? e.getPlannedEnd() : LocalDateTime.of(9999,12,31,23,59)) : (e.getEndedAt()!=null ? e.getEndedAt() : LocalDateTime.of(9999,12,31,23,59)));
            if (newStart.isBefore(ee) && es.isBefore(newEnd)){
                return ResponseEntity.badRequest().body(Map.of("error","El conductor ya tiene una asignacion en ese horario"));
            }
        }
        for (Assignment e : assignmentRepo.findAllByVehicle_IdAndEndedAtIsNull(req.vehicleId())){
            LocalDateTime es = (e.getPlannedStart()!=null ? e.getPlannedStart() : e.getAssignedAt());
            LocalDateTime ee = (e.getPlannedStart()!=null ? (e.getPlannedEnd()!=null ? e.getPlannedEnd() : LocalDateTime.of(9999,12,31,23,59)) : (e.getEndedAt()!=null ? e.getEndedAt() : LocalDateTime.of(9999,12,31,23,59)));
            if (newStart.isBefore(ee) && es.isBefore(newEnd)){
                return ResponseEntity.badRequest().body(Map.of("error","El vehiculo ya esta asignado en ese horario"));
            }
        }
        assignmentRepo.save(a);
        return ResponseEntity.ok(a);
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<?> end(@PathVariable Long id){
        Optional<Assignment> oa = assignmentRepo.findById(id);
        if (oa.isEmpty()) return ResponseEntity.notFound().build();
        Assignment a = oa.get();
        if (a.getEndedAt() != null) return ResponseEntity.badRequest().body(Map.of("error", "La asignación ya está finalizada"));
        a.setEndedAt(LocalDateTime.now());
        a.setActive(false);
        assignmentRepo.save(a);
        return ResponseEntity.ok(a);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        if (!assignmentRepo.existsById(id)) return ResponseEntity.notFound().build();
        assignmentRepo.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    public record Message(String reason) {}

    @PostMapping("/{id}/accept")
    public ResponseEntity<?> accept(@PathVariable Long id){
        Optional<Assignment> oa = assignmentRepo.findById(id);
        if (oa.isEmpty()) return ResponseEntity.notFound().build();
        Assignment a = oa.get();
        if (a.getEndedAt()!=null) return ResponseEntity.badRequest().body(Map.of("error","La asignacidn ya finaliz"));
        a.setStatus(Assignment.Status.ACCEPTED);
        a.setAcceptedAt(LocalDateTime.now());
        a.setActive(true);
        assignmentRepo.save(a);
        return ResponseEntity.ok(a);
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id, @RequestBody(required = false) Message body){
        Optional<Assignment> oa = assignmentRepo.findById(id);
        if (oa.isEmpty()) return ResponseEntity.notFound().build();
        Assignment a = oa.get();
        if (a.getEndedAt()!=null) return ResponseEntity.badRequest().body(Map.of("error","La asignacin ya finaliz"));
        a.setStatus(Assignment.Status.REJECTED);
        a.setRejectedAt(LocalDateTime.now());
        a.setRejectReason(body!=null? body.reason(): null);
        a.setEndedAt(LocalDateTime.now());
        a.setActive(false);
        assignmentRepo.save(a);
        return ResponseEntity.ok(a);
    }
}

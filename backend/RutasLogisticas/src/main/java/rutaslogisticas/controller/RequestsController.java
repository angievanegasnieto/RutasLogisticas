package rutaslogisticas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.entity.ChangeRequest;
import rutaslogisticas.entity.Driver;
import rutaslogisticas.repository.ChangeRequestRepository;
import rutaslogisticas.repository.DriverRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/requests")
@CrossOrigin(origins = "*")
public class RequestsController {
    private final ChangeRequestRepository repo;
    private final DriverRepository drivers;
    public RequestsController(ChangeRequestRepository repo, DriverRepository drivers){ this.repo = repo; this.drivers = drivers; }

    public record CreateReq(Long driverId, String email, String message) {}

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateReq req){
        if (req == null || (req.driverId()==null && (req.email()==null || req.email().isBlank())))
            return ResponseEntity.badRequest().body(Map.of("error","driverId o email requerido"));
        Driver d = null;
        if (req.driverId()!=null) d = drivers.findById(req.driverId()).orElse(null);
        else d = drivers.findByEmail(req.email()).orElse(null);
        if (d==null) return ResponseEntity.badRequest().body(Map.of("error","Conductor no encontrado"));
        ChangeRequest r = new ChangeRequest();
        r.setDriver(d);
        r.setMessage(req.message()!=null?req.message().trim():"Solicitud de cambio");
        r.setStatus("PENDING");
        return ResponseEntity.ok(repo.save(r));
    }

    @GetMapping
    public List<ChangeRequest> list(@RequestParam(required=false) String status){
        if (status==null || status.isBlank()) return repo.findAll();
        return repo.findByStatus(status.toUpperCase());
    }

    public record Decision(String comment) {}
    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id, @RequestBody(required=false) Decision body){
        var r = repo.findById(id).orElse(null);
        if (r==null) return ResponseEntity.notFound().build();
        r.setStatus("APPROVED");
        r.setDecidedAt(LocalDateTime.now());
        if (body!=null) r.setAdminComment(body.comment());
        return ResponseEntity.ok(repo.save(r));
    }
    @PostMapping("/{id}/deny")
    public ResponseEntity<?> deny(@PathVariable Long id, @RequestBody(required=false) Decision body){
        var r = repo.findById(id).orElse(null);
        if (r==null) return ResponseEntity.notFound().build();
        r.setStatus("DENIED");
        r.setDecidedAt(LocalDateTime.now());
        if (body!=null) r.setAdminComment(body.comment());
        return ResponseEntity.ok(repo.save(r));
    }
}


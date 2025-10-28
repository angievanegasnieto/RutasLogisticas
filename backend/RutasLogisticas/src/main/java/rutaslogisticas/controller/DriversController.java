package rutaslogisticas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.entity.Driver;
import rutaslogisticas.repository.DriverRepository;
import rutaslogisticas.repository.AssignmentRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/drivers")
@CrossOrigin(origins = "*")
public class DriversController {
    private final DriverRepository repo;
    private final AssignmentRepository assignments;
    public DriversController(DriverRepository repo, AssignmentRepository assignments){ this.repo = repo; this.assignments = assignments; }

    @GetMapping
    public List<Driver> list(){ return repo.findAll(); }

    public record CreateDriverRequest(String name, String email, String phone, String licenseNumber) {}

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateDriverRequest req){
        if (req == null || req.name() == null || req.name().isBlank()){
            return ResponseEntity.badRequest().body(Map.of("error","El nombre es obligatorio"));
        }
        // Nombre: solo letras y espacios
        String name = req.name().trim();
        if (!name.matches("^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$")){
            return ResponseEntity.badRequest().body(Map.of("error","El nombre solo acepta letras y espacios"));
        }
        if (req.email() != null && !req.email().isBlank()){
            String email = req.email().trim();
            // Validación sencilla de email (no estricta pero suficiente)
            if (!email.matches("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$")){
                return ResponseEntity.badRequest().body(Map.of("error","Email inválido"));
            }
            if (repo.findByEmail(email).isPresent()){
                return ResponseEntity.badRequest().body(Map.of("error","El email ya existe"));
            }
        }
        if (req.phone() != null && !req.phone().isBlank()){
            String phone = req.phone().trim();
            if (!phone.matches("^\\d{10}$")){
                return ResponseEntity.badRequest().body(Map.of("error","El teléfono debe tener 10 dígitos"));
            }
        }
        Driver d = new Driver();
        d.setName(name);
        d.setEmail(req.email() != null && !req.email().isBlank() ? req.email().trim() : null);
        d.setPhone(req.phone() != null && !req.phone().isBlank() ? req.phone().trim() : null);
        // Algunas bases existentes exigen license_number NOT NULL; si no viene, usar cadena vacía
        // Si no viene, generamos uno único para evitar violaciones de índice único (p. ej., LIC-<millis>)
        String lic = (req.licenseNumber() != null && !req.licenseNumber().isBlank())
            ? req.licenseNumber().trim()
            : ("LIC-" + System.currentTimeMillis());
        d.setLicenseNumber(lic);
        return ResponseEntity.ok(repo.save(d));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        if (assignments.existsByDriver_IdAndEndedAtIsNull(id)){
            return ResponseEntity.badRequest().body(Map.of("error","No se puede eliminar: existe una asignación activa para este conductor"));
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

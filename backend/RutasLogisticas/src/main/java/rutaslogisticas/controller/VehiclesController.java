package rutaslogisticas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.entity.Vehicle;
import rutaslogisticas.repository.VehicleRepository;
import rutaslogisticas.repository.AssignmentRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehicles")
@CrossOrigin(origins = "*")
public class VehiclesController {
    private final VehicleRepository repo;
    private final AssignmentRepository assignments;
    public VehiclesController(VehicleRepository repo, AssignmentRepository assignments){ this.repo = repo; this.assignments = assignments; }

    @GetMapping
    public List<Vehicle> list(){ return repo.findAll(); }

    public record CreateVehicleRequest(String plate, String model, String type) {}

    @PostMapping
    public ResponseEntity<?> create(@RequestBody CreateVehicleRequest req){
        if (req == null || req.plate() == null || req.plate().isBlank()){
            return ResponseEntity.badRequest().body(Map.of("error","La placa es obligatoria"));
        }
        String plate = req.plate().trim().toUpperCase();
        // Validación de formato: auto = ABC-123; moto = ABC-12A (guión opcional)
        String autoRegex = "^[A-Z]{3}-?\\d{3}$";
        String motoRegex = "^[A-Z]{3}-?\\d{2}[A-Z]$";
        boolean esAuto = plate.matches(autoRegex);
        boolean esMoto = plate.matches(motoRegex);
        if (!esAuto && !esMoto){
            return ResponseEntity.badRequest().body(
                Map.of("error", "Formato de placa inválido. Auto: ABC-123. Moto: ABC-12A"));
        }
        // Si se envía type, verificar coincidencia con detección
        if (req.type() != null && !req.type().isBlank()){
            String t = req.type().trim().toUpperCase();
            if (!t.equals("AUTO") && !t.equals("MOTO")){
                return ResponseEntity.badRequest().body(Map.of("error","Tipo inválido. Use AUTO o MOTO"));
            }
            if ((t.equals("AUTO") && !esAuto) || (t.equals("MOTO") && !esMoto)){
                return ResponseEntity.badRequest().body(Map.of("error","El tipo no coincide con el formato de la placa"));
            }
        }
        if (repo.existsByPlate(plate)){
            return ResponseEntity.badRequest().body(Map.of("error","La placa ya existe"));
        }
        Vehicle v = new Vehicle();
        v.setPlate(plate);
        v.setModel(req.model() != null && !req.model().isBlank() ? req.model().trim() : null);
        v.setType(req.type() != null && !req.type().isBlank() ? req.type().trim().toUpperCase() : (esMoto ? "MOTO" : "AUTO"));
        return ResponseEntity.ok(repo.save(v));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id){
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        if (assignments.existsByVehicle_IdAndEndedAtIsNull(id)){
            return ResponseEntity.badRequest().body(Map.of("error","No se puede eliminar: existe una asignación activa para este vehículo"));
        }
        repo.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.entity.Vehiculo;
import rutaslogisticas.repository.VehiculoRepository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/vehiculos")
@CrossOrigin(origins = "http://localhost:4200")
public class VehiculosController {

    @Autowired
    private VehiculoRepository vehiculoRepository;

    /**
     * Listar todos los vehículos
     */
    @GetMapping
    public ResponseEntity<List<Vehiculo>> listarTodos() {
        List<Vehiculo> vehiculos = vehiculoRepository.findAll();
        return ResponseEntity.ok(vehiculos);
    }

    /**
     * Obtener vehículo por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Vehiculo> obtenerPorId(@PathVariable Long id) {
        return vehiculoRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Listar vehículos activos
     */
    @GetMapping("/activos")
    public ResponseEntity<List<Vehiculo>> listarActivos() {
        List<Vehiculo> vehiculos = vehiculoRepository.findByEstado(Vehiculo.EstadoVehiculo.ACTIVO);
        return ResponseEntity.ok(vehiculos);
    }

    /**
     * Crear un nuevo vehículo
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CrearVehiculoRequest request) {
        try {
            // Validaciones
            if (request.placa() == null || request.placa().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La placa es obligatoria"));
            }

            // Verificar placa única
            if (vehiculoRepository.findByPlaca(request.placa()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La placa ya existe"));
            }

            Vehiculo vehiculo = new Vehiculo();
            vehiculo.setPlaca(request.placa().trim().toUpperCase());
            vehiculo.setModelo(request.modelo() != null ? request.modelo().trim() : null);
            vehiculo.setCapacidadVolumen(request.capacidadVolumen() != null ? request.capacidadVolumen() : BigDecimal.ZERO);
            vehiculo.setCapacidadPeso(request.capacidadPeso() != null ? request.capacidadPeso() : BigDecimal.ZERO);
            vehiculo.setNotas(request.notas() != null ? request.notas().trim() : null);
            vehiculo.setEstado(Vehiculo.EstadoVehiculo.ACTIVO);

            Vehiculo guardado = vehiculoRepository.save(vehiculo);
            return ResponseEntity.ok(guardado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al crear vehículo: " + e.getMessage()));
        }
    }

    /**
     * Actualizar vehículo
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody CrearVehiculoRequest request) {
        try {
            Vehiculo vehiculo = vehiculoRepository.findById(id)
                    .orElse(null);

            if (vehiculo == null) {
                return ResponseEntity.notFound().build();
            }

            // Validaciones
            if (request.placa() != null && !request.placa().isBlank()) {
                // Verificar que la placa no esté en uso por otro vehículo
                var existente = vehiculoRepository.findByPlaca(request.placa());
                if (existente.isPresent() && !existente.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "La placa ya existe"));
                }
                vehiculo.setPlaca(request.placa().trim().toUpperCase());
            }

            if (request.modelo() != null && !request.modelo().isBlank()) {
                vehiculo.setModelo(request.modelo().trim());
            }

            if (request.capacidadVolumen() != null) {
                vehiculo.setCapacidadVolumen(request.capacidadVolumen());
            }

            if (request.capacidadPeso() != null) {
                vehiculo.setCapacidadPeso(request.capacidadPeso());
            }

            if (request.notas() != null) {
                vehiculo.setNotas(request.notas().trim());
            }

            Vehiculo actualizado = vehiculoRepository.save(vehiculo);
            return ResponseEntity.ok(actualizado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al actualizar vehículo: " + e.getMessage()));
        }
    }

    /**
     * Cambiar estado del vehículo
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestParam String estado) {
        try {
            Vehiculo vehiculo = vehiculoRepository.findById(id)
                    .orElse(null);

            if (vehiculo == null) {
                return ResponseEntity.notFound().build();
            }

            Vehiculo.EstadoVehiculo nuevoEstado = Vehiculo.EstadoVehiculo.valueOf(estado.toUpperCase());
            vehiculo.setEstado(nuevoEstado);

            Vehiculo actualizado = vehiculoRepository.save(vehiculo);
            return ResponseEntity.ok(actualizado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Estado inválido"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al cambiar estado: " + e.getMessage()));
        }
    }

    /**
     * Eliminar vehículo
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            if (!vehiculoRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            vehiculoRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Vehículo eliminado exitosamente"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al eliminar vehículo: " + e.getMessage()));
        }
    }

    // Record para requests
    public record CrearVehiculoRequest(
            String placa,
            String modelo,
            BigDecimal capacidadVolumen,
            BigDecimal capacidadPeso,
            String notas
    ) {}
}

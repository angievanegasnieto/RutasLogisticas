package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.entity.Conductor;
import rutaslogisticas.repository.ConductorRepository;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/conductores")
@CrossOrigin(origins = "http://localhost:4200")
public class ConductoresController {

    @Autowired
    private ConductorRepository conductorRepository;
    
    @Autowired
    private rutaslogisticas.repository.AsignacionRutaRepository asignacionRutaRepository;
    
    @Autowired
    private rutaslogisticas.repository.AsignacionVehiculoRepository asignacionVehiculoRepository;

    /**
     * Listar todos los conductores
     */
    @GetMapping
    public ResponseEntity<List<Conductor>> listarTodos() {
        List<Conductor> conductores = conductorRepository.findAll();
        return ResponseEntity.ok(conductores);
    }

    /**
     * Obtener conductor por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Conductor> obtenerPorId(@PathVariable Long id) {
        return conductorRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Listar conductores activos
     */
    @GetMapping("/activos")
    public ResponseEntity<List<Conductor>> listarActivos() {
        List<Conductor> conductores = conductorRepository.findByEstado(Conductor.EstadoConductor.ACTIVO);
        return ResponseEntity.ok(conductores);
    }

    /**
     * Crear un nuevo conductor
     */
    @PostMapping
    public ResponseEntity<?> crear(@RequestBody CrearConductorRequest request) {
        try {
            // Validaciones
            if (request.nombreCompleto() == null || request.nombreCompleto().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre es obligatorio"));
            }
            if (request.licencia() == null || request.licencia().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La licencia es obligatoria"));
            }

            // Verificar licencia única
            if (conductorRepository.findByLicencia(request.licencia()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La licencia ya está registrada"));
            }

            // Verificar teléfono único si se proporciona
            if (request.telefono() != null && !request.telefono().isBlank()) {
                if (conductorRepository.findByTelefono(request.telefono()).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "El teléfono ya está registrado"));
                }
            }

            Conductor conductor = new Conductor();
            conductor.setNombreCompleto(request.nombreCompleto().trim());
            conductor.setLicencia(request.licencia().trim());
            conductor.setTelefono(request.telefono() != null ? request.telefono().trim() : null);
            conductor.setEstado(Conductor.EstadoConductor.ACTIVO);

            Conductor guardado = conductorRepository.save(conductor);
            return ResponseEntity.ok(guardado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al crear conductor: " + e.getMessage()));
        }
    }

    /**
     * Actualizar conductor
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody CrearConductorRequest request) {
        try {
            Conductor conductor = conductorRepository.findById(id)
                    .orElse(null);

            if (conductor == null) {
                return ResponseEntity.notFound().build();
            }

            // Validaciones
            if (request.nombreCompleto() != null && !request.nombreCompleto().isBlank()) {
                conductor.setNombreCompleto(request.nombreCompleto().trim());
            }

            if (request.licencia() != null && !request.licencia().isBlank()) {
                // Verificar que la licencia no esté en uso por otro conductor
                var existente = conductorRepository.findByLicencia(request.licencia());
                if (existente.isPresent() && !existente.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "La licencia ya está registrada"));
                }
                conductor.setLicencia(request.licencia().trim());
            }

            if (request.telefono() != null && !request.telefono().isBlank()) {
                // Verificar que el teléfono no esté en uso por otro conductor
                var existente = conductorRepository.findByTelefono(request.telefono());
                if (existente.isPresent() && !existente.get().getId().equals(id)) {
                    return ResponseEntity.badRequest().body(Map.of("error", "El teléfono ya está registrado"));
                }
                conductor.setTelefono(request.telefono().trim());
            }

            Conductor actualizado = conductorRepository.save(conductor);
            return ResponseEntity.ok(actualizado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al actualizar conductor: " + e.getMessage()));
        }
    }

    /**
     * Cambiar estado del conductor
     */
    @PatchMapping("/{id}/estado")
    public ResponseEntity<?> cambiarEstado(@PathVariable Long id, @RequestBody Map<String, String> request) {
        try {
            Conductor conductor = conductorRepository.findById(id)
                    .orElse(null);

            if (conductor == null) {
                return ResponseEntity.notFound().build();
            }

            String estadoStr = request.get("estado");
            if (estadoStr == null || estadoStr.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El estado es obligatorio"));
            }

            Conductor.EstadoConductor nuevoEstado = Conductor.EstadoConductor.valueOf(estadoStr.toUpperCase());
            conductor.setEstado(nuevoEstado);

            Conductor actualizado = conductorRepository.save(conductor);
            return ResponseEntity.ok(actualizado);

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Estado inválido. Valores permitidos: ACTIVO, INACTIVO"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al cambiar estado: " + e.getMessage()));
        }
    }

    /**
     * Eliminar conductor
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminar(@PathVariable Long id) {
        try {
            if (!conductorRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            
            // Validar que no tenga asignaciones de ruta
            if (asignacionRutaRepository.existsByConductorId(id)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "No se puede eliminar el conductor porque tiene rutas asignadas")
                );
            }
            
            // Validar que no tenga asignaciones de vehículo activas
            if (asignacionVehiculoRepository.existsActivaByConductorId(id)) {
                return ResponseEntity.badRequest().body(
                    Map.of("error", "No se puede eliminar el conductor porque tiene un vehículo asignado activamente")
                );
            }

            conductorRepository.deleteById(id);
            return ResponseEntity.ok(Map.of("message", "Conductor eliminado exitosamente"));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al eliminar conductor: " + e.getMessage()));
        }
    }

    /**
     * Desactivar conductor por userId (soft delete)
     */
    @PutMapping("/usuario/{userId}/desactivar")
    public ResponseEntity<?> desactivarConductorPorUserId(@PathVariable Long userId) {
        return conductorRepository.findByUserId(userId)
                .map(conductor -> {
                    conductor.setEstado(Conductor.EstadoConductor.INACTIVO);
                    conductorRepository.save(conductor);
                    return ResponseEntity.ok(Map.of("message", "Conductor desactivado"));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Record para requests

    /**
     * Crear conductor vinculado a un usuario (para registro)
     * Endpoint interno usado por el servicio de autenticación
     */
    @PostMapping("/vincular-usuario")
    public ResponseEntity<?> crearConUsuario(@RequestBody CrearConductorConUsuarioRequest request) {
        try {
            // Validaciones
            if (request.userId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El userId es obligatorio"));
            }
            if (request.nombreCompleto() == null || request.nombreCompleto().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "El nombre es obligatorio"));
            }
            if (request.licencia() == null || request.licencia().isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La licencia es obligatoria"));
            }

            // Verificar que no exista ya un conductor con ese user_id
            if (conductorRepository.findByUserId(request.userId()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Ya existe un conductor vinculado a este usuario"));
            }

            // Verificar licencia única
            if (conductorRepository.findByLicencia(request.licencia()).isPresent()) {
                return ResponseEntity.badRequest().body(Map.of("error", "La licencia ya está registrada"));
            }

            // Verificar teléfono único si se proporciona
            if (request.telefono() != null && !request.telefono().isBlank()) {
                if (conductorRepository.findByTelefono(request.telefono()).isPresent()) {
                    return ResponseEntity.badRequest().body(Map.of("error", "El teléfono ya está registrado"));
                }
            }

            Conductor conductor = new Conductor();
            conductor.setUserId(request.userId());
            conductor.setNombreCompleto(request.nombreCompleto().trim());
            conductor.setLicencia(request.licencia().trim());
            conductor.setTelefono(request.telefono() != null ? request.telefono().trim() : null);
            conductor.setEstado(Conductor.EstadoConductor.ACTIVO);

            Conductor guardado = conductorRepository.save(conductor);
            return ResponseEntity.ok(guardado);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error al crear conductor: " + e.getMessage()));
        }
    }

    public record CrearConductorRequest(
            String nombreCompleto,
            String licencia,
            String telefono
    ) {}
    
    public record CrearConductorConUsuarioRequest(
            Long userId,
            String nombreCompleto,
            String licencia,
            String telefono
    ) {}
}

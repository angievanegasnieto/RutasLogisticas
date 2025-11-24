package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.Request.CrearAsignacionVehiculoRequest;
import rutaslogisticas.Service.AsignacionVehiculoService;
import rutaslogisticas.dto.AsignacionVehiculoDTO;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/asignaciones-vehiculo")
@CrossOrigin(origins = "http://localhost:4200")
public class AsignacionVehiculoController {
    
    @Autowired
    private AsignacionVehiculoService asignacionVehiculoService;
    
    /**
     * Listar todas las asignaciones activas
     */
    @GetMapping("/activas")
    public ResponseEntity<List<AsignacionVehiculoDTO>> listarActivas() {
        List<AsignacionVehiculoDTO> asignaciones = asignacionVehiculoService.obtenerAsignacionesActivas();
        return ResponseEntity.ok(asignaciones);
    }
    
    /**
     * Listar todas las asignaciones (activas e históricas)
     */
    @GetMapping
    public ResponseEntity<List<AsignacionVehiculoDTO>> listarTodas() {
        List<AsignacionVehiculoDTO> asignaciones = asignacionVehiculoService.obtenerTodasAsignaciones();
        return ResponseEntity.ok(asignaciones);
    }
    
    /**
     * Obtener asignación por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> obtenerPorId(@PathVariable Long id) {
        try {
            AsignacionVehiculoDTO asignacion = asignacionVehiculoService.obtenerAsignacionPorId(id);
            return ResponseEntity.ok(asignacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Obtener asignación activa de un conductor
     */
    @GetMapping("/conductor/{conductorId}/activa")
    public ResponseEntity<?> obtenerAsignacionActivaDeConductor(@PathVariable Long conductorId) {
        AsignacionVehiculoDTO asignacion = asignacionVehiculoService.obtenerAsignacionActivaDeConductor(conductorId);
        if (asignacion == null) {
            return ResponseEntity.ok(Map.of("message", "El conductor no tiene asignación activa"));
        }
        return ResponseEntity.ok(asignacion);
    }
    
    /**
     * Obtener asignación activa de un vehículo
     */
    @GetMapping("/vehiculo/{vehiculoId}/activa")
    public ResponseEntity<?> obtenerAsignacionActivaDeVehiculo(@PathVariable Long vehiculoId) {
        AsignacionVehiculoDTO asignacion = asignacionVehiculoService.obtenerAsignacionActivaDeVehiculo(vehiculoId);
        if (asignacion == null) {
            return ResponseEntity.ok(Map.of("message", "El vehículo no tiene asignación activa"));
        }
        return ResponseEntity.ok(asignacion);
    }
    
    /**
     * Obtener historial de asignaciones de un conductor
     */
    @GetMapping("/conductor/{conductorId}/historial")
    public ResponseEntity<List<AsignacionVehiculoDTO>> obtenerHistorialConductor(@PathVariable Long conductorId) {
        List<AsignacionVehiculoDTO> historial = asignacionVehiculoService.obtenerHistorialConductor(conductorId);
        return ResponseEntity.ok(historial);
    }
    
    /**
     * Obtener historial de asignaciones de un vehículo
     */
    @GetMapping("/vehiculo/{vehiculoId}/historial")
    public ResponseEntity<List<AsignacionVehiculoDTO>> obtenerHistorialVehiculo(@PathVariable Long vehiculoId) {
        List<AsignacionVehiculoDTO> historial = asignacionVehiculoService.obtenerHistorialVehiculo(vehiculoId);
        return ResponseEntity.ok(historial);
    }
    
    /**
     * Crear una nueva asignación
     */
    @PostMapping
    public ResponseEntity<?> crearAsignacion(@RequestBody CrearAsignacionVehiculoRequest request) {
        try {
            // Validaciones
            if (request.conductorId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El ID del conductor es obligatorio"));
            }
            if (request.vehiculoId() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El ID del vehículo es obligatorio"));
            }
            
            AsignacionVehiculoDTO asignacion = asignacionVehiculoService.crearAsignacion(
                request.conductorId(),
                request.vehiculoId(),
                request.observaciones()
            );
            
            return ResponseEntity.ok(asignacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Finalizar una asignación
     */
    @PutMapping("/{id}/finalizar")
    public ResponseEntity<?> finalizarAsignacion(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String observaciones = request != null ? request.get("observaciones") : null;
            AsignacionVehiculoDTO asignacion = asignacionVehiculoService.finalizarAsignacion(id, observaciones);
            return ResponseEntity.ok(asignacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Finalizar la asignación activa de un conductor
     */
    @PutMapping("/conductor/{conductorId}/finalizar")
    public ResponseEntity<?> finalizarAsignacionDeConductor(
            @PathVariable Long conductorId,
            @RequestBody(required = false) Map<String, String> request) {
        try {
            String observaciones = request != null ? request.get("observaciones") : null;
            AsignacionVehiculoDTO asignacion = asignacionVehiculoService.finalizarAsignacionPorConductor(
                conductorId,
                observaciones
            );
            return ResponseEntity.ok(asignacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
    /**
     * Reasignar vehículo a un conductor (finaliza la asignación actual y crea una nueva)
     */
    @PutMapping("/conductor/{conductorId}/reasignar")
    public ResponseEntity<?> reasignarVehiculo(
            @PathVariable Long conductorId,
            @RequestBody Map<String, Object> request) {
        try {
            Long nuevoVehiculoId = ((Number) request.get("vehiculoId")).longValue();
            String observaciones = (String) request.get("observaciones");
            
            if (nuevoVehiculoId == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "El ID del vehículo es obligatorio"));
            }
            
            AsignacionVehiculoDTO asignacion = asignacionVehiculoService.reasignarVehiculo(
                conductorId,
                nuevoVehiculoId,
                observaciones
            );
            
            return ResponseEntity.ok(asignacion);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

package rutaslogisticas.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rutaslogisticas.dto.AsignacionVehiculoDTO;
import rutaslogisticas.entity.AsignacionVehiculo;
import rutaslogisticas.entity.AsignacionVehiculo.EstadoAsignacion;
import rutaslogisticas.entity.Conductor;
import rutaslogisticas.entity.Vehiculo;
import rutaslogisticas.repository.AsignacionVehiculoRepository;
import rutaslogisticas.repository.ConductorRepository;
import rutaslogisticas.repository.VehiculoRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AsignacionVehiculoService {
    
    @Autowired
    private AsignacionVehiculoRepository asignacionVehiculoRepository;
    
    @Autowired
    private ConductorRepository conductorRepository;
    
    @Autowired
    private VehiculoRepository vehiculoRepository;
    
    /**
     * Crear una nueva asignación de vehículo a conductor
     */
    @Transactional
    public AsignacionVehiculoDTO crearAsignacion(Long conductorId, Long vehiculoId, String observaciones) {
        // Validar que el conductor existe
        Conductor conductor = conductorRepository.findById(conductorId)
                .orElseThrow(() -> new RuntimeException("Conductor no encontrado"));
        
        // Validar que el vehículo existe
        Vehiculo vehiculo = vehiculoRepository.findById(vehiculoId)
                .orElseThrow(() -> new RuntimeException("Vehículo no encontrado"));
        
        // Validar que el conductor esté activo
        if (conductor.getEstado() != Conductor.EstadoConductor.ACTIVO) {
            throw new RuntimeException("El conductor no está activo");
        }
        
        // Validar que el vehículo esté activo
        if (vehiculo.getEstado() != Vehiculo.EstadoVehiculo.ACTIVO) {
            throw new RuntimeException("El vehículo no está activo");
        }
        
        // Validar que el conductor no tenga otra asignación activa
        if (asignacionVehiculoRepository.existsActivaByConductorId(conductorId)) {
            throw new RuntimeException("El conductor ya tiene un vehículo asignado activamente");
        }
        
        // Validar que el vehículo no esté asignado a otro conductor
        if (asignacionVehiculoRepository.existsActivaByVehiculoId(vehiculoId)) {
            throw new RuntimeException("El vehículo ya está asignado a otro conductor");
        }
        
        // Crear la asignación
        AsignacionVehiculo asignacion = new AsignacionVehiculo();
        asignacion.setConductor(conductor);
        asignacion.setVehiculo(vehiculo);
        asignacion.setFechaAsignacion(LocalDateTime.now());
        asignacion.setEstado(EstadoAsignacion.ACTIVA);
        asignacion.setObservaciones(observaciones);
        
        AsignacionVehiculo guardada = asignacionVehiculoRepository.save(asignacion);
        return new AsignacionVehiculoDTO(guardada);
    }
    
    /**
     * Finalizar una asignación
     */
    @Transactional
    public AsignacionVehiculoDTO finalizarAsignacion(Long asignacionId, String observaciones) {
        AsignacionVehiculo asignacion = asignacionVehiculoRepository.findById(asignacionId)
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada"));
        
        if (asignacion.getEstado() == EstadoAsignacion.FINALIZADA) {
            throw new RuntimeException("La asignación ya está finalizada");
        }
        
        asignacion.setEstado(EstadoAsignacion.FINALIZADA);
        asignacion.setFechaFinalizacion(LocalDateTime.now());
        
        if (observaciones != null && !observaciones.isBlank()) {
            String obs = asignacion.getObservaciones() != null 
                ? asignacion.getObservaciones() + " | " + observaciones 
                : observaciones;
            asignacion.setObservaciones(obs);
        }
        
        AsignacionVehiculo actualizada = asignacionVehiculoRepository.save(asignacion);
        return new AsignacionVehiculoDTO(actualizada);
    }
    
    /**
     * Finalizar la asignación activa de un conductor
     */
    @Transactional
    public AsignacionVehiculoDTO finalizarAsignacionPorConductor(Long conductorId, String observaciones) {
        AsignacionVehiculo asignacion = asignacionVehiculoRepository.findAsignacionActivaByConductorId(conductorId)
                .orElseThrow(() -> new RuntimeException("El conductor no tiene una asignación activa"));
        
        return finalizarAsignacion(asignacion.getId(), observaciones);
    }
    
    /**
     * Obtener todas las asignaciones activas
     */
    public List<AsignacionVehiculoDTO> obtenerAsignacionesActivas() {
        return asignacionVehiculoRepository.findAllActivas().stream()
                .map(AsignacionVehiculoDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener todas las asignaciones
     */
    public List<AsignacionVehiculoDTO> obtenerTodasAsignaciones() {
        return asignacionVehiculoRepository.findAll().stream()
                .map(AsignacionVehiculoDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener asignación por ID
     */
    public AsignacionVehiculoDTO obtenerAsignacionPorId(Long id) {
        AsignacionVehiculo asignacion = asignacionVehiculoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Asignación no encontrada"));
        return new AsignacionVehiculoDTO(asignacion);
    }
    
    /**
     * Obtener asignación activa de un conductor
     */
    public AsignacionVehiculoDTO obtenerAsignacionActivaDeConductor(Long conductorId) {
        return asignacionVehiculoRepository.findAsignacionActivaByConductorId(conductorId)
                .map(AsignacionVehiculoDTO::new)
                .orElse(null);
    }
    
    /**
     * Obtener asignación activa de un vehículo
     */
    public AsignacionVehiculoDTO obtenerAsignacionActivaDeVehiculo(Long vehiculoId) {
        return asignacionVehiculoRepository.findAsignacionActivaByVehiculoId(vehiculoId)
                .map(AsignacionVehiculoDTO::new)
                .orElse(null);
    }
    
    /**
     * Obtener historial de asignaciones de un conductor
     */
    public List<AsignacionVehiculoDTO> obtenerHistorialConductor(Long conductorId) {
        return asignacionVehiculoRepository.findByConductorId(conductorId).stream()
                .map(AsignacionVehiculoDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Obtener historial de asignaciones de un vehículo
     */
    public List<AsignacionVehiculoDTO> obtenerHistorialVehiculo(Long vehiculoId) {
        return asignacionVehiculoRepository.findByVehiculoId(vehiculoId).stream()
                .map(AsignacionVehiculoDTO::new)
                .collect(Collectors.toList());
    }
    
    /**
     * Reasignar vehículo (finaliza la asignación actual y crea una nueva)
     */
    @Transactional
    public AsignacionVehiculoDTO reasignarVehiculo(Long conductorId, Long nuevoVehiculoId, String observaciones) {
        // Finalizar asignación actual si existe
        asignacionVehiculoRepository.findAsignacionActivaByConductorId(conductorId)
                .ifPresent(asignacion -> {
                    asignacion.setEstado(EstadoAsignacion.FINALIZADA);
                    asignacion.setFechaFinalizacion(LocalDateTime.now());
                    asignacion.setObservaciones(
                        (asignacion.getObservaciones() != null ? asignacion.getObservaciones() + " | " : "") 
                        + "Reasignación"
                    );
                    asignacionVehiculoRepository.save(asignacion);
                });
        
        // Crear nueva asignación
        return crearAsignacion(conductorId, nuevoVehiculoId, observaciones);
    }
}

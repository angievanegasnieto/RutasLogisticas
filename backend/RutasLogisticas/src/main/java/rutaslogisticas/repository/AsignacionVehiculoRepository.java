package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.AsignacionVehiculo;
import rutaslogisticas.entity.AsignacionVehiculo.EstadoAsignacion;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsignacionVehiculoRepository extends JpaRepository<AsignacionVehiculo, Long> {
    
    /**
     * Verificar si existe una asignación activa para un conductor
     */
    @Query("SELECT COUNT(a) > 0 FROM AsignacionVehiculo a WHERE a.conductor.id = :conductorId AND a.estado = 'ACTIVA'")
    boolean existsActivaByConductorId(@Param("conductorId") Long conductorId);
    
    /**
     * Verificar si existe una asignación activa para un vehículo
     */
    @Query("SELECT COUNT(a) > 0 FROM AsignacionVehiculo a WHERE a.vehiculo.id = :vehiculoId AND a.estado = 'ACTIVA'")
    boolean existsActivaByVehiculoId(@Param("vehiculoId") Long vehiculoId);
    
    /**
     * Obtener la asignación activa de un conductor
     */
    @Query("SELECT a FROM AsignacionVehiculo a WHERE a.conductor.id = :conductorId AND a.estado = 'ACTIVA'")
    Optional<AsignacionVehiculo> findAsignacionActivaByConductorId(@Param("conductorId") Long conductorId);
    
    /**
     * Obtener la asignación activa de un vehículo
     */
    @Query("SELECT a FROM AsignacionVehiculo a WHERE a.vehiculo.id = :vehiculoId AND a.estado = 'ACTIVA'")
    Optional<AsignacionVehiculo> findAsignacionActivaByVehiculoId(@Param("vehiculoId") Long vehiculoId);
    
    /**
     * Obtener todas las asignaciones activas
     */
    @Query("SELECT a FROM AsignacionVehiculo a WHERE a.estado = 'ACTIVA' ORDER BY a.fechaAsignacion DESC")
    List<AsignacionVehiculo> findAllActivas();
    
    /**
     * Obtener todas las asignaciones de un conductor
     */
    @Query("SELECT a FROM AsignacionVehiculo a WHERE a.conductor.id = :conductorId ORDER BY a.fechaAsignacion DESC")
    List<AsignacionVehiculo> findByConductorId(@Param("conductorId") Long conductorId);
    
    /**
     * Obtener todas las asignaciones de un vehículo
     */
    @Query("SELECT a FROM AsignacionVehiculo a WHERE a.vehiculo.id = :vehiculoId ORDER BY a.fechaAsignacion DESC")
    List<AsignacionVehiculo> findByVehiculoId(@Param("vehiculoId") Long vehiculoId);
    
    /**
     * Obtener todas las asignaciones por estado
     */
    List<AsignacionVehiculo> findByEstadoOrderByFechaAsignacionDesc(EstadoAsignacion estado);
}

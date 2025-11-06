package rutaslogisticas.Repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.Auditoria;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditoriaRepository extends JpaRepository<Auditoria, Long> {
    List<Auditoria> findByUsuarioIdOrderByCreadoEnDesc(Long usuarioId);
    List<Auditoria> findByAccion(String accion);
    List<Auditoria> findByNivel(Auditoria.Nivel nivel);
    List<Auditoria> findByCreadoEnBetween(LocalDateTime inicio, LocalDateTime fin);

    @Query("SELECT a FROM Auditoria a WHERE a.tipoEntidad = ?1 AND a.entidadId = ?2 ORDER BY a.creadoEn DESC")
    List<Auditoria> findByEntidad(String tipoEntidad, Long entidadId);
    
    // Método para obtener auditorías por tipo de entidad
    List<Auditoria> findByTipoEntidad(String tipoEntidad);
}

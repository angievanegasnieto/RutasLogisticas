package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.AsignacionRuta;

@Repository
public interface AsignacionRutaRepository extends JpaRepository<AsignacionRuta, Long> {
    
    @Query("SELECT COUNT(a) > 0 FROM AsignacionRuta a WHERE a.conductor.id = :conductorId")
    boolean existsByConductorId(@Param("conductorId") Long conductorId);
}

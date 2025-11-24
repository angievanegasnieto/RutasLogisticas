package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import rutaslogisticas.entity.Ruta;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface RutaRepository extends JpaRepository<Ruta, Long> {
    List<Ruta> findByEstado(Ruta.EstadoRuta estado);
    List<Ruta> findByFechaRuta(LocalDate fechaRuta);
    
    @Query("SELECT r FROM Ruta r LEFT JOIN FETCH r.asignacion a " +
           "LEFT JOIN FETCH a.conductor LEFT JOIN FETCH a.vehiculo " +
           "WHERE r.id = ?1")
    Ruta findByIdWithDetails(Long id);
    
    @Query("SELECT r FROM Ruta r LEFT JOIN FETCH r.asignacion a " +
           "LEFT JOIN FETCH a.conductor WHERE a.conductor.id = ?1")
    List<Ruta> findByConductorId(Long conductorId);
}

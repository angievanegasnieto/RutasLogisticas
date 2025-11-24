package rutaslogisticas.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import rutaslogisticas.entity.Direccion;
import java.util.List;

@Repository
public interface DireccionRepository extends JpaRepository<Direccion, Long> {
    List<Direccion> findByClienteId(Long clienteId);
    List<Direccion> findByCiudad(String ciudad);
    List<Direccion> findByVerificada(Boolean verificada);
    
    @Modifying
    @Transactional
    void deleteByClienteId(Long clienteId);

    @Query("SELECT d FROM Direccion d WHERE d.lat IS NOT NULL AND d.lng IS NOT NULL")
    List<Direccion> findDireccionesGeocodificadas();
}

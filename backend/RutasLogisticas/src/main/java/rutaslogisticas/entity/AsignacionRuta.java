package rutaslogisticas.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asignaciones_ruta")
public class AsignacionRuta {
    @Id
    @Column(name = "ruta_id")
    private Long rutaId;
    
    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "ruta_id")
    private Ruta ruta;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conductor_id", nullable = false)
    private Conductor conductor;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;
    
    @Column(name = "asignado_en", nullable = false)
    private LocalDateTime asignadoEn = LocalDateTime.now();
    
    // Constructores
    public AsignacionRuta() {}
    
    public AsignacionRuta(Ruta ruta, Conductor conductor, Vehiculo vehiculo) {
        this.ruta = ruta;
        this.conductor = conductor;
        this.vehiculo = vehiculo;
        this.rutaId = ruta.getId();
        this.asignadoEn = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getRutaId() { return rutaId; }
    public void setRutaId(Long rutaId) { this.rutaId = rutaId; }
    
    public Ruta getRuta() { return ruta; }
    public void setRuta(Ruta ruta) { this.ruta = ruta; }
    
    public Conductor getConductor() { return conductor; }
    public void setConductor(Conductor conductor) { this.conductor = conductor; }
    
    public Vehiculo getVehiculo() { return vehiculo; }
    public void setVehiculo(Vehiculo vehiculo) { this.vehiculo = vehiculo; }
    
    public LocalDateTime getAsignadoEn() { return asignadoEn; }
    public void setAsignadoEn(LocalDateTime asignadoEn) { this.asignadoEn = asignadoEn; }
}

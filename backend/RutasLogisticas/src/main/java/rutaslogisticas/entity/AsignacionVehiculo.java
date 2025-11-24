package rutaslogisticas.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "asignaciones_vehiculo")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AsignacionVehiculo {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "conductor_id", nullable = false)
    private Conductor conductor;
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vehiculo_id", nullable = false)
    private Vehiculo vehiculo;
    
    @Column(name = "fecha_asignacion", nullable = false)
    private LocalDateTime fechaAsignacion = LocalDateTime.now();
    
    @Column(name = "fecha_finalizacion")
    private LocalDateTime fechaFinalizacion;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoAsignacion estado = EstadoAsignacion.ACTIVA;
    
    @Column(name = "observaciones", length = 255)
    private String observaciones;
    
    public enum EstadoAsignacion {
        ACTIVA, FINALIZADA
    }
    
    // Constructores
    public AsignacionVehiculo() {}
    
    public AsignacionVehiculo(Conductor conductor, Vehiculo vehiculo) {
        this.conductor = conductor;
        this.vehiculo = vehiculo;
        this.fechaAsignacion = LocalDateTime.now();
        this.estado = EstadoAsignacion.ACTIVA;
    }
    
    // Getters y Setters
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public Conductor getConductor() { 
        return conductor; 
    }
    
    public void setConductor(Conductor conductor) { 
        this.conductor = conductor; 
    }
    
    public Vehiculo getVehiculo() { 
        return vehiculo; 
    }
    
    public void setVehiculo(Vehiculo vehiculo) { 
        this.vehiculo = vehiculo; 
    }
    
    public LocalDateTime getFechaAsignacion() { 
        return fechaAsignacion; 
    }
    
    public void setFechaAsignacion(LocalDateTime fechaAsignacion) { 
        this.fechaAsignacion = fechaAsignacion; 
    }
    
    public LocalDateTime getFechaFinalizacion() { 
        return fechaFinalizacion; 
    }
    
    public void setFechaFinalizacion(LocalDateTime fechaFinalizacion) { 
        this.fechaFinalizacion = fechaFinalizacion; 
    }
    
    public EstadoAsignacion getEstado() { 
        return estado; 
    }
    
    public void setEstado(EstadoAsignacion estado) { 
        this.estado = estado; 
    }
    
    public String getObservaciones() { 
        return observaciones; 
    }
    
    public void setObservaciones(String observaciones) { 
        this.observaciones = observaciones; 
    }
}

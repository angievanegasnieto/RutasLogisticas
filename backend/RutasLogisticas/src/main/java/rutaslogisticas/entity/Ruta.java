package rutaslogisticas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rutas")
public class Ruta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "fecha_ruta", nullable = false)
    private LocalDate fechaRuta;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoRuta estado = EstadoRuta.PLANIFICADA;
    
    @Column(name = "distancia_km", precision = 10, scale = 2)
    private BigDecimal distanciaKm = BigDecimal.ZERO;
    
    @Column(name = "tiempo_min")
    private Integer tiempoMin = 0;
    
    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
    
    @OneToOne(mappedBy = "ruta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AsignacionRuta asignacion;
    
    @OneToMany(mappedBy = "ruta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<ParadaRuta> paradas = new ArrayList<>();
    
    public enum EstadoRuta {
        PLANIFICADA, ASIGNADA, EN_PROGRESO, PAUSADA, COMPLETADA
    }
    
    // Constructores
    public Ruta() {}
    
    public Ruta(LocalDate fechaRuta) {
        this.fechaRuta = fechaRuta;
        this.creadoEn = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDate getFechaRuta() { return fechaRuta; }
    public void setFechaRuta(LocalDate fechaRuta) { this.fechaRuta = fechaRuta; }
    
    public EstadoRuta getEstado() { return estado; }
    public void setEstado(EstadoRuta estado) { this.estado = estado; }
    
    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }
    
    public Integer getTiempoMin() { return tiempoMin; }
    public void setTiempoMin(Integer tiempoMin) { this.tiempoMin = tiempoMin; }
    
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    
    public AsignacionRuta getAsignacion() { return asignacion; }
    public void setAsignacion(AsignacionRuta asignacion) { this.asignacion = asignacion; }
    
    public List<ParadaRuta> getParadas() { return paradas; }
    public void setParadas(List<ParadaRuta> paradas) { this.paradas = paradas; }
}

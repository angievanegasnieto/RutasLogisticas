package rutaslogisticas.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "conductores")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Conductor {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id")
    private Long userId;
    
    @Column(name = "nombre_completo", nullable = false, length = 120)
    private String nombreCompleto;
    
    @Column(name = "licencia", nullable = false, unique = true, length = 50)
    private String licencia;
    
    @Column(name = "telefono", length = 30)
    private String telefono;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoConductor estado = EstadoConductor.ACTIVO;
    
    public enum EstadoConductor {
        ACTIVO, INACTIVO
    }
    
    // Constructores
    public Conductor() {}
    
    public Conductor(String nombreCompleto, String licencia) {
        this.nombreCompleto = nombreCompleto;
        this.licencia = licencia;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getNombreCompleto() { return nombreCompleto; }
    public void setNombreCompleto(String nombreCompleto) { this.nombreCompleto = nombreCompleto; }
    
    public String getLicencia() { return licencia; }
    public void setLicencia(String licencia) { this.licencia = licencia; }
    
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    
    public EstadoConductor getEstado() { return estado; }
    public void setEstado(EstadoConductor estado) { this.estado = estado; }
}

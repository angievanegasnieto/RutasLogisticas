package rutaslogisticas.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "auditoria")
public class Auditoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Por ahora usamos solo el ID del usuario para evitar problemas de relación
    @Column(name = "usuario_id")
    private Long usuarioId;
    
    @Column(name = "accion", nullable = false, length = 80)
    private String accion;
    
    @Column(name = "tipo_entidad", length = 80)
    private String tipoEntidad;
    
    @Column(name = "entidad_id")
    private Long entidadId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "nivel", nullable = false)
    private Nivel nivel = Nivel.INFO;
    
    @Column(name = "mensaje")
    private String mensaje;
    
    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
    
    public enum Nivel {
        INFO, ADVERTENCIA, ERROR
    }
    
    // Constructores
    public Auditoria() {}
    
    public Auditoria(Long usuarioId, String accion, String mensaje) {
        this.usuarioId = usuarioId;
        this.accion = accion;
        this.mensaje = mensaje;
        this.creadoEn = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUsuarioId() { return usuarioId; }
    public void setUsuarioId(Long usuarioId) { this.usuarioId = usuarioId; }
    
    public String getAccion() { return accion; }
    public void setAccion(String accion) { this.accion = accion; }
    
    public String getTipoEntidad() { return tipoEntidad; }
    public void setTipoEntidad(String tipoEntidad) { this.tipoEntidad = tipoEntidad; }
    
    public Long getEntidadId() { return entidadId; }
    public void setEntidadId(Long entidadId) { this.entidadId = entidadId; }
    
    public Nivel getNivel() { return nivel; }
    public void setNivel(Nivel nivel) { this.nivel = nivel; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}

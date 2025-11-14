package rutaslogisticas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "eventos_entrega")
public class EventoEntrega {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    // Relación con parada_ruta (esquema original - opcional)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parada_ruta_id")
    private ParadaRuta paradaRuta;
    
    // Relación directa con pedido (esquema nuevo - opcional)
    @Column(name = "pedido_id")
    private Long pedidoId;
    
    @Column(name = "conductor_id")
    private Long conductorId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "tipo_evento", nullable = false)
    private TipoEvento tipoEvento;
    
    @Column(name = "estado_anterior", length = 50)
    private String estadoAnterior;
    
    @Column(name = "estado_nuevo", length = 50)
    private String estadoNuevo;
    
    @Column(name = "fecha_evento", nullable = false)
    private LocalDateTime fechaEvento = LocalDateTime.now();
    
    @Column(name = "mensaje", length = 255)
    private String mensaje;
    
    @Column(name = "notas", length = 500)
    private String notas;
    
    @Column(name = "latitud", precision = 10, scale = 7)
    private BigDecimal latitud;
    
    @Column(name = "longitud", precision = 10, scale = 7)
    private BigDecimal longitud;
    
    public enum TipoEvento {
        INICIO_RUTA, PAUSA, REANUDAR, FIN_RUTA, 
        LLEGADA_PARADA, SALIDA_PARADA, 
        ENTREGADO, FALLIDO, REINTENTO
    }
    
    // Constructores
    public EventoEntrega() {}
    
    // Constructor para esquema original (con ParadaRuta)
    public EventoEntrega(ParadaRuta paradaRuta, TipoEvento tipoEvento, String mensaje) {
        this.paradaRuta = paradaRuta;
        this.tipoEvento = tipoEvento;
        this.mensaje = mensaje;
        this.fechaEvento = LocalDateTime.now();
    }
    
    // Constructor para esquema nuevo (con pedido directo)
    public EventoEntrega(Long pedidoId, Long conductorId, TipoEvento tipoEvento, String estadoAnterior, String estadoNuevo) {
        this.pedidoId = pedidoId;
        this.conductorId = conductorId;
        this.tipoEvento = tipoEvento;
        this.estadoAnterior = estadoAnterior;
        this.estadoNuevo = estadoNuevo;
        this.fechaEvento = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public ParadaRuta getParadaRuta() { return paradaRuta; }
    public void setParadaRuta(ParadaRuta paradaRuta) { this.paradaRuta = paradaRuta; }
    
    public Long getPedidoId() { return pedidoId; }
    public void setPedidoId(Long pedidoId) { this.pedidoId = pedidoId; }
    
    public Long getConductorId() { return conductorId; }
    public void setConductorId(Long conductorId) { this.conductorId = conductorId; }
    
    public TipoEvento getTipoEvento() { return tipoEvento; }
    public void setTipoEvento(TipoEvento tipoEvento) { this.tipoEvento = tipoEvento; }
    
    public String getEstadoAnterior() { return estadoAnterior; }
    public void setEstadoAnterior(String estadoAnterior) { this.estadoAnterior = estadoAnterior; }
    
    public String getEstadoNuevo() { return estadoNuevo; }
    public void setEstadoNuevo(String estadoNuevo) { this.estadoNuevo = estadoNuevo; }
    
    public LocalDateTime getFechaEvento() { return fechaEvento; }
    public void setFechaEvento(LocalDateTime fechaEvento) { this.fechaEvento = fechaEvento; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
    
    public BigDecimal getLatitud() { return latitud; }
    public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }
    
    public BigDecimal getLongitud() { return longitud; }
    public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }
}

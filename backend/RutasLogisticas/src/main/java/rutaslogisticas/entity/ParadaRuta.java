package rutaslogisticas.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "paradas_ruta", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ruta_id", "pedido_id"})
})
public class ParadaRuta {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ruta_id", nullable = false)
    private Ruta ruta;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;
    
    @Column(name = "secuencia", nullable = false)
    private Integer secuencia;
    
    @Column(name = "eta")
    private LocalDateTime eta; // Estimated Time of Arrival
    
    @Column(name = "ata")
    private LocalDateTime ata; // Actual Time of Arrival
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoParada estado = EstadoParada.PENDIENTE;
    
    @Column(name = "foto_url", length = 255)
    private String fotoUrl;
    
    @Column(name = "nota", length = 255)
    private String nota;
    
    @OneToMany(mappedBy = "paradaRuta", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EventoEntrega> eventos = new ArrayList<>();
    
    public enum EstadoParada {
        PENDIENTE, ENTREGADO, FALLIDO
    }
    
    // Constructores
    public ParadaRuta() {}
    
    public ParadaRuta(Ruta ruta, Pedido pedido, Integer secuencia) {
        this.ruta = ruta;
        this.pedido = pedido;
        this.secuencia = secuencia;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Ruta getRuta() { return ruta; }
    public void setRuta(Ruta ruta) { this.ruta = ruta; }
    
    public Pedido getPedido() { return pedido; }
    public void setPedido(Pedido pedido) { this.pedido = pedido; }
    
    public Integer getSecuencia() { return secuencia; }
    public void setSecuencia(Integer secuencia) { this.secuencia = secuencia; }
    
    public LocalDateTime getEta() { return eta; }
    public void setEta(LocalDateTime eta) { this.eta = eta; }
    
    public LocalDateTime getAta() { return ata; }
    public void setAta(LocalDateTime ata) { this.ata = ata; }
    
    public EstadoParada getEstado() { return estado; }
    public void setEstado(EstadoParada estado) { this.estado = estado; }
    
    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    
    public String getNota() { return nota; }
    public void setNota(String nota) { this.nota = nota; }
    
    public List<EventoEntrega> getEventos() { return eventos; }
    public void setEventos(List<EventoEntrega> eventos) { this.eventos = eventos; }
}

package rutaslogisticas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Entity
@Table(name = "pedidos")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "direccion_id", nullable = false)
    private Direccion direccion;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conductor_id")
    private Conductor conductor;
    
    @Column(name = "fecha_programada", nullable = false)
    private LocalDate fechaProgramada;
    
    @Column(name = "ventana_inicio")
    private LocalTime ventanaInicio;
    
    @Column(name = "ventana_fin")
    private LocalTime ventanaFin;
    
    @Column(name = "volumen", precision = 10, scale = 2)
    private BigDecimal volumen = BigDecimal.ZERO;
    
    @Column(name = "peso", precision = 10, scale = 2)
    private BigDecimal peso = BigDecimal.ZERO;
    
    // Campos adicionales para información del pedido
    @Column(name = "producto")
    private String producto;
    
    @Column(name = "cantidad")
    private Integer cantidad = 1;
    
    // Coordenadas geográficas para geocodificación
    @Column(name = "latitud", precision = 10, scale = 7)
    private BigDecimal latitud;
    
    @Column(name = "longitud", precision = 10, scale = 7)
    private BigDecimal longitud;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;
    
    @Column(name = "creado_en", nullable = false)
    private LocalDateTime creadoEn = LocalDateTime.now();
    
    public enum EstadoPedido {
        PENDIENTE, ASIGNADO, EN_RUTA, ENTREGADO, FALLIDO, REINTENTO
    }
    
    // Constructores
    public Pedido() {}
    
    public Pedido(Cliente cliente, Direccion direccion, LocalDate fechaProgramada) {
        this.cliente = cliente;
        this.direccion = direccion;
        this.fechaProgramada = fechaProgramada;
        this.creadoEn = LocalDateTime.now();
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    
    public Direccion getDireccion() { return direccion; }
    public void setDireccion(Direccion direccion) { this.direccion = direccion; }
    
    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }
    
    public LocalTime getVentanaInicio() { return ventanaInicio; }
    public void setVentanaInicio(LocalTime ventanaInicio) { this.ventanaInicio = ventanaInicio; }
    
    public LocalTime getVentanaFin() { return ventanaFin; }
    public void setVentanaFin(LocalTime ventanaFin) { this.ventanaFin = ventanaFin; }
    
    public BigDecimal getVolumen() { return volumen; }
    public void setVolumen(BigDecimal volumen) { this.volumen = volumen; }
    
    public BigDecimal getPeso() { return peso; }
    public void setPeso(BigDecimal peso) { this.peso = peso; }
    
    public EstadoPedido getEstado() { return estado; }
    public void setEstado(EstadoPedido estado) { this.estado = estado; }
    
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    
    public String getProducto() { return producto; }
    public void setProducto(String producto) { this.producto = producto; }
    
    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }
    
    public BigDecimal getLatitud() { return latitud; }
    public void setLatitud(BigDecimal latitud) { this.latitud = latitud; }
    
    public BigDecimal getLongitud() { return longitud; }
    public void setLongitud(BigDecimal longitud) { this.longitud = longitud; }
    
    public Conductor getConductor() { return conductor; }
    public void setConductor(Conductor conductor) { this.conductor = conductor; }
    
    public Long getConductorId() { 
        return conductor != null ? conductor.getId() : null; 
    }
}

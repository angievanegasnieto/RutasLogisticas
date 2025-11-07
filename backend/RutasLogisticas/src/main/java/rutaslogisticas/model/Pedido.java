package rutaslogisticas.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "pedidos")
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Texto directo (no IDs obligatorios)
    @Column(nullable = false)
    private String cliente;

    @Column(nullable = false)
    private String direccion;

    @Column(nullable = false)
    private String producto;

    @Column(nullable = false)
    private Integer cantidad;

    // IDs opcionales (por si mañana los usas)
    @Column(name = "cliente_id")
    private Long clienteId;

    @Column(name = "direccion_id")
    private Long direccionId;

    @Column(name = "fecha_programada", nullable = false)
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd") // "2025-10-27"
    private LocalDate fechaProgramada;

    @Column(name = "ventana_inicio")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")   // "08:00:00"
    private LocalTime ventanaInicio;

    @Column(name = "ventana_fin")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "HH:mm:ss")   // "12:00:00"
    private LocalTime ventanaFin;

    private Double volumen;
    private Double peso;

    @Column(nullable = false)
    private String estado;

    public Pedido() {}

    @PrePersist
    public void prePersist() {
        if (cantidad == null) cantidad = 1;
        if (estado == null) estado = "PENDIENTE";
        if (ventanaInicio == null) ventanaInicio = LocalTime.of(8, 0);
        if (ventanaFin == null) ventanaFin = LocalTime.of(12, 0);
        if (cliente != null) cliente = cliente.trim();
        if (direccion != null) direccion = direccion.trim();
        if (producto != null) producto = producto.trim();
    }

    // Getters/Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }

    public String getProducto() { return producto; }
    public void setProducto(String producto) { this.producto = producto; }

    public Integer getCantidad() { return cantidad; }
    public void setCantidad(Integer cantidad) { this.cantidad = cantidad; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public Long getDireccionId() { return direccionId; }
    public void setDireccionId(Long direccionId) { this.direccionId = direccionId; }

    public LocalDate getFechaProgramada() { return fechaProgramada; }
    public void setFechaProgramada(LocalDate fechaProgramada) { this.fechaProgramada = fechaProgramada; }

    public LocalTime getVentanaInicio() { return ventanaInicio; }
    public void setVentanaInicio(LocalTime ventanaInicio) { this.ventanaInicio = ventanaInicio; }

    public LocalTime getVentanaFin() { return ventanaFin; }
    public void setVentanaFin(LocalTime ventanaFin) { this.ventanaFin = ventanaFin; }

    public Double getVolumen() { return volumen; }
    public void setVolumen(Double volumen) { this.volumen = volumen; }

    public Double getPeso() { return peso; }
    public void setPeso(Double peso) { this.peso = peso; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}

package rutaslogisticas.Request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import rutaslogisticas.entity.Pedido;

public class CreatePedidoRequest {
    private Long clienteId;
    private Long direccionId;
    private LocalDate fechaProgramada;
    private LocalTime ventanaInicio;
    private LocalTime ventanaFin;
    private BigDecimal volumen = BigDecimal.ZERO;
    private BigDecimal peso = BigDecimal.ZERO;
    private String producto;
    private Integer cantidad = 1;
    private Pedido.EstadoPedido estado;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Long conductorId;

    // Constructores
    public CreatePedidoRequest() {}

    // Getters y Setters
    public Long getClienteId() { 
        return clienteId; 
    }
    
    public void setClienteId(Long clienteId) { 
        this.clienteId = clienteId; 
    }

    public Long getDireccionId() { 
        return direccionId; 
    }
    
    public void setDireccionId(Long direccionId) { 
        this.direccionId = direccionId; 
    }

    public LocalDate getFechaProgramada() { 
        return fechaProgramada; 
    }
    
    public void setFechaProgramada(LocalDate fechaProgramada) { 
        this.fechaProgramada = fechaProgramada; 
    }

    public LocalTime getVentanaInicio() { 
        return ventanaInicio; 
    }
    
    public void setVentanaInicio(LocalTime ventanaInicio) { 
        this.ventanaInicio = ventanaInicio; 
    }

    public LocalTime getVentanaFin() { 
        return ventanaFin; 
    }
    
    public void setVentanaFin(LocalTime ventanaFin) { 
        this.ventanaFin = ventanaFin; 
    }

    public BigDecimal getVolumen() { 
        return volumen; 
    }
    
    public void setVolumen(BigDecimal volumen) { 
        this.volumen = volumen; 
    }

    public BigDecimal getPeso() { 
        return peso; 
    }
    
    public void setPeso(BigDecimal peso) { 
        this.peso = peso; 
    }
    
    public String getProducto() {
        return producto;
    }
    
    public void setProducto(String producto) {
        this.producto = producto;
    }
    
    public Integer getCantidad() {
        return cantidad;
    }
    
    public void setCantidad(Integer cantidad) {
        this.cantidad = cantidad;
    }

    public Pedido.EstadoPedido getEstado() {
        return estado;
    }

    public void setEstado(Pedido.EstadoPedido estado) {
        this.estado = estado;
    }

    public BigDecimal getLatitud() {
        return latitud;
    }

    public void setLatitud(BigDecimal latitud) {
        this.latitud = latitud;
    }

    public BigDecimal getLongitud() {
        return longitud;
    }

    public void setLongitud(BigDecimal longitud) {
        this.longitud = longitud;
    }

    public Long getConductorId() {
        return conductorId;
    }

    public void setConductorId(Long conductorId) {
        this.conductorId = conductorId;
    }
}
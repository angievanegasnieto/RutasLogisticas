package rutaslogisticas.View;

import rutaslogisticas.entity.Pedido;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class PedidoView {
    private Long id;
    private Long clienteId;
    private String clienteNombre;
    private Long direccionId;
    private String direccionCompleta;
    private String ciudad;
    private LocalDate fechaProgramada;
    private LocalTime ventanaInicio;
    private LocalTime ventanaFin;
    private BigDecimal volumen;
    private BigDecimal peso;
    private String producto;
    private Integer cantidad;
    private String estado;
    private LocalDateTime creadoEn;
    private BigDecimal latitud;
    private BigDecimal longitud;
    private Long conductorId;
    private String conductorNombre;

    public PedidoView(Pedido pedido) {
        this.id = pedido.getId();
        this.clienteId = pedido.getCliente().getId();
        this.clienteNombre = pedido.getCliente().getNombre();
        this.direccionId = pedido.getDireccion().getId();
        this.direccionCompleta = pedido.getDireccion().getDireccion();
        this.ciudad = pedido.getDireccion().getCiudad();
        this.fechaProgramada = pedido.getFechaProgramada();
        this.ventanaInicio = pedido.getVentanaInicio();
        this.ventanaFin = pedido.getVentanaFin();
        this.volumen = pedido.getVolumen();
        this.peso = pedido.getPeso();
        this.producto = pedido.getProducto();
        this.cantidad = pedido.getCantidad();
        this.estado = pedido.getEstado().name();
        this.creadoEn = pedido.getCreadoEn();
        this.latitud = pedido.getLatitud();
        this.longitud = pedido.getLongitud();
        // Datos del conductor si existe
        if (pedido.getConductor() != null) {
            this.conductorId = pedido.getConductor().getId();
            this.conductorNombre = pedido.getConductor().getNombreCompleto();
        }
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }

    public Long getDireccionId() { return direccionId; }
    public void setDireccionId(Long direccionId) { this.direccionId = direccionId; }

    public String getDireccionCompleta() { return direccionCompleta; }
    public void setDireccionCompleta(String direccionCompleta) { this.direccionCompleta = direccionCompleta; }

    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }

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

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }

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
    public Long getConductorId() { return conductorId; }
    public void setConductorId(Long conductorId) { this.conductorId = conductorId; }
    public String getConductorNombre() { return conductorNombre; }
    public void setConductorNombre(String conductorNombre) { this.conductorNombre = conductorNombre; }
}

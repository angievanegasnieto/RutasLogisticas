package rutaslogisticas.View;

import rutaslogisticas.entity.ParadaRuta;
import java.time.LocalDateTime;

public class ParadaRutaView {
    private Long id;
    private Long rutaId;
    private Long pedidoId;
    private Integer secuencia;
    private LocalDateTime eta;
    private LocalDateTime ata;
    private String estado;
    private String fotoUrl;
    private String nota;
    
    // Información del pedido asociado
    private String clienteNombre;
    private String direccionCompleta;
    private String ciudad;
    
    public ParadaRutaView(ParadaRuta parada) {
        this.id = parada.getId();
        this.rutaId = parada.getRuta().getId();
        this.pedidoId = parada.getPedido().getId();
        this.secuencia = parada.getSecuencia();
        this.eta = parada.getEta();
        this.ata = parada.getAta();
        this.estado = parada.getEstado().name();
        this.fotoUrl = parada.getFotoUrl();
        this.nota = parada.getNota();
        
        if (parada.getPedido() != null) {
            this.clienteNombre = parada.getPedido().getCliente().getNombre();
            this.direccionCompleta = parada.getPedido().getDireccion().getDireccion();
            this.ciudad = parada.getPedido().getDireccion().getCiudad();
        }
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getRutaId() { return rutaId; }
    public void setRutaId(Long rutaId) { this.rutaId = rutaId; }
    
    public Long getPedidoId() { return pedidoId; }
    public void setPedidoId(Long pedidoId) { this.pedidoId = pedidoId; }
    
    public Integer getSecuencia() { return secuencia; }
    public void setSecuencia(Integer secuencia) { this.secuencia = secuencia; }
    
    public LocalDateTime getEta() { return eta; }
    public void setEta(LocalDateTime eta) { this.eta = eta; }
    
    public LocalDateTime getAta() { return ata; }
    public void setAta(LocalDateTime ata) { this.ata = ata; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public String getFotoUrl() { return fotoUrl; }
    public void setFotoUrl(String fotoUrl) { this.fotoUrl = fotoUrl; }
    
    public String getNota() { return nota; }
    public void setNota(String nota) { this.nota = nota; }
    
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    
    public String getDireccionCompleta() { return direccionCompleta; }
    public void setDireccionCompleta(String direccionCompleta) { this.direccionCompleta = direccionCompleta; }
    
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
}

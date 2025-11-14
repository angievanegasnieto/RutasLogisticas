package rutaslogisticas.View;

import rutaslogisticas.entity.Ruta;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class RutaView {
    private Long id;
    private LocalDate fechaRuta;
    private String estado;
    private BigDecimal distanciaKm;
    private Integer tiempoMin;
    private LocalDateTime creadoEn;
    
    // Información de asignación
    private Long conductorId;
    private String conductorNombre;
    private Long vehiculoId;
    private String vehiculoPlaca;
    
    // Paradas
    private List<ParadaRutaView> paradas;
    
    public RutaView(Ruta ruta) {
        this.id = ruta.getId();
        this.fechaRuta = ruta.getFechaRuta();
        this.estado = ruta.getEstado().name();
        this.distanciaKm = ruta.getDistanciaKm();
        this.tiempoMin = ruta.getTiempoMin();
        this.creadoEn = ruta.getCreadoEn();
        
        if (ruta.getAsignacion() != null) {
            this.conductorId = ruta.getAsignacion().getConductor().getId();
            this.conductorNombre = ruta.getAsignacion().getConductor().getNombreCompleto();
            this.vehiculoId = ruta.getAsignacion().getVehiculo().getId();
            this.vehiculoPlaca = ruta.getAsignacion().getVehiculo().getPlaca();
        }
        
        if (ruta.getParadas() != null) {
            this.paradas = ruta.getParadas().stream()
                .map(ParadaRutaView::new)
                .collect(Collectors.toList());
        }
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public LocalDate getFechaRuta() { return fechaRuta; }
    public void setFechaRuta(LocalDate fechaRuta) { this.fechaRuta = fechaRuta; }
    
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    
    public BigDecimal getDistanciaKm() { return distanciaKm; }
    public void setDistanciaKm(BigDecimal distanciaKm) { this.distanciaKm = distanciaKm; }
    
    public Integer getTiempoMin() { return tiempoMin; }
    public void setTiempoMin(Integer tiempoMin) { this.tiempoMin = tiempoMin; }
    
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
    
    public Long getConductorId() { return conductorId; }
    public void setConductorId(Long conductorId) { this.conductorId = conductorId; }
    
    public String getConductorNombre() { return conductorNombre; }
    public void setConductorNombre(String conductorNombre) { this.conductorNombre = conductorNombre; }
    
    public Long getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Long vehiculoId) { this.vehiculoId = vehiculoId; }
    
    public String getVehiculoPlaca() { return vehiculoPlaca; }
    public void setVehiculoPlaca(String vehiculoPlaca) { this.vehiculoPlaca = vehiculoPlaca; }
    
    public List<ParadaRutaView> getParadas() { return paradas; }
    public void setParadas(List<ParadaRutaView> paradas) { this.paradas = paradas; }
}

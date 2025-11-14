package rutaslogisticas.dto;

import rutaslogisticas.entity.AsignacionVehiculo;
import java.time.LocalDateTime;

public class AsignacionVehiculoDTO {
    
    private Long id;
    private Long conductorId;
    private String conductorNombre;
    private String conductorLicencia;
    private Long vehiculoId;
    private String vehiculoPlaca;
    private String vehiculoModelo;
    private LocalDateTime fechaAsignacion;
    private LocalDateTime fechaFinalizacion;
    private String estado;
    private String observaciones;
    
    // Constructor vacío
    public AsignacionVehiculoDTO() {}
    
    // Constructor desde entidad
    public AsignacionVehiculoDTO(AsignacionVehiculo asignacion) {
        this.id = asignacion.getId();
        this.conductorId = asignacion.getConductor().getId();
        this.conductorNombre = asignacion.getConductor().getNombreCompleto();
        this.conductorLicencia = asignacion.getConductor().getLicencia();
        this.vehiculoId = asignacion.getVehiculo().getId();
        this.vehiculoPlaca = asignacion.getVehiculo().getPlaca();
        this.vehiculoModelo = asignacion.getVehiculo().getModelo();
        this.fechaAsignacion = asignacion.getFechaAsignacion();
        this.fechaFinalizacion = asignacion.getFechaFinalizacion();
        this.estado = asignacion.getEstado().name();
        this.observaciones = asignacion.getObservaciones();
    }
    
    // Getters y Setters
    public Long getId() { 
        return id; 
    }
    
    public void setId(Long id) { 
        this.id = id; 
    }
    
    public Long getConductorId() { 
        return conductorId; 
    }
    
    public void setConductorId(Long conductorId) { 
        this.conductorId = conductorId; 
    }
    
    public String getConductorNombre() { 
        return conductorNombre; 
    }
    
    public void setConductorNombre(String conductorNombre) { 
        this.conductorNombre = conductorNombre; 
    }
    
    public String getConductorLicencia() { 
        return conductorLicencia; 
    }
    
    public void setConductorLicencia(String conductorLicencia) { 
        this.conductorLicencia = conductorLicencia; 
    }
    
    public Long getVehiculoId() { 
        return vehiculoId; 
    }
    
    public void setVehiculoId(Long vehiculoId) { 
        this.vehiculoId = vehiculoId; 
    }
    
    public String getVehiculoPlaca() { 
        return vehiculoPlaca; 
    }
    
    public void setVehiculoPlaca(String vehiculoPlaca) { 
        this.vehiculoPlaca = vehiculoPlaca; 
    }
    
    public String getVehiculoModelo() { 
        return vehiculoModelo; 
    }
    
    public void setVehiculoModelo(String vehiculoModelo) { 
        this.vehiculoModelo = vehiculoModelo; 
    }
    
    public LocalDateTime getFechaAsignacion() { 
        return fechaAsignacion; 
    }
    
    public void setFechaAsignacion(LocalDateTime fechaAsignacion) { 
        this.fechaAsignacion = fechaAsignacion; 
    }
    
    public LocalDateTime getFechaFinalizacion() { 
        return fechaFinalizacion; 
    }
    
    public void setFechaFinalizacion(LocalDateTime fechaFinalizacion) { 
        this.fechaFinalizacion = fechaFinalizacion; 
    }
    
    public String getEstado() { 
        return estado; 
    }
    
    public void setEstado(String estado) { 
        this.estado = estado; 
    }
    
    public String getObservaciones() { 
        return observaciones; 
    }
    
    public void setObservaciones(String observaciones) { 
        this.observaciones = observaciones; 
    }
}

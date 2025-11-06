package rutaslogisticas.Request;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public class CreatePedidoRequest {
    private Long clienteId;
    private Long direccionId;
    private LocalDate fechaProgramada;
    private LocalTime ventanaInicio;
    private LocalTime ventanaFin;
    private BigDecimal volumen = BigDecimal.ZERO;
    private BigDecimal peso = BigDecimal.ZERO;

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
}
package rutaslogisticas.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "vehiculos")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Vehiculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "placa", nullable = false, unique = true, length = 20)
    private String placa;
    
    @Column(name = "modelo", length = 80)
    private String modelo;
    
    @Column(name = "capacidad_volumen", precision = 10, scale = 2)
    private BigDecimal capacidadVolumen = BigDecimal.ZERO;
    
    @Column(name = "capacidad_peso", precision = 10, scale = 2)
    private BigDecimal capacidadPeso = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoVehiculo estado = EstadoVehiculo.ACTIVO;
    
    @Column(name = "notas", length = 255)
    private String notas;
    
    public enum EstadoVehiculo {
        ACTIVO, INACTIVO, MANTENIMIENTO
    }
    
    // Constructores
    public Vehiculo() {}
    
    public Vehiculo(String placa, String modelo) {
        this.placa = placa;
        this.modelo = modelo;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getPlaca() { return placa; }
    public void setPlaca(String placa) { this.placa = placa; }
    
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    
    public BigDecimal getCapacidadVolumen() { return capacidadVolumen; }
    public void setCapacidadVolumen(BigDecimal capacidadVolumen) { this.capacidadVolumen = capacidadVolumen; }
    
    public BigDecimal getCapacidadPeso() { return capacidadPeso; }
    public void setCapacidadPeso(BigDecimal capacidadPeso) { this.capacidadPeso = capacidadPeso; }
    
    public EstadoVehiculo getEstado() { return estado; }
    public void setEstado(EstadoVehiculo estado) { this.estado = estado; }
    
    public String getNotas() { return notas; }
    public void setNotas(String notas) { this.notas = notas; }
}

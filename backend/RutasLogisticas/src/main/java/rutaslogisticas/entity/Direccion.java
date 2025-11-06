package rutaslogisticas.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "direcciones")
public class Direccion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cliente_id", nullable = false)
    private Cliente cliente;
    
    @Column(name = "etiqueta", length = 80)
    private String etiqueta;
    
    @Column(name = "direccion", nullable = false, length = 200)
    private String direccion;
    
    @Column(name = "ciudad", nullable = false, length = 80)
    private String ciudad;
    
    @Column(name = "departamento", length = 80)
    private String departamento;
    
    @Column(name = "pais", nullable = false, length = 80)
    private String pais = "Colombia";
    
    @Column(name = "codigo_postal", length = 20)
    private String codigoPostal;
    
    @Column(name = "lat", precision = 10, scale = 7)
    private BigDecimal lat;
    
    @Column(name = "lng", precision = 10, scale = 7)
    private BigDecimal lng;
    
    @Column(name = "verificada", nullable = false)
    private Boolean verificada = false;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "precision_geocod")
    private PrecisionGeocodificacion precisionGeocodificacion;
    
    public enum PrecisionGeocodificacion {
        ALTA, MEDIA, BAJA
    }
    
    // Constructores
    public Direccion() {}
    
    public Direccion(Cliente cliente, String direccion, String ciudad) {
        this.cliente = cliente;
        this.direccion = direccion;
        this.ciudad = ciudad;
    }
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Cliente getCliente() { return cliente; }
    public void setCliente(Cliente cliente) { this.cliente = cliente; }
    
    public String getEtiqueta() { return etiqueta; }
    public void setEtiqueta(String etiqueta) { this.etiqueta = etiqueta; }
    
    public String getDireccion() { return direccion; }
    public void setDireccion(String direccion) { this.direccion = direccion; }
    
    public String getCiudad() { return ciudad; }
    public void setCiudad(String ciudad) { this.ciudad = ciudad; }
    
    public String getDepartamento() { return departamento; }
    public void setDepartamento(String departamento) { this.departamento = departamento; }
    
    public String getPais() { return pais; }
    public void setPais(String pais) { this.pais = pais; }
    
    public String getCodigoPostal() { return codigoPostal; }
    public void setCodigoPostal(String codigoPostal) { this.codigoPostal = codigoPostal; }
    
    public BigDecimal getLat() { return lat; }
    public void setLat(BigDecimal lat) { this.lat = lat; }
    
    public BigDecimal getLng() { return lng; }
    public void setLng(BigDecimal lng) { this.lng = lng; }
    
    public Boolean getVerificada() { return verificada; }
    public void setVerificada(Boolean verificada) { this.verificada = verificada; }
    
    public PrecisionGeocodificacion getPrecisionGeocodificacion() { return precisionGeocodificacion; }
    public void setPrecisionGeocodificacion(PrecisionGeocodificacion precisionGeocodificacion) { 
        this.precisionGeocodificacion = precisionGeocodificacion; 
    }
}

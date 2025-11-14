package rutaslogisticas.View;

import rutaslogisticas.entity.Direccion;
import java.math.BigDecimal;

public class DireccionView {
    private Long id;
    private Long clienteId;
    private String etiqueta;
    private String direccion;
    private String ciudad;
    private String departamento;
    private String pais;
    private String codigoPostal;
    private BigDecimal lat;
    private BigDecimal lng;
    private Boolean verificada;
    private String precisionGeocodificacion;

    public DireccionView(Direccion direccion) {
        this.id = direccion.getId();
        this.clienteId = direccion.getClienteId(); // Usar el campo directo en lugar de la relación
        this.etiqueta = direccion.getEtiqueta();
        this.direccion = direccion.getDireccion();
        this.ciudad = direccion.getCiudad();
        this.departamento = direccion.getDepartamento();
        this.pais = direccion.getPais();
        this.codigoPostal = direccion.getCodigoPostal();
        this.lat = direccion.getLat();
        this.lng = direccion.getLng();
        this.verificada = direccion.getVerificada();
        this.precisionGeocodificacion = direccion.getPrecisionGeocodificacion() != null 
            ? direccion.getPrecisionGeocodificacion().name() 
            : null;
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }

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

    public String getPrecisionGeocodificacion() { return precisionGeocodificacion; }
    public void setPrecisionGeocodificacion(String precisionGeocodificacion) { 
        this.precisionGeocodificacion = precisionGeocodificacion; 
    }
}

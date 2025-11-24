package rutaslogisticas.View;

import rutaslogisticas.entity.Cliente;
import rutaslogisticas.dto.DireccionDTO;
import java.util.List;
import java.util.stream.Collectors;

public class ClienteView {
    private Long id;
    private String nombre;
    private String nit;
    private String correoContacto;
    private String telefonoContacto;
    private List<DireccionDTO> direcciones;

    public ClienteView(Cliente cliente) {
        this.id = cliente.getId();
        this.nombre = cliente.getNombre();
        this.nit = cliente.getNit();
        this.correoContacto = cliente.getCorreoContacto();
        this.telefonoContacto = cliente.getTelefonoContacto();
        if (cliente.getDirecciones() != null) {
            this.direcciones = cliente.getDirecciones().stream()
                .map(dir -> {
                    DireccionDTO dto = new DireccionDTO();
                    dto.setId(dir.getId());
                    dto.setClienteId(dir.getClienteId());
                    dto.setEtiqueta(dir.getEtiqueta());
                    dto.setDireccion(dir.getDireccion());
                    dto.setCiudad(dir.getCiudad());
                    dto.setDepartamento(dir.getDepartamento());
                    dto.setPais(dir.getPais());
                    dto.setCodigoPostal(dir.getCodigoPostal());
                    dto.setLat(dir.getLat());
                    dto.setLng(dir.getLng());
                    dto.setVerificada(dir.getVerificada());
                    if (dir.getPrecisionGeocodificacion() != null) {
                        dto.setPrecisionGeocodificacion(dir.getPrecisionGeocodificacion().name());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
        }
    }

    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }

    public String getNit() { return nit; }
    public void setNit(String nit) { this.nit = nit; }

    public String getCorreoContacto() { return correoContacto; }
    public void setCorreoContacto(String correoContacto) { this.correoContacto = correoContacto; }

    public String getTelefonoContacto() { return telefonoContacto; }
    public void setTelefonoContacto(String telefonoContacto) { this.telefonoContacto = telefonoContacto; }

    public List<DireccionDTO> getDirecciones() { return direcciones; }
    public void setDirecciones(List<DireccionDTO> direcciones) { this.direcciones = direcciones; }
}

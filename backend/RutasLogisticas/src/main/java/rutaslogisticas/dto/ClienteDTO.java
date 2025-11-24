package rutaslogisticas.dto;

import java.util.List;

public class ClienteDTO {
    private Long id;
    private String nombre;
    private String nit;
    private String correoContacto;
    private String telefonoContacto;
    private List<DireccionDTO> direcciones;

    // Constructors
    public ClienteDTO() {}

    public ClienteDTO(Long id, String nombre, String nit, String correoContacto, String telefonoContacto) {
        this.id = id;
        this.nombre = nombre;
        this.nit = nit;
        this.correoContacto = correoContacto;
        this.telefonoContacto = telefonoContacto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getNit() {
        return nit;
    }

    public void setNit(String nit) {
        this.nit = nit;
    }

    public String getCorreoContacto() {
        return correoContacto;
    }

    public void setCorreoContacto(String correoContacto) {
        this.correoContacto = correoContacto;
    }

    public String getTelefonoContacto() {
        return telefonoContacto;
    }

    public void setTelefonoContacto(String telefonoContacto) {
        this.telefonoContacto = telefonoContacto;
    }

    public List<DireccionDTO> getDirecciones() {
        return direcciones;
    }

    public void setDirecciones(List<DireccionDTO> direcciones) {
        this.direcciones = direcciones;
    }
}

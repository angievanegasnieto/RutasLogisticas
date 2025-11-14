package rutaslogisticas.View;

import rutaslogisticas.entity.Cliente;

public class ClienteView {
    private Long id;
    private String nombre;
    private String nit;
    private String correoContacto;
    private String telefonoContacto;

    public ClienteView(Cliente cliente) {
        this.id = cliente.getId();
        this.nombre = cliente.getNombre();
        this.nit = cliente.getNit();
        this.correoContacto = cliente.getCorreoContacto();
        this.telefonoContacto = cliente.getTelefonoContacto();
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
}

package rutaslogisticas.admin;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import rutaslogisticas.entity.Role;

public class UserUpsertRequest {

    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    // En crear es obligatorio, en editar puede ir vacío para no cambiarla
    private String password;

    // ADMIN | OPERADOR | CONDUCTOR (puede venir null y definimos un default)
    private Role role;

    // getters/setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}

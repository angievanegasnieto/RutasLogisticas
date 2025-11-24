package rutaslogisticas.Register;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import rutaslogisticas.entity.Role;

public class RegisterRequest {
  @NotBlank
  private String name;

  @Email @NotBlank
  private String email;

  @NotBlank
  private String password;

  private Role role; // puede venir null
  
  // Campos adicionales para CONDUCTOR
  private String licencia;
  private String telefono;

  // getters/setters
  public String getName() { return name; }
  public void setName(String name) { this.name = name; }

  public String getEmail() { return email; }
  public void setEmail(String email) { this.email = email; }

  public String getPassword() { return password; }
  public void setPassword(String password) { this.password = password; }

  public Role getRole() { return role; }
  public void setRole(Role role) { this.role = role; }
  
  public String getLicencia() { return licencia; }
  public void setLicencia(String licencia) { this.licencia = licencia; }
  
  public String getTelefono() { return telefono; }
  public void setTelefono(String telefono) { this.telefono = telefono; }
}


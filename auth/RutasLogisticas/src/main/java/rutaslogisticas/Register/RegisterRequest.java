/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.Register;

/**
 *
 * @author johan
 */


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class RegisterRequest {
  @NotBlank public String name;
  @Email @NotBlank public String email;
  @NotBlank public String password;
  public String role; // opcional, por defecto USER
}

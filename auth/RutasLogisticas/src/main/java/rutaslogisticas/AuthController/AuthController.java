/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.AuthController;

/**
 *
 * @author johan
 */



import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.Auth.AuthResponse;
import rutaslogisticas.AuthService.AuthService;
import rutaslogisticas.Login.LoginRequest;
import rutaslogisticas.Register.RegisterRequest;
import rutaslogisticas.ResetPassword.ResetPasswordRequest;
import rutaslogisticas.View.UserView;
import rutaslogisticas.entity.User;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

  private final AuthenticationManager authManager;
  private final AuthService authService;

  public AuthController(AuthenticationManager am, AuthService as) {
    this.authManager = am; this.authService = as;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest reg) {
    try {
      User u = authService.register(reg);
      String token = authService.createToken(u);
      return ResponseEntity.status(201).body(new AuthResponse(
        new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name()), token));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(409).body(Map.of("error", e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(500).body(Map.of("error", "Error al crear la cuenta: " + e.getMessage()));
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    try {
      Authentication auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email, req.password)
      );
      User u = authService.getByEmail(auth.getName());
      
      // Verificar si el usuario está habilitado
      if (u.getEnabled() == null || !u.getEnabled()) {
        return ResponseEntity.status(403).body("Usuario deshabilitado. Contacta al administrador.");
      }
      
      String token = authService.createToken(u);
      return ResponseEntity.ok(new AuthResponse(
        new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name()), token));
    } catch (BadCredentialsException e) {
      return ResponseEntity.status(401).body("Credenciales incorrectas");
    }
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(Authentication authentication) {
    if (authentication == null) return ResponseEntity.status(401).build();
    User u = authService.getByEmail(authentication.getName());
    return ResponseEntity.ok(new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole().name()));
  }

  @PostMapping("/reset-password")
  public ResponseEntity<?> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
    try {
      authService.resetPassword(req.getEmail(), req.getNewPassword());
      return ResponseEntity.ok().body("Contraseña actualizada exitosamente");
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(404).body(e.getMessage());
    } catch (Exception e) {
      return ResponseEntity.status(500).body("Error al restablecer la contraseña");
    }
  }
}

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
import rutaslogisticas.View.UserView;
import rutaslogisticas.entity.User;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // para Angular en dev
public class AuthController {

  private final AuthenticationManager authManager;
  private final AuthService authService;

  public AuthController(AuthenticationManager am, AuthService as) {
    this.authManager = am; this.authService = as;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
    try {
      User u = authService.register(req.name, req.email, req.password, req.role);
      String token = authService.createToken(u);
      return ResponseEntity.status(201).body(new AuthResponse(
        new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole()), token));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(409).body(e.getMessage());
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    Authentication auth = authManager.authenticate(
      new UsernamePasswordAuthenticationToken(req.email, req.password)
    );
    User u = authService.getByEmail(auth.getName());
    String token = authService.createToken(u);
    return ResponseEntity.ok(new AuthResponse(
      new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole()), token));
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(Authentication authentication) {
    if (authentication == null) return ResponseEntity.status(401).build();
    User u = authService.getByEmail(authentication.getName());
    return ResponseEntity.ok(new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole()));
  }
}

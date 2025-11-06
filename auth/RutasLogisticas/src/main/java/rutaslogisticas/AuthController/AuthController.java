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
import org.springframework.security.access.prepost.PreAuthorize;
import rutaslogisticas.Auth.AuthResponse;
import rutaslogisticas.AuthService.AuthService;
import rutaslogisticas.Login.LoginRequest;
import rutaslogisticas.Register.RegisterRequest;
import rutaslogisticas.View.UserView;
import rutaslogisticas.entity.User;
import rutaslogisticas.Repository.UserRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.password.PasswordEncoder;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*") // para Angular en dev
public class AuthController {

  private final AuthenticationManager authManager;
  private final AuthService authService;
  private final UserRepository userRepo;
  private final PasswordEncoder encoder;

  public AuthController(AuthenticationManager am, AuthService as, UserRepository ur, PasswordEncoder encoder) {
    this.authManager = am; this.authService = as; this.userRepo = ur; this.encoder = encoder;
  }

  @PostMapping("/register")
  public ResponseEntity<?> register(Authentication authentication, @Valid @RequestBody RegisterRequest req) {
    // Permitir registrar si no hay usuarios aún (bootstrap). Si ya hay usuarios, solo ADMIN puede crear.
    long count = userRepo.count();
    boolean isAdmin = authentication != null && authentication.getAuthorities().stream().map(GrantedAuthority::getAuthority).anyMatch(a -> a.equals("ROLE_ADMIN"));
    if (count > 0 && !isAdmin) {
      return ResponseEntity.status(403).body("Solo un administrador puede crear cuentas");
    }
    try {
      User u = authService.register(req.name, req.email, req.password, req.role);
      String token = authService.createToken(u);
      return ResponseEntity.status(201).body(new AuthResponse(
        new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl()), token));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(409).body(e.getMessage());
    }
  }

  @PostMapping("/login")
  public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
    try {
      Authentication auth = authManager.authenticate(
        new UsernamePasswordAuthenticationToken(req.email, req.password)
      );
      User u = authService.getByEmail(auth.getName());
      String token = authService.createToken(u);
      return ResponseEntity.ok(new AuthResponse(
        new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl()), token));
    } catch (org.springframework.security.core.AuthenticationException ex) {
      return ResponseEntity.status(401).body("Bad credentials");
    }
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(Authentication authentication) {
    if (authentication == null) return ResponseEntity.status(401).build();
    User u = authService.getByEmail(authentication.getName());
    return ResponseEntity.ok(new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl()));
  }

  @GetMapping("/users")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> listUsers() {
    var users = authService.listUsers();
    return ResponseEntity.ok(users.stream().map(u -> new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl())).toList());
  }

  // Temporary public debug endpoint to verify DB connectivity from frontend.
  // NOTE: This is intentionally unprotected and should be removed in production.
  @GetMapping("/users/debug")
  public ResponseEntity<?> listUsersDebug() {
    var users = authService.listUsers();
    return ResponseEntity.ok(users.stream().map(u -> new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl())).toList());
  }

  @PutMapping("/users/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> updateUser(@PathVariable Long id, @RequestBody rutaslogisticas.View.UpdateUserRequest req) {
    try {
      User u = authService.updateUser(id, req);
      return ResponseEntity.ok(new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl()));
    } catch (IllegalArgumentException e) {
      return ResponseEntity.status(400).body(e.getMessage());
    }
  }

  @DeleteMapping("/users/{id}")
  @PreAuthorize("hasRole('ADMIN')")
  public ResponseEntity<?> deleteUser(@PathVariable Long id) {
    authService.deleteById(id);
    return ResponseEntity.noContent().build();
  }

  // DEV ONLY: Promote a user to ADMIN by email (no auth). Remove in production.
  @PostMapping("/dev/users/promote")
  public ResponseEntity<?> promote(@RequestParam String email) {
    User u = authService.promoteToAdmin(email);
    return ResponseEntity.ok(new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl()));
  }

  // DEV ONLY: Reset user password (no auth). Remove/secure for production.
  @PostMapping("/dev/users/set-password")
  public ResponseEntity<?> devSetPassword(@RequestParam String email, @RequestParam String password) {
    User u = authService.setPassword(email, password);
    return ResponseEntity.ok(new UserView(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getCreatedAt().toString(), u.getAvatarUrl()));
  }

  // DEV ONLY: Generate BCrypt hash for a raw password to set it manually via SQL
  @GetMapping("/dev/bcrypt")
  public ResponseEntity<String> devBcrypt(@RequestParam String password) {
    return ResponseEntity.ok(encoder.encode(password));
  }
}

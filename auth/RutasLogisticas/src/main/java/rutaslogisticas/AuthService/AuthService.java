/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.AuthService;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rutaslogisticas.JwtUtil.JwtUtil;
import rutaslogisticas.Repository.UserRepository;
import rutaslogisticas.entity.User;
import java.util.List;

@Service
public class AuthService {
  private final UserRepository repo;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;

  public AuthService(UserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
    this.repo = repo; this.encoder = encoder; this.jwt = jwt;
  }

  public User register(String name, String email, String rawPassword, String role) {
    if (repo.existsByEmail(email)) throw new IllegalArgumentException("Email ya registrado");
    User u = new User();
    u.setName(name);
    u.setEmail(email);
    u.setPassword(encoder.encode(rawPassword));
    u.setRole(role == null || role.isBlank() ? "USER" : role);
    return repo.save(u);
  }

  public String createToken(User u) {
    return jwt.generateToken(u.getEmail(), u.getRole());
  }

  public User getByEmail(String email) {
    return repo.findByEmail(email).orElseThrow();
  }

  // Admin operations
  public List<User> listUsers() {
    return repo.findAll();
  }

  public void deleteById(Long id) {
    repo.deleteById(id);
  }

  public User updateUser(Long id, rutaslogisticas.View.UpdateUserRequest req) {
    User u = repo.findById(id).orElseThrow();
    if (req.name != null && !req.name.isBlank()) u.setName(req.name);
    if (req.email != null && !req.email.isBlank()) {
      if (!req.email.equalsIgnoreCase(u.getEmail()) && repo.existsByEmail(req.email)) {
        throw new IllegalArgumentException("Email ya registrado");
      }
      u.setEmail(req.email);
    }
    if (req.role != null && !req.role.isBlank()) u.setRole(req.role);
    if (req.avatarUrl != null) u.setAvatarUrl(req.avatarUrl);
    return repo.save(u);
  }

  public User promoteToAdmin(String email) {
    User u = getByEmail(email);
    u.setRole("ADMIN");
    return repo.save(u);
  }

  // DEV-ONLY helper to reset password quickly during bootstrap/testing
  public User setPassword(String email, String rawPassword) {
    User u = getByEmail(email);
    u.setPassword(encoder.encode(rawPassword));
    return repo.save(u);
  }
}



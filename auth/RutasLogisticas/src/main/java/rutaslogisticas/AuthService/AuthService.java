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
}



/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.AuthService;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rutaslogisticas.JwtUtil.JwtUtil;
import rutaslogisticas.Register.RegisterRequest;
import rutaslogisticas.Repository.UserRepository;
import rutaslogisticas.entity.Role;
import rutaslogisticas.entity.User;

@Service
public class AuthService {
  private final UserRepository repo;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;

  public AuthService(UserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
    this.repo = repo; this.encoder = encoder; this.jwt = jwt;
  }

  public User register(RegisterRequest req) {
        if (repo.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email ya registrado");
        }

        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setRole(req.getRole() != null ? req.getRole() : Role.OPERADOR);
    return repo.save(u);
  }

  public String createToken(User u) {
    return jwt.generateToken(u.getEmail(), u.getRole().name());
  }

  public User getByEmail(String email) {
    return repo.findByEmail(email).orElseThrow();
  }
}



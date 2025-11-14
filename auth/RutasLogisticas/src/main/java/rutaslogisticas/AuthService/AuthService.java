/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package rutaslogisticas.AuthService;



import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import rutaslogisticas.JwtUtil.JwtUtil;
import rutaslogisticas.Register.RegisterRequest;
import rutaslogisticas.Repository.UserRepository;
import rutaslogisticas.entity.Role;
import rutaslogisticas.entity.User;
import java.util.HashMap;
import java.util.Map;

@Service
public class AuthService {
  private final UserRepository repo;
  private final PasswordEncoder encoder;
  private final JwtUtil jwt;
  private final RestTemplate restTemplate;

  public AuthService(UserRepository repo, PasswordEncoder encoder, JwtUtil jwt) {
    this.repo = repo; 
    this.encoder = encoder; 
    this.jwt = jwt;
    this.restTemplate = new RestTemplate();
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
        
        User savedUser = repo.save(u);
        
        // Si el rol es CONDUCTOR, crear registro en la tabla conductores
        if (savedUser.getRole() == Role.CONDUCTOR) {
            try {
                crearConductorVinculado(savedUser.getId(), req.getName(), req.getLicencia(), req.getTelefono());
            } catch (Exception e) {
                // Si falla la creación del conductor, revertir el usuario
                repo.delete(savedUser);
                throw new IllegalArgumentException("Error al crear conductor: " + e.getMessage());
            }
        }
        
        return savedUser;
  }

  public String createToken(User u) {
    return jwt.generateToken(u.getEmail(), u.getRole().name());
  }

  public User getByEmail(String email) {
    return repo.findByEmail(email).orElseThrow();
  }

  /**
   * Restablece la contraseña de un usuario
   * @param email Email del usuario
   * @param newPassword Nueva contraseña (sin encriptar)
   * @return Usuario actualizado
   * @throws IllegalArgumentException si el usuario no existe
   */
  public User resetPassword(String email, String newPassword) {
    User user = repo.findByEmail(email)
        .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
    
    // Encriptar la nueva contraseña
    user.setPassword(encoder.encode(newPassword));
    
    return repo.save(user);
  }
  
  /**
   * Crea un conductor vinculado a un usuario en el microservicio de backend
   */
  private void crearConductorVinculado(Long userId, String nombre, String licencia, String telefono) {
    String url = "http://localhost:8080/api/conductores/vincular-usuario";
    
    HttpHeaders headers = new HttpHeaders();
    headers.setContentType(MediaType.APPLICATION_JSON);
    
    Map<String, Object> body = new HashMap<>();
    body.put("userId", userId);
    body.put("nombreCompleto", nombre);
    body.put("licencia", licencia);
    body.put("telefono", telefono);
    
    HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);
    
    restTemplate.postForEntity(url, request, Map.class);
  }
}





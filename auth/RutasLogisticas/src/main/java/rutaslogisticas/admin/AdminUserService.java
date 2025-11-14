package rutaslogisticas.admin;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import rutaslogisticas.Repository.UserRepository;
import rutaslogisticas.entity.Role;
import rutaslogisticas.entity.User;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;
    private final RestTemplate restTemplate;
    
    @Value("${backend.url:http://localhost:8081}")
    private String backendUrl;

    public AdminUserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
        this.restTemplate = new RestTemplate();
    }

    public List<UserListItem> list() {
        return repo.findAll()
                .stream()
                .map(u -> new UserListItem(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getEnabled()))
                .toList();
    }

    public UserListItem create(UserUpsertRequest req) {
        if (repo.existsByEmail(req.getEmail()))
            throw new IllegalArgumentException("El correo ya está registrado");

        User u = new User();
        u.setName(req.getName());
        u.setEmail(req.getEmail());
        u.setPassword(encoder.encode(req.getPassword()));
        u.setRole(req.getRole() != null ? req.getRole() : Role.OPERADOR);
        u.setEnabled(req.getEnabled() != null ? req.getEnabled() : true);

        u = repo.save(u);
        return new UserListItem(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getEnabled());
    }

    public UserListItem update(Long id, UserUpsertRequest req) {
        User u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no existe"));

        if (repo.existsByEmailAndIdNot(req.getEmail(), id))
            throw new IllegalArgumentException("El correo ya está registrado");

        u.setName(req.getName());
        u.setEmail(req.getEmail());
        if (req.getPassword() != null && !req.getPassword().isBlank()) {
            u.setPassword(encoder.encode(req.getPassword()));
        }
        if (req.getRole() != null) {
            u.setRole(req.getRole());
        }
        if (req.getEnabled() != null) {
            u.setEnabled(req.getEnabled());
        }

        u = repo.save(u);
        return new UserListItem(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getEnabled());
    }

    public void delete(Long id) {
        User u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no existe"));
        
        // Desactivar el usuario en lugar de eliminarlo
        // El conductor mantiene su estado ACTIVO en la tabla conductores
        u.setEnabled(false);
        repo.save(u);
        System.out.println("Usuario desactivado: " + id);
    }

    /**
     * Restablece la contraseña de un usuario específico
     * @param id ID del usuario
     * @param newPassword Nueva contraseña (sin encriptar)
     */
    public void resetPassword(Long id, String newPassword) {
        User u = repo.findById(id).orElseThrow(() -> new IllegalArgumentException("Usuario no existe"));
        u.setPassword(encoder.encode(newPassword));
        repo.save(u);
    }
}

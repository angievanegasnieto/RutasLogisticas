package rutaslogisticas.admin;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import rutaslogisticas.Repository.UserRepository;
import rutaslogisticas.entity.Role;
import rutaslogisticas.entity.User;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository repo;
    private final PasswordEncoder encoder;

    public AdminUserService(UserRepository repo, PasswordEncoder encoder) {
        this.repo = repo;
        this.encoder = encoder;
    }

    public List<UserListItem> list() {
        return repo.findAll()
                .stream()
                .map(u -> new UserListItem(u.getId(), u.getName(), u.getEmail(), u.getRole()))
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

        u = repo.save(u);
        return new UserListItem(u.getId(), u.getName(), u.getEmail(), u.getRole());
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

        u = repo.save(u);
        return new UserListItem(u.getId(), u.getName(), u.getEmail(), u.getRole());
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) throw new IllegalArgumentException("Usuario no existe");
        repo.deleteById(id);
    }
}

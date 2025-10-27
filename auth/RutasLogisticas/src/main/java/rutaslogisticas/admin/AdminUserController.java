package rutaslogisticas.admin;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/admin/users")
public class AdminUserController {

    private final AdminUserService service;

    public AdminUserController(AdminUserService service) {
        this.service = service;
    }

    // LISTAR (tabla)
    @GetMapping
    public List<UserListItem> list() {
        return service.list();
    }

    // CREAR
    @PostMapping
    public ResponseEntity<UserListItem> create(@Valid @RequestBody UserUpsertRequest req) {
        return ResponseEntity.status(201).body(service.create(req));
    }

    // EDITAR
    @PutMapping("/{id}")
    public UserListItem update(@PathVariable Long id, @Valid @RequestBody UserUpsertRequest req) {
        return service.update(id, req);
    }

    // ELIMINAR
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}

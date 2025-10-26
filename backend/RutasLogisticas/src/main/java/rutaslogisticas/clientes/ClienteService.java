package rutaslogisticas.clientes;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ClienteService {
    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    public List<Cliente> listar() { return repository.findAll(); }
    public Cliente guardar(Cliente c) { return repository.save(c); }
    public void eliminar(Long id) { repository.deleteById(id); }
}

package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.repository.ClienteRepository;
import rutaslogisticas.entity.Cliente;
import rutaslogisticas.View.ClienteView;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:4200")
public class ClientesController {

    @Autowired
    private ClienteRepository clienteRepository;

    @GetMapping
    public ResponseEntity<List<ClienteView>> obtenerTodos() {
        List<ClienteView> clientes = clienteRepository.findAll()
                .stream()
                .map(ClienteView::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(clientes);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ClienteView> obtenerPorId(@PathVariable Long id) {
        return clienteRepository.findById(id)
                .map(ClienteView::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}

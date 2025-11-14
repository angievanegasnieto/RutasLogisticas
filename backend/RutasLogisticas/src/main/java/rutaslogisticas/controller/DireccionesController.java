package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.repository.DireccionRepository;
import rutaslogisticas.entity.Direccion;
import rutaslogisticas.View.DireccionView;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/direcciones")
@CrossOrigin(origins = "http://localhost:4200")
public class DireccionesController {

    @Autowired
    private DireccionRepository direccionRepository;

    @GetMapping
    public ResponseEntity<List<DireccionView>> obtenerTodas() {
        List<DireccionView> direcciones = direccionRepository.findAll()
                .stream()
                .map(DireccionView::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(direcciones);
    }

    @GetMapping("/{id}")
    public ResponseEntity<DireccionView> obtenerPorId(@PathVariable Long id) {
        return direccionRepository.findById(id)
                .map(DireccionView::new)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<DireccionView>> obtenerPorClienteId(@PathVariable Long clienteId) {
        List<DireccionView> direcciones = direccionRepository.findByClienteId(clienteId)
                .stream()
                .map(DireccionView::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(direcciones);
    }
}

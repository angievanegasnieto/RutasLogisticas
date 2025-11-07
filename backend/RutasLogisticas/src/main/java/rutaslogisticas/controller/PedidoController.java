package rutaslogisticas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.model.Pedido;
import rutaslogisticas.service.PedidoService;

import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
@CrossOrigin(origins = "*")
public class PedidoController {

    private final PedidoService pedidoService;

    public PedidoController(PedidoService pedidoService) {
        this.pedidoService = pedidoService;
    }

    @GetMapping
    public List<Pedido> listar() {
        return pedidoService.listar();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pedido> buscarPorId(@PathVariable Long id) {
        Pedido pedido = pedidoService.buscarPorId(id);
        return (pedido != null) ? ResponseEntity.ok(pedido) : ResponseEntity.notFound().build();
    }

    @PostMapping
    public ResponseEntity<?> crear(@RequestBody Pedido pedido) {
        // Validación mínima para texto
        if (pedido.getCliente() == null || pedido.getCliente().isBlank()
                || pedido.getDireccion() == null || pedido.getDireccion().isBlank()
                || pedido.getProducto() == null || pedido.getProducto().isBlank()
                || pedido.getFechaProgramada() == null) {
            return ResponseEntity.badRequest().body("cliente, direccion, producto y fechaProgramada son obligatorios");
        }
        return ResponseEntity.ok(pedidoService.guardar(pedido));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> actualizar(@PathVariable Long id, @RequestBody Pedido pedido) {
        Pedido existente = pedidoService.buscarPorId(id);
        if (existente == null) return ResponseEntity.notFound().build();

        pedido.setId(id);
        return ResponseEntity.ok(pedidoService.guardar(pedido));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        pedidoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}


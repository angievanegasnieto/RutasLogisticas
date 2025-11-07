package rutaslogisticas.service;

import org.springframework.stereotype.Service;
import rutaslogisticas.model.Pedido;
import rutaslogisticas.repository.PedidoRepository;
import java.util.List;

@Service
public class PedidoService {

    private final PedidoRepository pedidoRepository;

    public PedidoService(PedidoRepository pedidoRepository) {
        this.pedidoRepository = pedidoRepository;
    }

    public List<Pedido> listar() {
        return pedidoRepository.findAll();
    }

    public Pedido guardar(Pedido pedido) {
        return pedidoRepository.save(pedido);
    }

    public Pedido buscarPorId(Long id) {
        return pedidoRepository.findById(id).orElse(null);
    }

    public void eliminar(Long id) {
        pedidoRepository.deleteById(id);
    }
}

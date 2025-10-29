import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import rutaslogisticas.entity.Cliente;
import rutaslogisticas.repository.ClienteRepository;

@Service
public class ClienteService {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private GeoService geoService;

    public List<Cliente> listarTodos() {
        return clienteRepository.findAll();
    }

    // Nuevo método para ordenar por distancia a la bodega
    public List<Cliente> listarOrdenadosPorDistancia() {
        List<Cliente> clientes = clienteRepository.findAll();
        return clientes.stream()
                .sorted(Comparator.comparingDouble(
                        c -> geoService.distanciaDesdeBodega(c.getDireccion())))
                .collect(Collectors.toList());
    }

    public Cliente crearCliente(Cliente cliente) {
        return clienteRepository.save(cliente);
    }

    public void eliminarCliente(Long id) {
        clienteRepository.deleteById(id);
    }
}

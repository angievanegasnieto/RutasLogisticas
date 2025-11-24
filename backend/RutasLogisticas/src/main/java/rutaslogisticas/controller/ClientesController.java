package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.repository.ClienteRepository;
import rutaslogisticas.repository.DireccionRepository;
import rutaslogisticas.entity.Cliente;
import rutaslogisticas.entity.Direccion;
import rutaslogisticas.View.ClienteView;
import rutaslogisticas.dto.ClienteDTO;
import rutaslogisticas.dto.DireccionDTO;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/clientes")
@CrossOrigin(origins = "http://localhost:4200")
public class ClientesController {

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private DireccionRepository direccionRepository;

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

    @PostMapping
    public ResponseEntity<ClienteView> crear(@RequestBody ClienteDTO clienteDTO) {
        try {
            Cliente cliente = new Cliente();
            cliente.setNombre(clienteDTO.getNombre());
            cliente.setNit(clienteDTO.getNit());
            cliente.setCorreoContacto(clienteDTO.getCorreoContacto());
            cliente.setTelefonoContacto(clienteDTO.getTelefonoContacto());

            Cliente clienteGuardado = clienteRepository.save(cliente);

            if (clienteDTO.getDirecciones() != null) {
                for (DireccionDTO dirDTO : clienteDTO.getDirecciones()) {
                    Direccion direccion = convertirADireccion(dirDTO);
                    direccion.setClienteId(clienteGuardado.getId());
                    direccionRepository.save(direccion);
                }
            }

            ClienteView resultado = new ClienteView(clienteRepository.findById(clienteGuardado.getId()).get());
            return ResponseEntity.status(HttpStatus.CREATED).body(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ClienteView> actualizar(@PathVariable Long id, @RequestBody ClienteDTO clienteDTO) {
        return clienteRepository.findById(id)
                .map(cliente -> {
                    cliente.setNombre(clienteDTO.getNombre());
                    cliente.setNit(clienteDTO.getNit());
                    cliente.setCorreoContacto(clienteDTO.getCorreoContacto());
                    cliente.setTelefonoContacto(clienteDTO.getTelefonoContacto());
                    
                    clienteRepository.save(cliente);
                    
                    // Actualizar direcciones: solo eliminar las que no tienen pedidos asociados
                    List<Direccion> direccionesActuales = direccionRepository.findByClienteId(id);
                    for (Direccion dir : direccionesActuales) {
                        try {
                            direccionRepository.deleteById(dir.getId());
                        } catch (Exception e) {
                            // Si tiene pedidos asociados, no la eliminamos
                        }
                    }
                    
                    // Agregar las nuevas direcciones
                    if (clienteDTO.getDirecciones() != null) {
                        for (DireccionDTO dirDTO : clienteDTO.getDirecciones()) {
                            Direccion direccion = convertirADireccion(dirDTO);
                            direccion.setClienteId(id);
                            direccionRepository.save(direccion);
                        }
                    }
                    
                    return ResponseEntity.ok(new ClienteView(clienteRepository.findById(id).get()));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!clienteRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        
        try {
            // No eliminamos las direcciones si tienen pedidos asociados
            // Solo eliminamos el cliente
            clienteRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            // Si hay error por relaciones, devolvemos un error descriptivo
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
    }

    private Direccion convertirADireccion(DireccionDTO dto) {
        Direccion direccion = new Direccion();
        direccion.setId(dto.getId());
        direccion.setEtiqueta(dto.getEtiqueta());
        direccion.setDireccion(dto.getDireccion());
        direccion.setCiudad(dto.getCiudad());
        direccion.setDepartamento(dto.getDepartamento());
        direccion.setPais(dto.getPais() != null ? dto.getPais() : "Colombia");
        direccion.setCodigoPostal(dto.getCodigoPostal());
        direccion.setLat(dto.getLat());
        direccion.setLng(dto.getLng());
        direccion.setVerificada(dto.getVerificada() != null ? dto.getVerificada() : false);
        if (dto.getPrecisionGeocodificacion() != null) {
            direccion.setPrecisionGeocodificacion(
                Direccion.PrecisionGeocodificacion.valueOf(dto.getPrecisionGeocodificacion())
            );
        }
        return direccion;
    }
}

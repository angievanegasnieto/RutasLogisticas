package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.Service.RutaService;
import rutaslogisticas.View.RutaView;
import rutaslogisticas.View.ParadaRutaView;
import rutaslogisticas.entity.ParadaRuta;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rutas")
@CrossOrigin(origins = "http://localhost:4200")
public class RutasController {

    @Autowired
    private RutaService rutaService;

    /**
     * 📋 Obtener todas las rutas
     */
    @GetMapping
    public ResponseEntity<List<RutaView>> obtenerTodasLasRutas() {
        List<RutaView> rutas = rutaService.obtenerTodasLasRutas();
        return ResponseEntity.ok(rutas);
    }

    /**
     * 📋 Obtener ruta por ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<RutaView> obtenerRutaPorId(@PathVariable Long id) {
        return rutaService.obtenerRutaPorId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * 📋 Obtener rutas de un conductor
     */
    @GetMapping("/conductor/{conductorId}")
    public ResponseEntity<List<RutaView>> obtenerRutasPorConductor(@PathVariable Long conductorId) {
        List<RutaView> rutas = rutaService.obtenerRutasPorConductor(conductorId);
        return ResponseEntity.ok(rutas);
    }

    /**
     * 📋 Obtener paradas de una ruta
     */
    @GetMapping("/{rutaId}/paradas")
    public ResponseEntity<List<ParadaRutaView>> obtenerParadasDeRuta(@PathVariable Long rutaId) {
        List<ParadaRutaView> paradas = rutaService.obtenerParadasDeRuta(rutaId);
        return ResponseEntity.ok(paradas);
    }

    /**
     * 🚀 INICIAR RUTA - Cambia estado a EN_PROGRESO
     */
    @PostMapping("/{rutaId}/iniciar")
    public ResponseEntity<RutaView> iniciarRuta(@PathVariable Long rutaId) {
        try {
            RutaView rutaActualizada = rutaService.iniciarRuta(rutaId);
            return ResponseEntity.ok(rutaActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 🏁 FINALIZAR RUTA - Cambia estado a COMPLETADA
     */
    @PostMapping("/{rutaId}/finalizar")
    public ResponseEntity<RutaView> finalizarRuta(@PathVariable Long rutaId) {
        try {
            RutaView rutaActualizada = rutaService.finalizarRuta(rutaId);
            return ResponseEntity.ok(rutaActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 📦 ACTUALIZAR ESTADO DE PARADA (pedido individual)
     * Estados: PENDIENTE, ENTREGADO, FALLIDO, REINTENTO
     */
    @PatchMapping("/paradas/{paradaId}/estado")
    public ResponseEntity<ParadaRutaView> actualizarEstadoParada(
            @PathVariable Long paradaId,
            @RequestBody Map<String, String> body) {
        try {
            String estadoStr = body.get("estado");
            String nota = body.getOrDefault("nota", "");
            
            ParadaRuta.EstadoParada nuevoEstado = ParadaRuta.EstadoParada.valueOf(estadoStr.toUpperCase());
            ParadaRutaView paradaActualizada = rutaService.actualizarEstadoParada(paradaId, nuevoEstado, nota);
            
            return ResponseEntity.ok(paradaActualizada);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

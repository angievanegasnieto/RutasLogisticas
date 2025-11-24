package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.Service.RutaOptimizacionService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/rutas-optimizadas")
@CrossOrigin(origins = "http://localhost:4200")
public class RutaOptimizacionController {

    @Autowired
    private RutaOptimizacionService rutaOptimizacionService;

    /**
     * 🗺️ GET /api/rutas/conductor/{conductorId}
     * Obtiene la ruta optimizada para un conductor específico
     */
    @GetMapping("/conductor/{conductorId}")
    public ResponseEntity<?> obtenerRutaConductor(@PathVariable Long conductorId) {
        try {
            RutaOptimizacionService.RutaOptimizadaDTO ruta = rutaOptimizacionService.obtenerRutaOptimizada(conductorId);
            
            if (!ruta.exitoso) {
                Map<String, Object> error = new HashMap<>();
                error.put("exitoso", false);
                error.put("error", ruta.error);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
            }

            return ResponseEntity.ok(ruta);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exitoso", false);
            error.put("error", "Error al calcular la ruta: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 🚗 GET /api/rutas/conductor/{conductorId}/detallada
     * Obtiene la ruta detallada con geometría de LocationIQ
     */
    @GetMapping("/conductor/{conductorId}/detallada")
    public ResponseEntity<?> obtenerRutaDetallada(@PathVariable Long conductorId) {
        try {
            Map<String, Object> ruta = rutaOptimizacionService.obtenerRutaDetallada(conductorId);
            
            if (ruta.containsKey("exitoso") && !(boolean) ruta.get("exitoso")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ruta);
            }

            return ResponseEntity.ok(ruta);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exitoso", false);
            error.put("error", "Error al obtener ruta detallada: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 📋 GET /api/rutas/resumen
     * Obtiene resumen de rutas para todos los conductores
     */
    @GetMapping("/resumen")
    public ResponseEntity<?> obtenerResumenRutas() {
        try {
            List<Map<String, Object>> resumen = rutaOptimizacionService.obtenerResumenRutasConductores();
            
            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("exitoso", true);
            respuesta.put("totalConductores", resumen.size());
            respuesta.put("conductores", resumen);

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exitoso", false);
            error.put("error", "Error al obtener resumen de rutas: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 📍 GET /api/rutas/origen
     * Obtiene información del punto de origen
     */
    @GetMapping("/origen")
    public ResponseEntity<?> obtenerOrigen() {
        Map<String, Object> origen = new HashMap<>();
        origen.put("direccion", "Carrera 73A No. 81B – 70, Bogotá, Colombia");
        origen.put("latitud", 4.7110);
        origen.put("longitud", -74.0721);
        origen.put("descripcion", "Punto de partida de todas las entregas");
        
        return ResponseEntity.ok(origen);
    }
}

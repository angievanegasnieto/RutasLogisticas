package rutaslogisticas.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.Service.GeocodificacionService;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/geocodificacion")
@CrossOrigin(origins = "http://localhost:4200")
public class GeocodificacionController {

    @Autowired
    private GeocodificacionService geocodificacionService;

    /**
     * 🌍 Endpoint para geocodificar una dirección
     * 
     * POST /api/geocodificacion
     * 
     * Body JSON:
     * {
     *   "direccion": "Calle 123 #45-67",
     *   "ciudad": "Bogotá",
     *   "departamento": "Cundinamarca",
     *   "pais": "Colombia"
     * }
     * 
     * Respuesta exitosa:
     * {
     *   "exitoso": true,
     *   "latitud": "4.7110",
     *   "longitud": "-74.0721",
     *   "direccionFormateada": "Calle 123 #45-67, Bogotá, Cundinamarca, Colombia",
     *   "precision": "ALTA",
     *   "importancia": "0.65"
     * }
     * 
     * Respuesta con error:
     * {
     *   "exitoso": false,
     *   "error": "La dirección es obligatoria"
     * }
     */
    @PostMapping
    public ResponseEntity<Map<String, Object>> geocodificar(@RequestBody Map<String, String> request) {
        try {
            // Extraer parámetros del body
            String direccion = request.get("direccion");
            String ciudad = request.get("ciudad");
            String departamento = request.get("departamento");
            String pais = request.get("pais");

            // Llamar al servicio
            Map<String, Object> resultado = geocodificacionService.geocodificar(
                direccion, ciudad, departamento, pais
            );

            return ResponseEntity.ok(resultado);

        } catch (IllegalArgumentException e) {
            // Error de validación
            Map<String, Object> error = new HashMap<>();
            error.put("exitoso", false);
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);

        } catch (Exception e) {
            // Error del servicio de geocodificación
            Map<String, Object> error = new HashMap<>();
            error.put("exitoso", false);
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * 🧪 Endpoint para validar una dirección sin geocodificar
     * 
     * GET /api/geocodificacion/validar?direccion=Calle 123&ciudad=Bogotá
     */
    @GetMapping("/validar")
    public ResponseEntity<Map<String, Object>> validarDireccion(
            @RequestParam String direccion,
            @RequestParam String ciudad) {
        
        Map<String, Object> resultado = geocodificacionService.validarDireccion(direccion, ciudad);
        return ResponseEntity.ok(resultado);
    }

    /**
     * ℹ️ Endpoint de información sobre el servicio
     * 
     * GET /api/geocodificacion/info
     */
    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> obtenerInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("servicio", "Geocodificación LocationIQ");
        info.put("version", "1.0");
        info.put("descripcion", "Convierte direcciones en coordenadas geográficas (latitud/longitud)");
        info.put("proveedor", "LocationIQ");
        info.put("limiteDiario", "10,000 peticiones (cuenta gratuita)");
        info.put("documentacion", "https://locationiq.com/docs");
        
        Map<String, String> ejemplo = new HashMap<>();
        ejemplo.put("direccion", "Calle 123 #45-67");
        ejemplo.put("ciudad", "Bogotá");
        ejemplo.put("departamento", "Cundinamarca");
        ejemplo.put("pais", "Colombia");
        
        info.put("ejemploRequest", ejemplo);
        
        return ResponseEntity.ok(info);
    }

    /**
     * 🔍 Endpoint para geocodificar múltiples direcciones (batch)
     * 
     * POST /api/geocodificacion/batch
     * 
     * Body JSON:
     * {
     *   "direcciones": [
     *     {
     *       "id": 1,
     *       "direccion": "Calle 123 #45-67",
     *       "ciudad": "Bogotá",
     *       "departamento": "Cundinamarca",
     *       "pais": "Colombia"
     *     },
     *     {
     *       "id": 2,
     *       "direccion": "Carrera 7 #32-16",
     *       "ciudad": "Medellín",
     *       "departamento": "Antioquia",
     *       "pais": "Colombia"
     *     }
     *   ]
     * }
     */
    @PostMapping("/batch")
    public ResponseEntity<Map<String, Object>> geocodificarBatch(@RequestBody Map<String, Object> request) {
        try {
            @SuppressWarnings("unchecked")
            java.util.List<Map<String, Object>> direcciones = 
                (java.util.List<Map<String, Object>>) request.get("direcciones");

            if (direcciones == null || direcciones.isEmpty()) {
                Map<String, Object> error = new HashMap<>();
                error.put("exitoso", false);
                error.put("error", "No se proporcionaron direcciones");
                return ResponseEntity.badRequest().body(error);
            }

            java.util.List<Map<String, Object>> resultados = new java.util.ArrayList<>();
            int exitosos = 0;
            int fallidos = 0;

            for (Map<String, Object> dir : direcciones) {
                Map<String, Object> resultado = new HashMap<>();
                resultado.put("id", dir.get("id"));

                try {
                    String direccion = (String) dir.get("direccion");
                    String ciudad = (String) dir.get("ciudad");
                    String departamento = (String) dir.get("departamento");
                    String pais = (String) dir.get("pais");

                    Map<String, Object> geocod = geocodificacionService.geocodificar(
                        direccion, ciudad, departamento, pais
                    );

                    resultado.putAll(geocod);
                    exitosos++;

                } catch (Exception e) {
                    resultado.put("exitoso", false);
                    resultado.put("error", e.getMessage());
                    fallidos++;
                }

                resultados.add(resultado);
            }

            Map<String, Object> respuesta = new HashMap<>();
            respuesta.put("total", direcciones.size());
            respuesta.put("exitosos", exitosos);
            respuesta.put("fallidos", fallidos);
            respuesta.put("resultados", resultados);

            return ResponseEntity.ok(respuesta);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("exitoso", false);
            error.put("error", "Error al procesar el lote: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}

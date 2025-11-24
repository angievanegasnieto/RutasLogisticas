package rutaslogisticas.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import rutaslogisticas.dto.CoordinatesDTO;
import rutaslogisticas.dto.RouteDTO;
import rutaslogisticas.Service.LocationIQService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/location")
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationIQService locationService;

    public LocationController(LocationIQService locationService) {
        this.locationService = locationService;
    }

    /**
     * Geocodificar una dirección
     * GET /api/location/geocode?address=Calle 80 # 73a-20 Bogotá
     */
    @GetMapping("/geocode")
    public ResponseEntity<CoordinatesDTO> geocode(@RequestParam String address) {
        try {
            CoordinatesDTO coordinates = locationService.geocode(address);
            return ResponseEntity.ok(coordinates);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Geocodificación inversa
     * GET /api/location/reverse?lat=4.728461&lon=-74.081675
     */
    @GetMapping("/reverse")
    public ResponseEntity<Map<String, String>> reverseGeocode(
            @RequestParam String lat,
            @RequestParam String lon) {
        try {
            String address = locationService.reverseGeocode(lat, lon);
            return ResponseEntity.ok(Map.of("address", address));
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Calcular ruta óptima
     * POST /api/location/route
     * Body: [{"latitude": "4.728461", "longitude": "-74.081675"}, ...]
     */
    @PostMapping("/route")
    public ResponseEntity<RouteDTO> calculateRoute(@RequestBody List<CoordinatesDTO> waypoints) {
        try {
            if (waypoints == null || waypoints.size() < 2) {
                return ResponseEntity.badRequest().build();
            }
            RouteDTO route = locationService.calculateRoute(waypoints);
            return ResponseEntity.ok(route);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Autocompletar direcciones
     * GET /api/location/autocomplete?q=Calle 80
     */
    @GetMapping("/autocomplete")
    public ResponseEntity<List<String>> autocomplete(@RequestParam String q) {
        try {
            List<String> suggestions = locationService.autocomplete(q);
            return ResponseEntity.ok(suggestions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}

package rutaslogisticas.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import rutaslogisticas.dto.CoordinatesDTO;
import rutaslogisticas.dto.RouteDTO;

import java.util.ArrayList;
import java.util.List;

@Service
public class LocationIQService {

    private static final String API_KEY = "pk.51e35f6a5b5899d94b7f425c0fb506bc";
    private static final String GEOCODING_URL = "https://us1.locationiq.com/v1/search.php";
    private static final String REVERSE_GEOCODING_URL = "https://us1.locationiq.com/v1/reverse.php";
    private static final String ROUTING_URL = "https://us1.locationiq.com/v1/directions/driving";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    public LocationIQService() {
        this.restTemplate = new RestTemplate();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Geocodificación: Convierte una dirección en coordenadas
     */
    public CoordinatesDTO geocode(String address) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(GEOCODING_URL)
                    .queryParam("key", API_KEY)
                    .queryParam("q", address)
                    .queryParam("format", "json")
                    .queryParam("limit", 1)
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            if (root.isArray() && root.size() > 0) {
                JsonNode firstResult = root.get(0);
                return new CoordinatesDTO(
                    firstResult.get("lat").asText(),
                    firstResult.get("lon").asText(),
                    firstResult.get("display_name").asText()
                );
            }
            
            throw new RuntimeException("No se encontraron coordenadas para la dirección: " + address);
        } catch (Exception e) {
            throw new RuntimeException("Error al geocodificar dirección: " + e.getMessage(), e);
        }
    }

    /**
     * Geocodificación inversa: Convierte coordenadas en una dirección
     */
    public String reverseGeocode(String latitude, String longitude) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(REVERSE_GEOCODING_URL)
                    .queryParam("key", API_KEY)
                    .queryParam("lat", latitude)
                    .queryParam("lon", longitude)
                    .queryParam("format", "json")
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            return root.get("display_name").asText();
        } catch (Exception e) {
            throw new RuntimeException("Error al obtener dirección: " + e.getMessage(), e);
        }
    }

    /**
     * Calcula la ruta óptima entre múltiples puntos
     */
    public RouteDTO calculateRoute(List<CoordinatesDTO> waypoints) {
        try {
            // Construir coordenadas en formato "lon,lat;lon,lat;..."
            StringBuilder coordinates = new StringBuilder();
            for (int i = 0; i < waypoints.size(); i++) {
                CoordinatesDTO point = waypoints.get(i);
                coordinates.append(point.getLongitude()).append(",").append(point.getLatitude());
                if (i < waypoints.size() - 1) {
                    coordinates.append(";");
                }
            }

            String url = UriComponentsBuilder.fromHttpUrl(ROUTING_URL + "/" + coordinates.toString())
                    .queryParam("key", API_KEY)
                    .queryParam("steps", "true")
                    .queryParam("alternatives", "false")
                    .queryParam("geometries", "polyline")
                    .queryParam("overview", "full")
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            JsonNode route = root.get("routes").get(0);
            
            // Extraer distancia (en metros) y duración (en segundos)
            double distance = route.get("distance").asDouble() / 1000.0; // Convertir a km
            int duration = route.get("duration").asInt();
            String geometry = route.get("geometry").asText();

            return new RouteDTO(distance, duration, waypoints, geometry);
        } catch (Exception e) {
            throw new RuntimeException("Error al calcular ruta: " + e.getMessage(), e);
        }
    }

    /**
     * Autocompletar direcciones
     */
    public List<String> autocomplete(String query) {
        try {
            String url = UriComponentsBuilder.fromHttpUrl(GEOCODING_URL)
                    .queryParam("key", API_KEY)
                    .queryParam("q", query)
                    .queryParam("format", "json")
                    .queryParam("limit", 5)
                    .queryParam("countrycodes", "co") // Colombia
                    .build()
                    .toUriString();

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            
            List<String> suggestions = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    suggestions.add(node.get("display_name").asText());
                }
            }
            
            return suggestions;
        } catch (Exception e) {
            throw new RuntimeException("Error al autocompletar: " + e.getMessage(), e);
        }
    }
}

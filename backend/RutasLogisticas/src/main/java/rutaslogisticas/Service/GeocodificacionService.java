package rutaslogisticas.Service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.util.UriComponentsBuilder;

import java.util.HashMap;
import java.util.Map;

@Service
public class GeocodificacionService {

    // API Key de OpenCage (Configurada)
    private static final String OPENCAGE_API_KEY = "14d4455b07a0409782f708dec766f2a0";
    private static final String OPENCAGE_URL = "https://api.opencagedata.com/geocode/v1/json";

    private final RestTemplate restTemplate;

    public GeocodificacionService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 🌍 Geocodificar una dirección completa
     * 
     * @param direccion Dirección completa (calle, número, etc.)
     * @param ciudad Ciudad
     * @param departamento Departamento/Estado
     * @param pais País
     * @return Mapa con latitud, longitud y precisión
     * @throws Exception Si la geocodificación falla
     */
    public Map<String, Object> geocodificar(String direccion, String ciudad, String departamento, String pais) throws Exception {
        
        // ✅ VALIDACIÓN 1: Campos obligatorios
        if (direccion == null || direccion.trim().isEmpty()) {
            throw new IllegalArgumentException("La dirección es obligatoria");
        }
        if (ciudad == null || ciudad.trim().isEmpty()) {
            throw new IllegalArgumentException("La ciudad es obligatoria");
        }

        // ✅ VALIDACIÓN 2: Longitud mínima
        if (direccion.trim().length() < 5) {
            throw new IllegalArgumentException("La dirección es demasiado corta (mínimo 5 caracteres)");
        }

        // Intentar primero con la dirección original
        try {
            return intentarGeocodificar(direccion, ciudad, departamento, pais, false);
        } catch (Exception e) {
            // Si falla, intentar con dirección normalizada (sin letras)
            System.out.println("⚠️ Geocodificación original falló, intentando con dirección normalizada...");
            try {
                return intentarGeocodificar(direccion, ciudad, departamento, pais, true);
            } catch (Exception e2) {
                // Si ambos intentos fallan, lanzar el error original
                throw e;
            }
        }
    }
    
    /**
     * 🔍 Intentar geocodificar con o sin normalización
     */
    private Map<String, Object> intentarGeocodificar(String direccion, String ciudad, String departamento, String pais, boolean normalizar) throws Exception {
        
        String queryCompleta;
        
        if (normalizar) {
            // En el fallback, usar solo la calle principal sin números específicos
            String callePrincipal = extraerCallePrincipal(direccion);
            queryCompleta = callePrincipal + ", " + ciudad.trim() + ", Colombia";
            System.out.println("📍 Geocodificando (solo calle principal): " + queryCompleta);
        } else {
            // Primer intento: dirección completa normalizada
            String direccionProcesada = normalizarDireccion(direccion);
            queryCompleta = direccionProcesada + ", " + ciudad.trim() + ", Colombia";
            System.out.println("📍 Geocodificando: " + queryCompleta);
        }

        // 🌐 Construir URL con parámetros de OpenCage
        String url = UriComponentsBuilder.fromHttpUrl(OPENCAGE_URL)
                .queryParam("key", OPENCAGE_API_KEY)
                .queryParam("q", queryCompleta)
                .queryParam("limit", 10)
                .queryParam("countrycode", "co")
                .queryParam("language", "es")
                .queryParam("no_annotations", 1)
                .toUriString();
                
        System.out.println("🌐 URL: " + url);

        try {
            // 📡 Realizar la petición HTTP
            Map<String, Object> respuestaCompleta = restTemplate.getForObject(url, Map.class);
            
            // ✅ VALIDACIÓN 3: Verificar respuesta de OpenCage
            if (respuestaCompleta == null || !respuestaCompleta.containsKey("results")) {
                throw new Exception("No se recibió respuesta válida del servicio de geocodificación");
            }
            
            java.util.List<Map<String, Object>> respuesta = (java.util.List<Map<String, Object>>) respuestaCompleta.get("results");
            System.out.println("📦 Resultados recibidos: " + (respuesta != null ? respuesta.size() : 0));

            if (respuesta == null || respuesta.isEmpty()) {
                throw new Exception("No se encontraron resultados para '" + queryCompleta + "' en Colombia");
            }

            // 🔍 Filtrar resultados de OpenCage
            Map<String, Object> resultado = null;
            String ciudadNormalizada = ciudad.trim().toLowerCase()
                .replace("á", "a").replace("é", "e").replace("í", "i")
                .replace("ó", "o").replace("ú", "u");
            
            for (Map<String, Object> res : respuesta) {
                String formatted = (String) res.get("formatted");
                System.out.println("  🏷️ Resultado: " + formatted);
                
                // Obtener componentes de dirección
                Map<String, Object> components = (Map<String, Object>) res.get("components");
                if (components == null) {
                    System.out.println("    ❌ Sin componentes");
                    continue;
                }
                
                // Verificar que sea Colombia
                String country = (String) components.get("country");
                String countryCode = (String) components.get("country_code");
                if (!"Colombia".equalsIgnoreCase(country) && !"co".equalsIgnoreCase(countryCode)) {
                    System.out.println("    ❌ No está en Colombia");
                    continue;
                }
                
                // Verificar coincidencia de ciudad
                String resCiudad = obtenerCiudadDeComponents(components);
                if (resCiudad != null) {
                    String resCiudadNorm = resCiudad.toLowerCase()
                        .replace("á", "a").replace("é", "e").replace("í", "i")
                        .replace("ó", "o").replace("ú", "u");
                    
                    if (resCiudadNorm.contains(ciudadNormalizada) || ciudadNormalizada.contains(resCiudadNorm)) {
                        System.out.println("    ✅ Ciudad coincide: " + resCiudad);
                        resultado = res;
                        break;
                    }
                }
            }
            
            // Si no se encontró coincidencia exacta, usar el primer resultado
            if (resultado == null && !respuesta.isEmpty()) {
                System.out.println("  ⚠️ No se encontró coincidencia exacta, usando primer resultado");
                resultado = respuesta.get(0);
            }
            
            // Si aún no hay resultado, lanzar error
            if (resultado == null) {
                throw new Exception("No se encontraron resultados válidos para '" + queryCompleta + "' en Colombia");
            }
            
            // ✅ VALIDACIÓN 4: Verificar coordenadas en OpenCage
            Map<String, Object> geometry = (Map<String, Object>) resultado.get("geometry");
            if (geometry == null || !geometry.containsKey("lat") || !geometry.containsKey("lng")) {
                throw new Exception("La respuesta no contiene coordenadas válidas");
            }

            String lat = geometry.get("lat").toString();
            String lon = geometry.get("lng").toString();
            String formatted = (String) resultado.get("formatted");
            Object confidenceObj = resultado.get("confidence");
            String confidence = confidenceObj != null ? confidenceObj.toString() : "0";
            
            // ✅ VALIDACIÓN 5: Verificar que las coordenadas sean números válidos
            try {
                Double.parseDouble(lat);
                Double.parseDouble(lon);
            } catch (NumberFormatException e) {
                throw new Exception("Las coordenadas recibidas no son válidas");
            }

            // 🎯 Determinar precisión basada en confidence de OpenCage
            String precision = determinarPrecisionOpenCage(resultado);

            // 📦 Construir respuesta
            Map<String, Object> respuestaGeocod = new HashMap<>();
            respuestaGeocod.put("latitud", lat);
            respuestaGeocod.put("longitud", lon);
            respuestaGeocod.put("direccionFormateada", formatted);
            respuestaGeocod.put("precision", precision);
            respuestaGeocod.put("confidence", confidence);
            respuestaGeocod.put("exitoso", true);

            return respuestaGeocod;

        } catch (HttpClientErrorException.TooManyRequests e) {
            // ⚠️ ERROR: Límite de API excedido
            System.err.println("❌ Error 429: " + e.getMessage());
            throw new Exception("Límite de peticiones excedido. Intenta de nuevo en unos minutos.");
            
        } catch (HttpClientErrorException.Unauthorized e) {
            // ⚠️ ERROR: API key inválida
            System.err.println("❌ Error 401: " + e.getMessage());
            throw new Exception("Error de autenticación con el servicio de geocodificación. Verifica la API key.");
            
        } catch (HttpClientErrorException.NotFound e) {
            // ⚠️ ERROR: 404 - No se encontró la dirección
            System.err.println("❌ Error 404: " + e.getResponseBodyAsString());
            throw new Exception("La dirección '" + queryCompleta + "' no se encontró en Colombia. Intenta con una dirección más general.");
            
        } catch (HttpClientErrorException e) {
            // ⚠️ ERROR: Otros errores HTTP
            System.err.println("❌ Error HTTP " + e.getStatusCode() + ": " + e.getResponseBodyAsString());
            throw new Exception("Error al comunicarse con el servicio de geocodificación: " + e.getMessage());
            
        } catch (Exception e) {
            // ⚠️ ERROR: Cualquier otro error
            System.err.println("❌ Error general: " + e.getMessage());
            if (e.getMessage().contains("No se encontraron resultados") || 
                e.getMessage().contains("coordenadas") ||
                e.getMessage().contains("Límite de peticiones") ||
                e.getMessage().contains("no se encontró")) {
                throw e; // Re-lanzar errores conocidos
            }
            throw new Exception("Error inesperado al geocodificar: " + e.getMessage());
        }
    }

    /**
     * 🔨 Construir la consulta de dirección completa
     */
    private String construirConsultaDireccion(String direccion, String ciudad, String departamento, String pais) {
        // Normalizar la dirección para mejorar búsqueda
        String direccionNormalizada = normalizarDireccion(direccion.trim());
        
        // Formato simple: "dirección, ciudad, Colombia"
        return direccionNormalizada + ", " + ciudad.trim() + ", Colombia";
    }
    
    /**
     * 📝 Normalizar dirección manteniendo formato original
     */
    private String normalizarDireccion(String direccion) {
        // Mantener la dirección lo más original posible
        String norm = direccion.trim();
        
        // Solo reemplazar # por "No." que es más reconocible
        norm = norm.replace("#", "No. ");
        
        // Limpiar espacios múltiples
        norm = norm.replaceAll("\\s+", " ");
        
        return norm.trim();
    }
    
    /**
     * 🛣️ Extraer solo la calle principal de una dirección
     */
    private String extraerCallePrincipal(String direccion) {
        String norm = direccion.trim();
        
        // Buscar el primer # y cortar ahí
        int hashPos = norm.indexOf('#');
        if (hashPos > 0) {
            norm = norm.substring(0, hashPos).trim();
        }
        
        // Quitar letras pegadas a números
        norm = norm.replaceAll("(\\d+)[a-zA-Z]+", "$1");
        
        return norm.trim();
    }
    
    /**
     * 📝 Método legacy (ya no usado)
     */
    private String normalizarDireccionSinLetras(String direccion) {
        return extraerCallePrincipal(direccion);
    }

    /**
     * 🎯 Determinar la precisión basada en confidence de OpenCage
     * OpenCage usa confidence de 0-10 (10 = más preciso)
     */
    private String determinarPrecisionOpenCage(Map<String, Object> resultado) {
        Object confidenceObj = resultado.get("confidence");
        int confidence = 0;
        
        if (confidenceObj != null) {
            try {
                confidence = Integer.parseInt(confidenceObj.toString());
            } catch (NumberFormatException e) {
                confidence = 0;
            }
        }
        
        // Obtener tipo de resultado
        Map<String, Object> components = (Map<String, Object>) resultado.get("components");
        String type = "";
        if (components != null && components.containsKey("_type")) {
            type = components.get("_type").toString().toLowerCase();
        }

        // Determinar precisión basada en confidence y tipo
        if (confidence >= 9 || type.contains("building") || type.contains("house")) {
            return "EXACTA";
        } else if (confidence >= 7 || type.contains("road") || type.contains("street")) {
            return "ALTA";
        } else if (confidence >= 5 || type.contains("suburb") || type.contains("neighbourhood")) {
            return "MEDIA";
        } else {
            return "BAJA";
        }
    }

    /**
     * 🏙️ Obtener nombre de ciudad desde los components de OpenCage
     */
    private String obtenerCiudadDeComponents(Map<String, Object> components) {
        // OpenCage puede usar diferentes campos para ciudad
        String[] camposCiudad = {"city", "town", "village", "municipality", "county", "state_district"};
        
        for (String campo : camposCiudad) {
            Object valor = components.get(campo);
            if (valor != null) {
                return valor.toString();
            }
        }
        
        return null;
    }

    /**
     * 🧪 Validar dirección sin geocodificar (validación básica)
     */
    public Map<String, Object> validarDireccion(String direccion, String ciudad) {
        Map<String, Object> resultado = new HashMap<>();
        
        boolean valida = true;
        StringBuilder errores = new StringBuilder();

        // Validar dirección
        if (direccion == null || direccion.trim().isEmpty()) {
            valida = false;
            errores.append("La dirección es obligatoria. ");
        } else if (direccion.trim().length() < 5) {
            valida = false;
            errores.append("La dirección es demasiado corta. ");
        }

        // Validar ciudad
        if (ciudad == null || ciudad.trim().isEmpty()) {
            valida = false;
            errores.append("La ciudad es obligatoria. ");
        }

        resultado.put("valida", valida);
        resultado.put("errores", errores.toString().trim());
        
        return resultado;
    }
}

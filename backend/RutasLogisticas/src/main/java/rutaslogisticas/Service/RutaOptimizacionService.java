package rutaslogisticas.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.util.UriComponentsBuilder;
import rutaslogisticas.entity.Pedido;
import rutaslogisticas.entity.Conductor;
import rutaslogisticas.repository.PedidoRepository;
import rutaslogisticas.repository.ConductorRepository;

import java.util.*;

@Service
public class RutaOptimizacionService {

    // Punto de partida fijo: Carrera 73A No. 81B – 70
    private static final String ORIGEN_DIRECCION = "Carrera 73A No. 81B – 70, Bogotá, Colombia";
    private static final double ORIGEN_LAT = 4.7110;  // Coordenadas aproximadas
    private static final double ORIGEN_LNG = -74.0721;

    private static final String LOCATIONIQ_API_KEY = "pk.e7110aca548a81884ebf69cfdad9cab6";
    private static final String LOCATIONIQ_DIRECTIONS_URL = "https://us1.locationiq.com/v1/directions/driving";

    @Autowired
    private PedidoRepository pedidoRepository;

    @Autowired
    private ConductorRepository conductorRepository;

    private final RestTemplate restTemplate;

    public RutaOptimizacionService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * 🗺️ DTO para información de ruta optimizada
     */
    public static class RutaOptimizadaDTO {
        public Long conductorId;
        public String conductorNombre;
        public List<PuntoEntrega> puntosEntrega;
        public PuntoOrigen origen;
        public RutaInfo rutaInfo;
        public boolean exitoso;
        public String error;

        public RutaOptimizadaDTO() {
            this.puntosEntrega = new ArrayList<>();
        }
    }

    public static class PuntoOrigen {
        public String direccion;
        public double latitud;
        public double longitud;

        public PuntoOrigen(String direccion, double lat, double lng) {
            this.direccion = direccion;
            this.latitud = lat;
            this.longitud = lng;
        }
    }

    public static class PuntoEntrega {
        public Long pedidoId;
        public String clienteNombre;
        public String direccion;
        public String ciudad;
        public double latitud;
        public double longitud;
        public String producto;
        public Integer cantidad;
        public String estado;
        public int orden;

        public PuntoEntrega() {}
    }

    public static class RutaInfo {
        public double distanciaTotal; // en kilómetros
        public double duracionTotal; // en minutos
        public int numeroPedidos;
        public List<Coordenada> geometria;

        public RutaInfo() {
            this.geometria = new ArrayList<>();
        }
    }

    public static class Coordenada {
        public double lat;
        public double lng;

        public Coordenada(double lat, double lng) {
            this.lat = lat;
            this.lng = lng;
        }
    }

    /**
     * 🚚 Obtener ruta optimizada para un conductor
     */
    public RutaOptimizadaDTO obtenerRutaOptimizada(Long conductorId) throws Exception {
        RutaOptimizadaDTO resultado = new RutaOptimizadaDTO();

        // Obtener conductor
        Optional<Conductor> conductorOpt = conductorRepository.findById(conductorId);
        if (!conductorOpt.isPresent()) {
            resultado.exitoso = false;
            resultado.error = "Conductor no encontrado";
            return resultado;
        }

        Conductor conductor = conductorOpt.get();
        resultado.conductorId = conductorId;
        resultado.conductorNombre = conductor.getNombreCompleto();

        // Configurar origen
        resultado.origen = new PuntoOrigen(ORIGEN_DIRECCION, ORIGEN_LAT, ORIGEN_LNG);

        // Obtener pedidos asignados al conductor (solo EN_RUTA)
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> p.getConductorId() != null && p.getConductorId().equals(conductorId))
                .filter(p -> p.getEstado() == Pedido.EstadoPedido.EN_RUTA)
                .toList();

        if (pedidos.isEmpty()) {
            resultado.exitoso = false;
            resultado.error = "No hay pedidos asignados a este conductor";
            return resultado;
        }

        // Convertir pedidos a puntos de entrega
        List<PuntoEntrega> puntos = new ArrayList<>();
        for (Pedido pedido : pedidos) {
            if (pedido.getLatitud() != null && pedido.getLongitud() != null) {
                PuntoEntrega punto = new PuntoEntrega();
                punto.pedidoId = pedido.getId();
                punto.clienteNombre = pedido.getCliente() != null ? pedido.getCliente().getNombre() : "N/A";
                punto.direccion = pedido.getDireccion() != null ? pedido.getDireccion().getDireccion() : "N/A";
                punto.ciudad = pedido.getDireccion() != null ? pedido.getDireccion().getCiudad() : "N/A";
                punto.latitud = pedido.getLatitud().doubleValue();
                punto.longitud = pedido.getLongitud().doubleValue();
                punto.producto = pedido.getProducto();
                punto.cantidad = pedido.getCantidad();
                punto.estado = pedido.getEstado().toString();
                puntos.add(punto);
            }
        }

        if (puntos.isEmpty()) {
            resultado.exitoso = false;
            resultado.error = "Ningún pedido tiene coordenadas geográficas";
            return resultado;
        }

        // Optimizar orden de puntos (algoritmo greedy - vecino más cercano)
        List<PuntoEntrega> puntosOptimizados = optimizarOrdenPuntos(ORIGEN_LAT, ORIGEN_LNG, puntos);
        
        // Asignar orden
        for (int i = 0; i < puntosOptimizados.size(); i++) {
            puntosOptimizados.get(i).orden = i + 1;
        }

        resultado.puntosEntrega = puntosOptimizados;

        // Calcular información de la ruta
        RutaInfo rutaInfo = calcularInfoRuta(ORIGEN_LAT, ORIGEN_LNG, puntosOptimizados);
        resultado.rutaInfo = rutaInfo;

        resultado.exitoso = true;
        return resultado;
    }

    /**
     * 🧭 Optimizar orden de puntos usando algoritmo del vecino más cercano
     */
    private List<PuntoEntrega> optimizarOrdenPuntos(double origenLat, double origenLng, List<PuntoEntrega> puntos) {
        List<PuntoEntrega> puntosOptimizados = new ArrayList<>();
        List<PuntoEntrega> pendientes = new ArrayList<>(puntos);
        
        double actualLat = origenLat;
        double actualLng = origenLng;

        while (!pendientes.isEmpty()) {
            // Encontrar el punto más cercano
            PuntoEntrega masCercano = null;
            double distanciaMinima = Double.MAX_VALUE;

            for (PuntoEntrega punto : pendientes) {
                double distancia = calcularDistanciaHaversine(actualLat, actualLng, punto.latitud, punto.longitud);
                if (distancia < distanciaMinima) {
                    distanciaMinima = distancia;
                    masCercano = punto;
                }
            }

            if (masCercano != null) {
                puntosOptimizados.add(masCercano);
                pendientes.remove(masCercano);
                actualLat = masCercano.latitud;
                actualLng = masCercano.longitud;
            }
        }

        return puntosOptimizados;
    }

    /**
     * 📏 Calcular distancia entre dos puntos usando fórmula de Haversine
     */
    private double calcularDistanciaHaversine(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Radio de la Tierra en km

        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c;
    }

    /**
     * 📊 Calcular información de la ruta (distancia y duración totales)
     */
    private RutaInfo calcularInfoRuta(double origenLat, double origenLng, List<PuntoEntrega> puntos) {
        RutaInfo info = new RutaInfo();
        info.numeroPedidos = puntos.size();

        double distanciaTotal = 0;
        double lat1 = origenLat;
        double lng1 = origenLng;

        // Calcular distancia total
        for (PuntoEntrega punto : puntos) {
            double distancia = calcularDistanciaHaversine(lat1, lng1, punto.latitud, punto.longitud);
            distanciaTotal += distancia;
            lat1 = punto.latitud;
            lng1 = punto.longitud;
        }

        info.distanciaTotal = Math.round(distanciaTotal * 100.0) / 100.0; // Redondear a 2 decimales
        
        // Estimar duración (promedio 30 km/h en ciudad + 5 min por entrega)
        double horasViaje = distanciaTotal / 30.0;
        double minutosEntrega = puntos.size() * 5.0;
        info.duracionTotal = Math.round((horasViaje * 60 + minutosEntrega) * 10.0) / 10.0;

        // Crear geometría simple (línea recta entre puntos para visualización)
        info.geometria.add(new Coordenada(origenLat, origenLng));
        for (PuntoEntrega punto : puntos) {
            info.geometria.add(new Coordenada(punto.latitud, punto.longitud));
        }

        return info;
    }

    /**
     * 🗺️ Obtener geometría de ruta detallada desde LocationIQ (opcional, más preciso)
     */
    public Map<String, Object> obtenerRutaDetallada(Long conductorId) throws Exception {
        RutaOptimizadaDTO rutaBasica = obtenerRutaOptimizada(conductorId);
        
        if (!rutaBasica.exitoso) {
            Map<String, Object> error = new HashMap<>();
            error.put("exitoso", false);
            error.put("error", rutaBasica.error);
            return error;
        }

        // Construir coordenadas para LocationIQ Directions API
        StringBuilder coordenadas = new StringBuilder();
        coordenadas.append(ORIGEN_LNG).append(",").append(ORIGEN_LAT);
        
        for (PuntoEntrega punto : rutaBasica.puntosEntrega) {
            coordenadas.append(";").append(punto.longitud).append(",").append(punto.latitud);
        }

        try {
            // Llamar a LocationIQ Directions API
            String url = UriComponentsBuilder.fromHttpUrl(LOCATIONIQ_DIRECTIONS_URL + "/" + coordenadas.toString())
                    .queryParam("key", LOCATIONIQ_API_KEY)
                    .queryParam("steps", "true")
                    .queryParam("alternatives", "false")
                    .queryParam("geometries", "geojson")
                    .queryParam("overview", "full")
                    .toUriString();

            @SuppressWarnings("unchecked")
            Map<String, Object> respuesta = restTemplate.getForObject(url, Map.class);

            // Combinar con datos básicos
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("exitoso", true);
            resultado.put("conductorId", rutaBasica.conductorId);
            resultado.put("conductorNombre", rutaBasica.conductorNombre);
            resultado.put("origen", rutaBasica.origen);
            resultado.put("puntosEntrega", rutaBasica.puntosEntrega);
            resultado.put("rutaDetallada", respuesta);
            
            return resultado;

        } catch (Exception e) {
            // Si falla la API, devolver la ruta básica
            Map<String, Object> resultado = new HashMap<>();
            resultado.put("exitoso", true);
            resultado.put("conductorId", rutaBasica.conductorId);
            resultado.put("conductorNombre", rutaBasica.conductorNombre);
            resultado.put("origen", rutaBasica.origen);
            resultado.put("puntosEntrega", rutaBasica.puntosEntrega);
            resultado.put("rutaInfo", rutaBasica.rutaInfo);
            resultado.put("advertencia", "No se pudo obtener ruta detallada, mostrando ruta optimizada básica");
            
            return resultado;
        }
    }

    /**
     * 📋 Obtener resumen de rutas para todos los conductores con pedidos
     */
    public List<Map<String, Object>> obtenerResumenRutasConductores() {
        List<Map<String, Object>> resumen = new ArrayList<>();

        // Obtener todos los conductores con pedidos asignados
        List<Conductor> conductores = conductorRepository.findAll();

        for (Conductor conductor : conductores) {
            try {
                RutaOptimizadaDTO ruta = obtenerRutaOptimizada(conductor.getId());
                
                if (ruta.exitoso) {
                    Map<String, Object> item = new HashMap<>();
                    item.put("conductorId", conductor.getId());
                    item.put("conductorNombre", conductor.getNombreCompleto());
                    item.put("numeroPedidos", ruta.puntosEntrega.size());
                    item.put("distanciaTotal", ruta.rutaInfo.distanciaTotal);
                    item.put("duracionTotal", ruta.rutaInfo.duracionTotal);
                    item.put("tieneRuta", true);
                    
                    resumen.add(item);
                }
            } catch (Exception e) {
                // Ignorar conductores sin rutas válidas
            }
        }

        return resumen;
    }
}

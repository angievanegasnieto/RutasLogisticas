package rutaslogisticas.service;

import org.springframework.stereotype.Service;

@Service
public class GeoService {

    // Coordenadas fijas de la bodega matriz (Bogotá por defecto)
    private static final double BODEGA_LAT = 4.6584;
    private static final double BODEGA_LON = -74.0930;

    // Método para calcular distancia entre dos coordenadas usando fórmula Haversine
    public double calcularDistancia(double lat1, double lon1, double lat2, double lon2) {
        double R = 6371; // Radio de la Tierra en km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Simulación de coordenadas generadas a partir del texto de la dirección
    public double[] getLatLong(String direccion) {
        double lat = BODEGA_LAT + (direccion.hashCode() % 1000) * 0.00001;
        double lon = BODEGA_LON + (direccion.hashCode() % 1000) * 0.00001;
        return new double[]{lat, lon};
    }

    // Distancia entre la bodega y la dirección del cliente
    public double distanciaDesdeBodega(String direccionCliente) {
        double[] cliente = getLatLong(direccionCliente);
        return calcularDistancia(BODEGA_LAT, BODEGA_LON, cliente[0], cliente[1]);
    }
}

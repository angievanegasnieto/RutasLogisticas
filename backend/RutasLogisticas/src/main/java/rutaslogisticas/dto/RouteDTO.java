package rutaslogisticas.dto;

import java.util.List;

public class RouteDTO {
    private Double distance; // En kilómetros
    private Integer duration; // En segundos
    private List<CoordinatesDTO> waypoints;
    private String geometry; // Polilínea codificada

    public RouteDTO() {}

    public RouteDTO(Double distance, Integer duration, List<CoordinatesDTO> waypoints, String geometry) {
        this.distance = distance;
        this.duration = duration;
        this.waypoints = waypoints;
        this.geometry = geometry;
    }

    // Getters y Setters
    public Double getDistance() {
        return distance;
    }

    public void setDistance(Double distance) {
        this.distance = distance;
    }

    public Integer getDuration() {
        return duration;
    }

    public void setDuration(Integer duration) {
        this.duration = duration;
    }

    public List<CoordinatesDTO> getWaypoints() {
        return waypoints;
    }

    public void setWaypoints(List<CoordinatesDTO> waypoints) {
        this.waypoints = waypoints;
    }

    public String getGeometry() {
        return geometry;
    }

    public void setGeometry(String geometry) {
        this.geometry = geometry;
    }
}

package rutaslogisticas.Request;

public record CrearAsignacionVehiculoRequest(
    Long conductorId,
    Long vehiculoId,
    String observaciones
) {}

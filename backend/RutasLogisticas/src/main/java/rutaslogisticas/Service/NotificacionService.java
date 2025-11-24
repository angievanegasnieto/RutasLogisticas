package rutaslogisticas.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import rutaslogisticas.repository.AuditoriaRepository;
import rutaslogisticas.entity.*;
import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class NotificacionService {

    @Autowired
    private AuditoriaRepository auditoriaRepository;

    /**
     * 🔔 NOTIFICACIONES DE ESTADO DE PEDIDO
     * Actualización del estado (pendiente → en curso → finalizado)
     * y notificación visual (por color o badge)
     */
    public void enviarNotificacionCambioEstado(Pedido pedido,
                                               Pedido.EstadoPedido estadoAnterior,
                                               Pedido.EstadoPedido estadoNuevo) {

        String mensaje = generarMensajeEstado(pedido, estadoAnterior, estadoNuevo);
        String colorNotificacion = obtenerColorPorEstado(estadoNuevo);

        // Registrar en auditoría
        Auditoria auditoria = new Auditoria();
        auditoria.setAccion("CAMBIO_ESTADO_PEDIDO");
        auditoria.setTipoEntidad("PEDIDO");
        auditoria.setEntidadId(pedido.getId());
        auditoria.setMensaje(mensaje);
        auditoria.setNivel(obtenerNivelPorEstado(estadoNuevo));
        auditoria.setCreadoEn(LocalDateTime.now());

        auditoriaRepository.save(auditoria);

        // 🎨 Notificación visual con color/badge
        enviarNotificacionVisual(pedido.getId(), mensaje, colorNotificacion, estadoNuevo);

        System.out.println("🔔 NOTIFICACIÓN: " + mensaje + " [Color: " + colorNotificacion + "]");
    }

    private String generarMensajeEstado(Pedido pedido,
                                        Pedido.EstadoPedido anterior,
                                        Pedido.EstadoPedido nuevo) {
        return String.format("Pedido #%d cambió de %s → %s (Cliente: %s)",
                pedido.getId(),
                anterior.name(),
                nuevo.name(),
                pedido.getCliente().getNombre());
    }

    private String obtenerColorPorEstado(Pedido.EstadoPedido estado) {
        switch (estado) {
            case PENDIENTE: return "#FFA500";     // Naranja
            case ASIGNADO: return "#4169E1";      // Azul real
            case EN_RUTA: return "#1E90FF";       // Azul dodger
            case ENTREGADO: return "#32CD32";     // Verde lima
            case FALLIDO: return "#FF6347";       // Rojo tomate
            default: return "#808080";            // Gris
        }
    }

    private Auditoria.Nivel obtenerNivelPorEstado(Pedido.EstadoPedido estado) {
        switch (estado) {
            case FALLIDO: return Auditoria.Nivel.ERROR;
            default: return Auditoria.Nivel.INFO;
        }
    }

    /**
     * 🎨 Notificación visual con badge/color
     */
    private void enviarNotificacionVisual(Long pedidoId, String mensaje,
                                          String color, Pedido.EstadoPedido estado) {

        // Aquí puedes integrar con WebSockets, Server-Sent Events, etc.
        NotificacionVisual notif = new NotificacionVisual();
        notif.setPedidoId(pedidoId);
        notif.setMensaje(mensaje);
        notif.setColor(color);
        notif.setBadge(obtenerBadgePorEstado(estado));
        notif.setTimestamp(LocalDateTime.now());

        // Enviar por WebSocket (ejemplo)
        // webSocketTemplate.convertAndSend("/topic/notificaciones", notif);
    }

    private String obtenerBadgePorEstado(Pedido.EstadoPedido estado) {
        switch (estado) {
            case PENDIENTE: return "⏳ Pendiente";
            case ASIGNADO: return "📋 Asignado";
            case EN_RUTA: return "🚛 En Ruta";
            case ENTREGADO: return "✅ Entregado";
            case FALLIDO: return "❌ Fallido";
            default: return "❓ Desconocido";
        }
    }

    /**
     * 📊 Listado filtrable de pedidos con notificaciones
     */
    public List<Auditoria> obtenerNotificacionesPedidos() {
        return auditoriaRepository.findByTipoEntidad("PEDIDO");
    }

    public void enviarNotificacion(String titulo, String mensaje, String tipo) {
        Auditoria auditoria = new Auditoria();
        auditoria.setAccion(tipo);
        auditoria.setMensaje(titulo + ": " + mensaje);
        auditoria.setNivel(Auditoria.Nivel.INFO);
        auditoria.setCreadoEn(LocalDateTime.now());

        auditoriaRepository.save(auditoria);

        System.out.println("🔔 " + titulo + " - " + mensaje);
    }
    
    public void enviarNotificacion(String titulo, String mensaje, String tipo, Long usuarioId) {
        Auditoria auditoria = new Auditoria();
        auditoria.setUsuarioId(usuarioId);
        auditoria.setAccion(tipo);
        auditoria.setMensaje(titulo + ": " + mensaje);
        auditoria.setNivel(Auditoria.Nivel.INFO);
        auditoria.setCreadoEn(LocalDateTime.now());
        
        auditoriaRepository.save(auditoria);
        
        System.out.println("🔔 " + titulo + " - " + mensaje);
    }

    // Clase interna para notificaciones visuales
    public static class NotificacionVisual {
        private Long pedidoId;
        private String mensaje;
        private String color;
        private String badge;
        private LocalDateTime timestamp;

        // Getters y Setters
        public Long getPedidoId() { return pedidoId; }
        public void setPedidoId(Long pedidoId) { this.pedidoId = pedidoId; }

        public String getMensaje() { return mensaje; }
        public void setMensaje(String mensaje) { this.mensaje = mensaje; }

        public String getColor() { return color; }
        public void setColor(String color) { this.color = color; }

        public String getBadge() { return badge; }
        public void setBadge(String badge) { this.badge = badge; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }
}

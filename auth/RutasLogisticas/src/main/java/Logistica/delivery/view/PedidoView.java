/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Logistica.delivery.view;

public class PedidoView {
    private Long id;
    private String cliente;
    private String destino;
    private String fechaEntrega;   // como texto ya formateado
    private String costo;          // como texto "12345.67"
    private Long vehiculoId;
    private Long conductorId;
    private String estado;

    // getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }

    public String getFechaEntrega() { return fechaEntrega; }
    public void setFechaEntrega(String fechaEntrega) { this.fechaEntrega = fechaEntrega; }

    public String getCosto() { return costo; }
    public void setCosto(String costo) { this.costo = costo; }

    public Long getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Long vehiculoId) { this.vehiculoId = vehiculoId; }

    public Long getConductorId() { return conductorId; }
    public void setConductorId(Long conductorId) { this.conductorId = conductorId; }

    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
}


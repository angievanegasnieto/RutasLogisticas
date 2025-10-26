/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Logistica.delivery.view;

/**
 *
 * @author johan
 */




import java.time.LocalDate;

import Logistica.Entity.EstadoPedido;

/**
 * Filtro para listar/exportar pedidos entregados.
 * Todos los campos son opcionales; si van null, no filtran.
 */
public class PedidosFiltro {

    // Texto libre
    private String cliente;
    private String destino;

    // Rango de fecha de entrega (inclusive)
    private LocalDate desde;
    private LocalDate hasta;

    // Filtros exactos
    private Long vehiculoId;
    private Long conductorId;

    // Estado del pedido (usa tu enum: PENDIENTE, EN_RUTA, ENTREGADO, ...)
    private EstadoPedido estado;

    // Si filtras por el conductor “dueño” del pedido vía email
    private String driverEmail;

    // --- getters & setters ---

    public String getCliente() { return cliente; }
    public void setCliente(String cliente) { this.cliente = cliente; }

    public String getDestino() { return destino; }
    public void setDestino(String destino) { this.destino = destino; }

    public LocalDate getDesde() { return desde; }
    public void setDesde(LocalDate desde) { this.desde = desde; }

    public LocalDate getHasta() { return hasta; }
    public void setHasta(LocalDate hasta) { this.hasta = hasta; }

    public Long getVehiculoId() { return vehiculoId; }
    public void setVehiculoId(Long vehiculoId) { this.vehiculoId = vehiculoId; }

    public Long getConductorId() { return conductorId; }
    public void setConductorId(Long conductorId) { this.conductorId = conductorId; }

    public EstadoPedido getEstado() { return estado; }
    public void setEstado(EstadoPedido estado) { this.estado = estado; }

    public String getDriverEmail() { return driverEmail; }
    public void setDriverEmail(String driverEmail) { this.driverEmail = driverEmail; }
}



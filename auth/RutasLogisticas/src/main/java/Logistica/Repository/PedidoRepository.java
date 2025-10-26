/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Interface.java to edit this template
 */
package Logistica.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import Logistica.Entity.Pedido;
import Logistica.Entity.EstadoPedido;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    // Para filtrar por estado en BD (usa tu enum)
    List<Pedido> findByEstado(EstadoPedido estado);

    // Si más adelante quieres búsquedas por texto:
    List<Pedido> findByClienteContainingIgnoreCase(String cliente);

    // Si tu entidad tiene estos campos y los usas:
    // List<Pedido> findByVehiculoId(Long vehiculoId);
    // List<Pedido> findByConductorId(Long conductorId);
}





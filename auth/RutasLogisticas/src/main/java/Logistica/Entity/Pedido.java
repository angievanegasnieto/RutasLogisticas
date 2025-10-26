/*
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Classes/Class.java to edit this template
 */
package Logistica.Entity;

/**
 *
 * @author johan
 */
// package com.logistics.delivery.model;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.Instant;
import lombok.Data;

@Data
@Entity
@Table(name = "pedidos")
public class Pedido {
  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private EstadoPedido estado; // PENDIENTE | EN_RUTA | ENTREGADO

  private String cliente;          // filtro LIKE
  private String destino;
  private Long vehiculoId;         // filtro =
  private Long conductorId;        // filtro =
  private BigDecimal costo;
  private Instant fechaEntrega;    // filtro rango

  // getters/setters...
}



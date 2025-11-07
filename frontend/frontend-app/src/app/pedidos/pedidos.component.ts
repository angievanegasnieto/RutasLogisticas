import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosService, Pedido } from './pedidos.service';

@Component({
  selector: 'app-pedidos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pedidos.component.html',
  styleUrls: ['./pedidos.component.scss']
})
export class PedidosComponent implements OnInit {
  pedidos: Pedido[] = [];
  modoEdicion: boolean = false;
  pedidoEditandoId: number | null = null;

  // ✅ modelo inicial con todos los campos necesarios
  nuevoPedido: Partial<Pedido> = {
    cliente: '',
    direccion: '',
    producto: '',
    cantidad: 1,
    fechaProgramada: '',
    ventanaInicio: '08:00:00',
    ventanaFin: '12:00:00',
    estado: 'PENDIENTE'
  };

  constructor(private pedidosService: PedidosService) {}

  ngOnInit(): void {
    this.cargarPedidos();
  }

  // ✅ carga la lista de pedidos
  cargarPedidos(): void {
    this.pedidosService.getAll().subscribe((data) => {
      this.pedidos = data;
    });
  }

  // ✅ crear pedido con validación mínima
  crearPedido(): void {
    if (
      !this.nuevoPedido.cliente?.trim() ||
      !this.nuevoPedido.direccion?.trim() ||
      !this.nuevoPedido.producto?.trim() ||
      !this.nuevoPedido.fechaProgramada
    ) {
      alert('Cliente, Dirección, Producto y Fecha son obligatorios.');
      return;
    }

    const payload: Pedido = {
      cliente: this.nuevoPedido.cliente.trim(),
      direccion: this.nuevoPedido.direccion.trim(),
      producto: this.nuevoPedido.producto.trim(),
      cantidad: this.nuevoPedido.cantidad ?? 1,
      fechaProgramada: this.nuevoPedido.fechaProgramada!,
      ventanaInicio: this.nuevoPedido.ventanaInicio ?? '08:00:00',
      ventanaFin: this.nuevoPedido.ventanaFin ?? '12:00:00',
      estado: this.nuevoPedido.estado ?? 'PENDIENTE'
    };

    this.pedidosService.create(payload).subscribe({
      next: () => {
        this.cargarPedidos();
        this.resetForm();
      },
      error: () => alert('Error al guardar el pedido.')
    });
  }

  // ✅ editar pedido existente
  editarPedido(pedido: Pedido): void {
    this.modoEdicion = true;
    this.pedidoEditandoId = pedido.id!;
    this.nuevoPedido = { ...pedido };
  }

  // ✅ actualizar pedido
  actualizarPedido(): void {
    if (!this.pedidoEditandoId) return;

    this.pedidosService.update(this.pedidoEditandoId, this.nuevoPedido).subscribe({
      next: () => {
        this.cargarPedidos();
        this.resetForm();
      },
      error: () => alert('Error al actualizar el pedido.')
    });
  }

  // ✅ eliminar pedido
  eliminarPedido(id: number): void {
    if (confirm('¿Seguro que deseas eliminar este pedido?')) {
      this.pedidosService.delete(id).subscribe(() => this.cargarPedidos());
    }
  }

  cancelarEdicion(): void {
    this.resetForm();
  }

  // ✅ limpia el formulario
  private resetForm(): void {
    this.modoEdicion = false;
    this.pedidoEditandoId = null;
    this.nuevoPedido = {
      cliente: '',
      direccion: '',
      producto: '',
      cantidad: 1,
      fechaProgramada: '',
      ventanaInicio: '08:00:00',
      ventanaFin: '12:00:00',
      estado: 'PENDIENTE'
    };
  }
}

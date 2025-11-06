import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidosService } from '../../core/pedidos.service';
import { Pedido, EstadoPedido } from '../../core/models';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-pedidos',
  imports: [NgIf, NgFor, FormsModule, DatePipe, RouterLink],
  template: `
    <div class="container">
      <!-- Header con filtros -->
      <div class="card" style="margin-bottom: 20px;">
        <div style="text-align: center; margin-bottom: 15px;">
          <h2 style="margin: 0 0 10px;">📦 Estado de pedido</h2>
          <p class="badge">Sistema de notificaciones y seguimiento</p>
        </div>
        
        <!-- Filtros -->
        <div class="row" style="margin-top: 15px;">
          <div class="col">
            <select class="input" [(ngModel)]="filtroEstado" (change)="filtrarPedidos()">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ASIGNADO">Asignado</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="FALLIDO">Fallido</option>
              <option value="REINTENTO">Reintento</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="card">
        <p style="text-align: center; color: var(--muted);">Cargando pedidos...</p>
      </div>

      <!-- Lista de pedidos -->
      <div *ngIf="!cargando">
        <div *ngIf="pedidosFiltrados.length === 0" class="card">
          <p style="text-align: center; color: var(--muted);">No hay pedidos para mostrar</p>
        </div>
        
        <div *ngFor="let pedido of pedidosFiltrados" class="card pedido-card" style="margin-bottom: 15px;">
          <div class="pedido-header">
            <div class="pedido-info">
              <h3 style="margin: 0; color: var(--text);">Pedido #{{pedido.id}}</h3>
              <p style="margin: 4px 0; color: var(--muted);">{{pedido.clienteNombre}}</p>
              <p style="margin: 4px 0; color: var(--muted); font-size: 14px;">📍 {{pedido.direccionCompleta}}</p>
            </div>
            <div class="pedido-estado">
              <span class="badge-estado" [style.background-color]="getEstadoColor(pedido.estado)">
                {{getEstadoTexto(pedido.estado)}}
              </span>
            </div>
          </div>
          
          <div class="pedido-detalles" style="margin-top: 15px;">
            <div class="row">
              <div class="col">
                <small style="color: var(--muted);">📦 Volumen: {{pedido.volumen}} m³</small>
              </div>
              <div class="col">
                <small style="color: var(--muted);">⚖️ Peso: {{pedido.peso}} kg</small>
              </div>
              <div class="col">
                <small style="color: var(--muted);">📅 {{pedido.fechaProgramada | date:'short'}}</small>
              </div>
            </div>
          </div>

          <!-- Acciones para cambiar estado -->
          <div class="pedido-acciones" style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(148,163,184,.15);">
            <div class="row">
              <div class="col">
                <select class="input" style="font-size: 14px;" 
                        [value]="pedido.estado" 
                        (change)="cambiarEstado(pedido.id, $event)">
                  <option value="PENDIENTE">Pendiente</option>
                  <option value="ASIGNADO">Asignado</option>
                  <option value="EN_RUTA">En Ruta</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="FALLIDO">Fallido</option>
                  <option value="REINTENTO">Reintento</option>
                </select>
              </div>
              <div class="col">
                <button class="btn btn-sm" (click)="verDetalle(pedido.id)">Ver Detalle</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Detalle del pedido (modal) -->
      <div *ngIf="mostrarModalDetalle" class="modal">
        <div class="modal-contenido">
          <span class="cerrar" (click)="cerrarModalDetalle()">&times;</span>
          <h3>Detalle del Pedido #{{pedidoSeleccionado?.id}}</h3>
          <div *ngIf="pedidoSeleccionado" class="detalle-pedido">
            <div class="seccion-detalle">
              <h4>📦 Información del Pedido</h4>
              <p><strong>Cliente:</strong> {{pedidoSeleccionado.clienteNombre || 'N/A'}}</p>
              <p><strong>Dirección:</strong> {{pedidoSeleccionado.direccionCompleta || 'N/A'}}</p>
              <p><strong>Ciudad:</strong> {{pedidoSeleccionado.ciudad || 'N/A'}}</p>
              <p><strong>Estado:</strong> 
                <span class="badge-estado" [style.background-color]="getEstadoColor(pedidoSeleccionado.estado)">
                  {{getEstadoTexto(pedidoSeleccionado.estado)}}
                </span>
              </p>
              <p><strong>Volumen:</strong> {{pedidoSeleccionado.volumen}} m³</p>
              <p><strong>Peso:</strong> {{pedidoSeleccionado.peso}} kg</p>
              <p><strong>Fecha Programada:</strong> {{pedidoSeleccionado.fechaProgramada | date:'short'}}</p>
              <p *ngIf="pedidoSeleccionado.ventanaInicio && pedidoSeleccionado.ventanaFin">
                <strong>Ventana de entrega:</strong> {{pedidoSeleccionado.ventanaInicio}} - {{pedidoSeleccionado.ventanaFin}}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .pedido-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .pedido-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(2,6,23,.4), inset 0 0 0 1px rgba(255,255,255,.06);
    }
    
    .pedido-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .pedido-info {
      flex: 1;
    }
    
    .pedido-estado {
      flex-shrink: 0;
    }
    
    .badge-estado {
      padding: 6px 12px;
      border-radius: 20px;
      color: white;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .btn-sm {
      padding: 8px 12px;
      font-size: 14px;
    }
    
    .row {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .col {
      flex: 1;
    }
    
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.85);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    
    .modal-contenido {
      background: linear-gradient(135deg, #0a0e1a 0%, #151b2e 100%);
      padding: 30px;
      border-radius: 16px;
      max-width: 600px;
      max-height: 85vh;
      overflow-y: auto;
      width: 90%;
      position: relative;
      border: 1px solid rgba(255, 255, 255, 0.06);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
      color: var(--text);
    }
    
    .modal-contenido h3 {
      color: var(--primary);
      margin-bottom: 24px;
      font-size: 24px;
      font-weight: 600;
      text-align: center;
    }
    
    .detalle-pedido {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .seccion-detalle {
      background: rgba(255, 255, 255, 0.02);
      padding: 20px;
      border-radius: 12px;
      border: 1px solid rgba(148, 163, 184, 0.1);
    }
    
    .seccion-detalle h4 {
      color: var(--primary);
      margin: 0 0 16px 0;
      font-size: 18px;
      font-weight: 600;
      border-bottom: 1px solid rgba(148, 163, 184, 0.1);
      padding-bottom: 8px;
    }
    
    .seccion-detalle p {
      color: var(--text);
      margin-bottom: 12px;
      line-height: 1.6;
      font-size: 15px;
    }
    
    .seccion-detalle p:last-child {
      margin-bottom: 0;
    }
    
    .seccion-detalle strong {
      color: var(--text-secondary);
      font-weight: 500;
      display: inline-block;
      min-width: 140px;
    }
    
    .cerrar {
      position: absolute;
      top: 15px;
      right: 15px;
      cursor: pointer;
      font-size: 24px;
      color: var(--muted);
      transition: all 0.2s ease;
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
    }
    
    .cerrar:hover {
      color: var(--text);
      background: rgba(255, 255, 255, 0.06);
      transform: rotate(90deg);
    }
    
    @media (max-width: 768px) {
      .pedido-header {
        flex-direction: column;
        gap: 10px;
      }
      
      .row {
        flex-direction: column;
        gap: 8px;
      }
    }
  `]
})
export class PedidosComponent implements OnInit {
  private pedidosService = inject(PedidosService);
  
  pedidos: Pedido[] = [];
  pedidosFiltrados: Pedido[] = [];
  cargando = false;
  
  // Modal detalle
  mostrarModalDetalle = false;
  pedidoSeleccionado: Pedido | null = null;
  
  filtroEstado: string = '';

  ngOnInit() {
    this.cargarPedidosPeriodicamente();
  }
  
  cargarPedidos() {
    this.cargando = true;
    this.pedidosService.obtenerPedidos().subscribe({
      next: (response: Pedido[]) => {
        console.log('Datos recibidos del backend:', response);
        this.pedidos = response || [];
        this.aplicarFiltro();
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar pedidos:', err.message);
        this.cargando = false;
      }
    });
  }
  
  aplicarFiltro() {
    if (!this.filtroEstado || this.filtroEstado === '') {
      this.pedidosFiltrados = [...this.pedidos];
    } else {
      this.pedidosFiltrados = this.pedidos.filter(pedido => pedido.estado === this.filtroEstado);
    }
    console.log('Filtro aplicado:', this.filtroEstado, 'Resultados:', this.pedidosFiltrados.length);
  }
  
  filtrarPedidos() {
    this.aplicarFiltro();
  }
  
  cambiarEstado(pedidoId: number, event: Event) {
    const nuevoEstado = (event.target as HTMLSelectElement).value as EstadoPedido;
    this.pedidosService.actualizarEstadoPedido(pedidoId, nuevoEstado).subscribe({
      next: () => {
        console.log(`Estado del pedido ${pedidoId} actualizado a ${nuevoEstado}`);
        this.cargarPedidos();
      },
      error: (err) => console.error('Error al actualizar estado:', err)
    });
  }
  
  verDetalle(pedidoId: number) {
    const pedido = this.pedidos.find((p: Pedido) => p.id === pedidoId);
    if (pedido) {
      this.pedidoSeleccionado = pedido;
      this.mostrarModalDetalle = true;
    }
  }
  
  cerrarModalDetalle() {
    this.mostrarModalDetalle = false;
    this.pedidoSeleccionado = null;
  }
  
  getEstadoColor(estado: EstadoPedido): string {
    return this.pedidosService.getEstadoColor(estado);
  }
  
  getEstadoTexto(estado: EstadoPedido): string {
    return this.pedidosService.getEstadoTexto(estado);
  }
  
  private cargarPedidosPeriodicamente() {
    this.cargarPedidos();
    setInterval(() => {
      this.cargarPedidos();
    }, 30000);
  }
}

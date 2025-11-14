import { Component, inject, OnInit } from '@angular/core';
import { NgIf, NgFor, DatePipe, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { PedidosService } from '../../core/pedidos.service';
import { RutasService } from '../../core/rutas.service';
import { Pedido, EstadoPedido, Ruta, ParadaRuta, EstadoParada } from '../../core/models';
import { HttpErrorResponse, HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/auth.service';
import { PedidosSimpleService } from '../../services/pedidos-simple.service';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-pedidos',
  imports: [CommonModule, FormsModule, DatePipe, RouterLink],
  template: `
    <div class="container">
      <!-- Header moderno -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <h2><i class="fas fa-box"></i> Estado de Pedidos</h2>
            <p>Gestiona tus entregas y actualiza estados</p>
          </div>
          <div class="header-badge">
            <i class="fas fa-user-tie"></i>
            <span>{{conductorNombre || 'Conductor'}}</span>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-card">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px; color: var(--primary);"></i>
        <p>Cargando información...</p>
      </div>

      <!-- Pedidos asignados -->
      <div *ngIf="!cargando && pedidosAsignados.length > 0" class="table-card">
        <div class="section-header">
          <h3><i class="fas fa-clipboard-list"></i> Pedidos Asignados</h3>
          <span class="count-badge">{{pedidosAsignados.length}} pedido(s)</span>
        </div>
        
        <div class="pedidos-grid">
          <div *ngFor="let pedido of pedidosAsignados" class="pedido-card-modern">
            <!-- Estados en dos columnas -->
            <div class="pedido-status-dual">
              <div class="status-column">
                <label class="status-label">Estado de Ruta</label>
                <span class="status-badge" [ngClass]="getEstadoRutaClass(pedido.estado)">
                  <i class="fas" [ngClass]="getEstadoRutaIcon(pedido.estado)"></i>
                  {{getEstadoRutaTexto(pedido.estado)}}
                </span>
              </div>
              <div class="status-column">
                <label class="status-label">Estado de Entrega</label>
                <span class="status-badge" [ngClass]="getEstadoEntregaClass(pedido.estado)">
                  <i class="fas" [ngClass]="getEstadoEntregaIcon(pedido.estado)"></i>
                  {{getEstadoEntregaTexto(pedido.estado)}}
                </span>
              </div>
            </div>
            
            <!-- Información del pedido -->
            <div class="pedido-body">
              <div class="pedido-id">
                <i class="fas fa-hashtag"></i>
                <span>Pedido #{{pedido.id}}</span>
              </div>
              
              <div class="pedido-detail">
                <i class="fas fa-user"></i>
                <span><strong>Cliente:</strong> {{pedido.clienteNombre || pedido.cliente || 'N/A'}}</span>
              </div>
              
              <div class="pedido-detail">
                <i class="fas fa-map-marker-alt"></i>
                <span><strong>Dirección:</strong> {{pedido.direccionCompleta || pedido.direccion || 'N/A'}}</span>
              </div>
              
              <div class="pedido-detail" *ngIf="pedido.ciudad">
                <i class="fas fa-city"></i>
                <span><strong>Ciudad:</strong> {{pedido.ciudad}}</span>
              </div>
              
              <div class="pedido-detail">
                <i class="fas fa-box"></i>
                <span><strong>Producto:</strong> {{pedido.producto || 'N/A'}}</span>
              </div>
              
              <div class="pedido-detail">
                <i class="fas fa-sort-numeric-up"></i>
                <span><strong>Cantidad:</strong> {{pedido.cantidad || 0}}</span>
              </div>
              
              <div class="pedido-detail">
                <i class="fas fa-calendar-alt"></i>
                <span><strong>Fecha:</strong> {{pedido.fechaProgramada | date: 'dd/MM/yyyy'}}</span>
              </div>
              
              <div class="pedido-detail" *ngIf="pedido.ventanaInicio && pedido.ventanaFin">
                <i class="fas fa-clock"></i>
                <span><strong>Ventana:</strong> {{pedido.ventanaInicio}} - {{pedido.ventanaFin}}</span>
              </div>
            </div>

            <!-- SECCIÓN 1: Iniciar Entrega (solo si está ASIGNADO) -->
            <div *ngIf="pedido.estado === 'ASIGNADO'" class="action-section">
              <div class="action-divider"></div>
              <h4 class="action-title"><i class="fas fa-play-circle"></i> Iniciar Entrega</h4>
              <button class="btn-action btn-start" (click)="iniciarEntrega(pedido.id)">
                <i class="fas fa-truck"></i> Iniciar Ruta
              </button>
            </div>

            <!-- SECCIÓN 2: Finalizar Entrega (solo si está EN_RUTA) -->
            <div *ngIf="pedido.estado === 'EN_RUTA'" class="action-section">
              <div class="action-divider"></div>
              <h4 class="action-title"><i class="fas fa-flag-checkered"></i> Finalizar Entrega</h4>
              <div class="action-buttons">
                <button class="btn-action btn-delivered" (click)="finalizarEntrega(pedido.id, 'ENTREGADO')">
                  <i class="fas fa-check-circle"></i> Entregado
                </button>
                <button class="btn-action btn-failed" (click)="finalizarEntrega(pedido.id, 'FALLIDO')">
                  <i class="fas fa-times-circle"></i> Fallido
                </button>
              </div>
            </div>

            <!-- Mensaje si ya está finalizado -->
            <div *ngIf="pedido.estado === 'ENTREGADO'" class="action-section">
              <div class="action-divider"></div>
              <div class="finalized-message success">
                <i class="fas fa-check-circle"></i>
                <span>Entrega completada exitosamente</span>
              </div>
            </div>

            <!-- Opción de reprogramar si está FALLIDO -->
            <div *ngIf="pedido.estado === 'FALLIDO'" class="action-section">
              <div class="action-divider"></div>
              <div class="finalized-message error">
                <i class="fas fa-exclamation-circle"></i>
                <span>Entrega marcada como fallida</span>
              </div>
              <button class="btn-action btn-reprogram" (click)="reprogramarPedido(pedido.id)">
                <i class="fas fa-calendar-alt"></i> Reprogramar
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay pedidos asignados -->
      <div *ngIf="!cargando && pedidosAsignados.length === 0 && !conductorId" class="empty-card">
        <i class="fas fa-user-slash" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>No se encontró un conductor asociado a tu usuario</p>
      </div>

      <div *ngIf="!cargando && pedidosAsignados.length === 0 && conductorId" class="empty-card">
        <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;"></i>
        <p>No tienes pedidos asignados en este momento</p>
      </div>

      <!-- Rutas del conductor -->
      <div *ngIf="!cargando && rutasDelConductor.length > 0">
        <div *ngFor="let ruta of rutasDelConductor" class="card ruta-card" style="margin-bottom: 20px;">
          <!-- Encabezado de la ruta -->
          <div class="ruta-header">
            <div class="ruta-info">
              <h3 style="margin: 0; color: var(--text);">🚚 Ruta #{{ruta.id}}</h3>
              <p style="margin: 4px 0; color: var(--muted);">📅 {{ruta.fechaRuta | date: 'dd/MM/yyyy'}}</p>
              <p style="margin: 4px 0; color: var(--muted);" *ngIf="ruta.vehiculoPlaca">
                🚗 Vehículo: {{ruta.vehiculoPlaca}}
              </p>
            </div>
            <div class="ruta-estado">
              <span class="badge-estado" [style.background-color]="getEstadoRutaColor(ruta.estado)">
                {{getEstadoRutaTexto(ruta.estado)}}
              </span>
            </div>
          </div>

          <!-- SECCIÓN 1: Control de inicio de ruta -->
          <div class="seccion-control" style="margin-top: 20px; padding: 20px; background: rgba(102,126,234,0.05); border-radius: 12px; border-left: 4px solid #667eea;">
            <h4 style="color: var(--text); margin: 0 0 12px;">🎯 Control de Ruta</h4>
            <div style="display: flex; align-items: center; gap: 12px;">
              <button *ngIf="ruta.estado === 'PLANIFICADA' || ruta.estado === 'ASIGNADA'" 
                      class="btn btn-primary" 
                      (click)="iniciarRuta(ruta.id)"
                      style="flex: 0 0 auto;">
                🚀 Iniciar Ruta
              </button>
              <div *ngIf="ruta.estado === 'EN_PROGRESO'" 
                   style="padding: 12px; background: rgba(56,239,125,0.1); border-radius: 8px; border: 1px solid rgba(56,239,125,0.3); flex: 1;">
                <p style="margin: 0; color: #38ef7d; font-weight: 600;">✅ Ruta en progreso - Actualiza el estado de cada pedido abajo</p>
              </div>
              <div *ngIf="ruta.estado === 'COMPLETADA'" 
                   style="padding: 12px; background: rgba(102,126,234,0.1); border-radius: 8px; border: 1px solid rgba(102,126,234,0.3); flex: 1;">
                <p style="margin: 0; color: #667eea; font-weight: 600;">🏁 Ruta completada</p>
              </div>
            </div>
          </div>

          <!-- SECCIÓN 2: Gestión de pedidos -->
          <div class="seccion-pedidos" style="margin-top: 20px; padding: 20px; background: rgba(255,255,255,0.02); border-radius: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h4 style="color: var(--text); margin: 0;">📦 Pedidos de la Ruta</h4>
              <span style="font-size: 14px; color: var(--muted);">
                {{contarPedidosEntregados(ruta)}} de {{ruta.paradas?.length || 0}} entregados
              </span>
            </div>

            <!-- Lista de pedidos -->
            <div *ngIf="!ruta.paradas || ruta.paradas.length === 0" 
                 style="padding: 20px; text-align: center; color: var(--muted);">
              No hay pedidos en esta ruta
            </div>

            <div *ngFor="let parada of ruta.paradas; let i = index" 
                 class="pedido-item" 
                 style="margin-bottom: 12px; padding: 16px; background: rgba(255,255,255,0.03); border-radius: 10px; border: 1px solid rgba(148,163,184,0.1);">
              
              <!-- Información del pedido -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 6px;">
                    <span style="background: #667eea; color: white; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">
                      #{{parada.secuencia}}
                    </span>
                    <span style="color: var(--text); font-weight: 600; font-size: 15px;">
                      {{parada.clienteNombre}}
                    </span>
                  </div>
                  <p style="margin: 4px 0; color: var(--muted); font-size: 14px;">
                    📍 {{parada.direccionCompleta}}, {{parada.ciudad}}
                  </p>
                  <p style="margin: 4px 0; color: var(--muted); font-size: 13px;" *ngIf="parada.pedidoId">
                    Pedido ID: {{parada.pedidoId}}
                  </p>
                </div>
                <span class="badge-estado-sm" [style.background-color]="getEstadoParadaColor(parada.estado)">
                  {{getEstadoParadaTexto(parada.estado)}}
                </span>
              </div>

              <!-- Botones de acción (solo si la ruta está EN_PROGRESO) -->
              <div *ngIf="ruta.estado === 'EN_PROGRESO' && parada.estado !== 'ENTREGADO'" 
                   style="display: flex; gap: 8px; flex-wrap: wrap; padding-top: 12px; border-top: 1px solid rgba(148,163,184,0.1);">
                <button class="btn-sm" 
                        style="background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);"
                        (click)="actualizarEstadoParada(ruta.id, parada.id, 'ENTREGADO')">
                  ✅ Marcar Entregado
                </button>
                <button class="btn-sm" 
                        style="background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);"
                        (click)="actualizarEstadoParada(ruta.id, parada.id, 'FALLIDO')">
                  ❌ Marcar Fallido
                </button>
                <button class="btn-sm" 
                        style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);"
                        (click)="actualizarEstadoParada(ruta.id, parada.id, 'REINTENTO')">
                  🔄 Marcar Reintento
                </button>
              </div>

              <!-- Nota si existe -->
              <div *ngIf="parada.nota" 
                   style="margin-top: 12px; padding: 10px; background: rgba(255,255,255,0.05); border-radius: 8px; border-left: 3px solid #667eea;">
                <p style="margin: 0; color: var(--muted); font-size: 13px;">📝 <strong>Nota:</strong> {{parada.nota}}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Mensaje si no hay rutas -->
      <div *ngIf="!cargando && rutasDelConductor.length === 0" class="card">
        <p style="text-align: center; color: var(--muted);">No hay rutas asignadas</p>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #667eea;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --card-bg: #1e1e1e;
      --border: rgba(148,163,184,0.15);
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }
    
    .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    
    .header-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(102,126,234,0.3); }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
    .header-text h2 { margin: 0 0 8px; font-size: 32px; font-weight: 800; color: white; display: flex; align-items: center; gap: 12px; }
    .header-text p { margin: 0; color: rgba(255,255,255,0.9); font-size: 16px; }
    .header-badge { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 12px; color: white; font-size: 18px; font-weight: 600; }
    
    .loading-card { background: var(--card-bg); border-radius: 20px; padding: 60px 20px; text-align: center; border: 1px solid var(--border); color: var(--text-muted); }
    
    .table-card { background: var(--card-bg); border-radius: 20px; padding: 32px; border: 1px solid var(--border); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .section-header h3 { margin: 0; color: var(--text); font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
    .count-badge { background: rgba(102,126,234,0.2); color: var(--primary); padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
    
    .pedidos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
    
    .pedido-card-modern { background: rgba(255,255,255,0.03); border-radius: 16px; padding: 24px; border: 1px solid var(--border); transition: all 0.3s ease; position: relative; overflow: hidden; }
    .pedido-card-modern:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(102,126,234,0.2); border-color: rgba(102,126,234,0.4); }
    
    .pedido-status-dual { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
    .status-column { display: flex; flex-direction: column; gap: 8px; }
    .status-label { font-size: 11px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .status-badge { display: inline-flex; align-items: center; justify-content: center; gap: 8px; padding: 10px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; white-space: nowrap; }
    .status-badge i { font-size: 14px; }
    .status-ruta-pendiente { background: rgba(148,163,184,0.2); color: #94a3b8; }
    .status-ruta-en-ruta { background: rgba(102,126,234,0.2); color: #667eea; }
    .status-ruta-finalizado { background: rgba(16,185,129,0.2); color: #10b981; }
    .status-entrega-pendiente { background: rgba(148,163,184,0.2); color: #94a3b8; }
    .status-entrega-entregado { background: rgba(16,185,129,0.2); color: #34d399; }
    .status-entrega-fallido { background: rgba(239,68,68,0.2); color: #f87171; }
    .status-entrega-reintento { background: rgba(245,158,11,0.2); color: #fbbf24; }
    
    .pedido-body { display: flex; flex-direction: column; gap: 12px; }
    .pedido-id { font-size: 18px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
    .pedido-detail { display: flex; align-items: flex-start; gap: 12px; color: var(--text); font-size: 14px; line-height: 1.6; }
    .pedido-detail i { color: var(--primary); font-size: 16px; flex-shrink: 0; margin-top: 2px; }
    .pedido-detail strong { color: var(--text-muted); margin-right: 4px; }
    
    .action-section { margin-top: 20px; }
    .action-divider { height: 1px; background: var(--border); margin-bottom: 16px; }
    .action-title { color: var(--text); font-size: 14px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px; text-transform: uppercase; letter-spacing: 0.5px; }
    
    .btn-action { width: 100%; padding: 14px 20px; border: none; border-radius: 12px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .btn-action:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
    .btn-action:active { transform: translateY(0); }
    .btn-action i { font-size: 18px; }
    
    .btn-start { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    .btn-start:hover { box-shadow: 0 4px 12px rgba(102,126,234,0.4); }
    
    .action-buttons { display: flex; flex-direction: column; gap: 10px; }
    .btn-delivered { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .btn-delivered:hover { box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
    .btn-failed { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
    .btn-failed:hover { box-shadow: 0 4px 12px rgba(239,68,68,0.4); }
    .btn-reprogram { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; margin-top: 12px; }
    .btn-reprogram:hover { box-shadow: 0 8px 24px rgba(245,158,11,0.4); }
    
    .finalized-message { padding: 14px 16px; border-radius: 12px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; margin-bottom: 12px; }
    .finalized-message.success { background: rgba(16,185,129,0.1); color: #10b981; border: 1px solid rgba(16,185,129,0.3); }
    .finalized-message.error { background: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3); }
    .finalized-message i { font-size: 20px; }
    
    .empty-card { background: var(--card-bg); border-radius: 20px; padding: 60px 20px; text-align: center; border: 1px solid var(--border); color: var(--text-muted); }
    .empty-card i { color: var(--text-muted); }
    
    .pedido-card, .ruta-card {
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
    
    .pedido-card:hover, .ruta-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 15px 40px rgba(2,6,23,.4), inset 0 0 0 1px rgba(255,255,255,.06);
    }
    
    .pedido-header, .ruta-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    
    .pedido-info, .ruta-info {
      flex: 1;
    }
    
    .pedido-estado, .ruta-estado {
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

    .badge-estado-sm {
      padding: 4px 10px;
      border-radius: 16px;
      color: white;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      color: white;
      font-weight: 500;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-sm:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .btn-sm:active {
      transform: translateY(0);
    }

    .btn, .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
    }

    .btn:hover, .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-success {
      background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
      color: white;
    }

    .btn-warning {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .btn-sm:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .row {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    .col {
      flex: 1;
    }
    
    @media (max-width: 768px) {
      .pedido-header, .ruta-header {
        flex-direction: column;
        gap: 10px;
      }
      
      .row {
        flex-direction: column;
        gap: 8px;
      }
      
      .parada-acciones {
        flex-direction: column !important;
      }
    }
  `]
})
export class PedidosComponent implements OnInit {
  private pedidosService = inject(PedidosService);
  private rutasService = inject(RutasService);
  private authService = inject(AuthService);
  private http = inject(HttpClient);
  private pedidosSimpleService = inject(PedidosSimpleService);
  
  rutasDelConductor: Ruta[] = [];
  pedidosAsignados: any[] = [];
  conductorId: number | null = null;
  conductorNombre: string = '';
  cargando = false;
  filtroEstado: string = '';

  ngOnInit() {
    this.cargarConductorYPedidos();
  }
  
  cargarConductorYPedidos() {
    this.cargando = true;
    const user = this.authService.user();
    
    if (!user) {
      console.error('No hay usuario logueado');
      this.cargando = false;
      return;
    }
    
    // Obtener conductor asociado al usuario
    this.http.get<any[]>('/api/conductores').subscribe({
      next: (conductores) => {
        const conductor = conductores.find(c => c.userId === user.id);
        
        if (conductor) {
          this.conductorId = conductor.id;
          this.conductorNombre = conductor.nombreCompleto;
          
          // Cargar pedidos asignados a este conductor
          this.cargarPedidosAsignados();
        } else {
          console.warn('No se encontró conductor asociado al usuario');
          this.cargando = false;
        }
      },
      error: (err) => {
        console.error('Error al obtener conductores:', err);
        this.cargando = false;
      }
    });
  }
  
  cargarPedidosAsignados() {
    if (!this.conductorId) {
      this.cargando = false;
      return;
    }
    
    this.pedidosSimpleService.getAll().subscribe({
      next: (pedidos) => {
        // Filtrar solo pedidos asignados a este conductor
        let pedidosFiltrados = pedidos.filter(p => p.conductorId === this.conductorId);
        
        // 🔥 ORDENAR: Primero los activos (ASIGNADO, EN_RUTA), luego los finalizados (ENTREGADO, FALLIDO)
        pedidosFiltrados.sort((a, b) => {
          const ordenPrioridad: Record<string, number> = {
            'EN_RUTA': 1,        // Máxima prioridad - está en proceso
            'ASIGNADO': 2,       // Segunda prioridad - listo para iniciar
            'FALLIDO': 3,        // Tercera prioridad - requiere reprogramación
            'ENTREGADO': 4       // Última prioridad - ya completado
          };
          
          const prioridadA = ordenPrioridad[a.estado] || 999;
          const prioridadB = ordenPrioridad[b.estado] || 999;
          
          return prioridadA - prioridadB;
        });
        
        this.pedidosAsignados = pedidosFiltrados;
        console.log('Pedidos asignados (ordenados por prioridad):', this.pedidosAsignados);
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar pedidos:', err);
        this.cargando = false;
      }
    });
  }
  
  cargarRutasYParadas() {
    this.cargando = true;
    
    if (!this.conductorId) {
      this.cargando = false;
      return;
    }
    
    const conductorId = this.conductorId;
    
    this.rutasService.obtenerRutasPorConductor(conductorId).subscribe({
      next: (rutas: Ruta[]) => {
        console.log('Rutas recibidas del backend:', rutas);
        this.rutasDelConductor = rutas || [];
        
        // Cargar paradas de cada ruta
        this.rutasDelConductor.forEach(ruta => {
          if (ruta.id) {
            this.rutasService.obtenerParadasDeRuta(ruta.id).subscribe({
              next: (paradas: ParadaRuta[]) => {
                ruta.paradas = paradas;
              },
              error: (err: HttpErrorResponse) => {
                console.error('Error al cargar paradas:', err.message);
              }
            });
          }
        });
        
        this.cargando = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error al cargar rutas:', err.message);
        this.cargando = false;
      }
    });
  }
  
  filtrarDatos() {
    // Implementar filtrado si es necesario
    this.cargarRutasYParadas();
  }
  
  iniciarRuta(rutaId: number) {
    this.rutasService.iniciarRuta(rutaId).subscribe({
      next: () => {
        console.log(`Ruta ${rutaId} iniciada`);
        this.cargarRutasYParadas();
      },
      error: (err) => console.error('Error al iniciar ruta:', err)
    });
  }
  
  actualizarEstadoParada(rutaId: number, paradaId: number, estado: string) {
    this.rutasService.actualizarEstadoParada(paradaId, estado as EstadoParada).subscribe({
      next: () => {
        console.log(`Estado de parada ${paradaId} actualizado a ${estado}`);
        
        // Verificar si todos los pedidos están entregados para finalizar la ruta automáticamente
        if (estado === 'ENTREGADO') {
          this.verificarYFinalizarRuta(rutaId);
        } else {
          this.cargarRutasYParadas();
        }
      },
      error: (err) => console.error('Error al actualizar estado de parada:', err)
    });
  }

  verificarYFinalizarRuta(rutaId: number) {
    // Recargar datos primero
    this.cargarRutasYParadas();
    
    // Esperar un momento para que se actualicen los datos
    setTimeout(() => {
      const ruta = this.rutasDelConductor.find(r => r.id === rutaId);
      
      if (ruta && ruta.paradas) {
        const todosEntregados = ruta.paradas.every(p => p.estado === 'ENTREGADO');
        
        if (todosEntregados && ruta.paradas.length > 0) {
          // Todos los pedidos están entregados, finalizar la ruta automáticamente
          this.rutasService.finalizarRuta(rutaId).subscribe({
            next: () => {
              console.log(`Ruta ${rutaId} finalizada automáticamente`);
              this.cargarRutasYParadas();
            },
            error: (err) => console.error('Error al finalizar ruta automáticamente:', err)
          });
        }
      }
    }, 1000);
  }

  contarPedidosEntregados(ruta: Ruta): number {
    if (!ruta.paradas) return 0;
    return ruta.paradas.filter(p => p.estado === 'ENTREGADO').length;
  }
  
  getEstadoRutaColor(estado: string): string {
    return this.rutasService.getEstadoRutaColor(estado);
  }
  
  getEstadoParadaColor(estado: string): string {
    return this.rutasService.getEstadoParadaColor(estado);
  }
  
  getEstadoParadaTexto(estado: string): string {
    return this.rutasService.getEstadoParadaTexto(estado);
  }
  
  // Estados de Ruta (columna izquierda)
  getEstadoRutaTexto(estado: string): string {
    if (estado === 'EN_RUTA') return 'En Ruta';
    if (estado === 'ENTREGADO') return 'Finalizado';
    return 'Pendiente';
  }
  
  getEstadoRutaClass(estado: string): string {
    if (estado === 'EN_RUTA') return 'status-ruta-en-ruta';
    if (estado === 'ENTREGADO') return 'status-ruta-finalizado';
    return 'status-ruta-pendiente';
  }
  
  getEstadoRutaIcon(estado: string): string {
    if (estado === 'EN_RUTA') return 'fa-truck';
    if (estado === 'ENTREGADO') return 'fa-flag-checkered';
    return 'fa-clock';
  }
  
  // Estados de Entrega (columna derecha)
  getEstadoEntregaTexto(estado: string): string {
    const estados: Record<string, string> = {
      'ENTREGADO': 'Entregado',
      'FALLIDO': 'Fallido'
    };
    return estados[estado] || 'Pendiente';
  }
  
  getEstadoEntregaClass(estado: string): string {
    const clases: Record<string, string> = {
      'ENTREGADO': 'status-entrega-entregado',
      'FALLIDO': 'status-entrega-fallido'
    };
    return clases[estado] || 'status-entrega-pendiente';
  }
  
  getEstadoEntregaIcon(estado: string): string {
    const iconos: Record<string, string> = {
      'ENTREGADO': 'fa-check-circle',
      'FALLIDO': 'fa-times-circle'
    };
    return iconos[estado] || 'fa-hourglass-half';
  }
  
  iniciarEntrega(pedidoId: number) {
    Swal.fire({
      title: '¿Iniciar entrega?',
      text: 'El estado de ruta cambiará a "En Ruta"',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-truck"></i> Sí, iniciar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-dark'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Registrar evento de inicio de ruta
        const evento = {
          pedidoId: pedidoId,
          conductorId: this.conductorId,
          tipoEvento: 'INICIO_RUTA',
          estadoAnterior: 'ASIGNADO',
          estadoNuevo: 'EN_RUTA'
        };
        
        this.http.post('http://localhost:8080/api/eventos-entrega', evento).subscribe({
          next: () => {
            // Actualizar estado del pedido
            this.http.patch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, { estado: 'EN_RUTA' }).subscribe({
              next: () => {
                Swal.fire({
                  icon: 'success',
                  title: '¡Entrega iniciada!',
                  text: 'El pedido está ahora en ruta',
                  confirmButtonColor: '#667eea',
                  timer: 2000,
                  showConfirmButton: true,
                  customClass: {
                    popup: 'swal-dark'
                  }
                });
                this.cargarPedidosAsignados();
              },
              error: (err) => {
                console.error('Error al iniciar pedido:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo iniciar la entrega. Inténtalo nuevamente.',
                  confirmButtonColor: '#dc2626',
                  customClass: {
                    popup: 'swal-dark'
                  }
                });
              }
            });
          },
          error: (err) => {
            console.error('Error al registrar evento:', err);
            // Intentar actualizar el pedido aunque falle el registro del evento
            this.http.patch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, { estado: 'EN_RUTA' }).subscribe({
              next: () => {
                this.cargarPedidosAsignados();
              }
            });
          }
        });
      }
    });
  }
  
  finalizarEntrega(pedidoId: number, estado: string) {
    const configuraciones: Record<string, any> = {
      'ENTREGADO': {
        title: '¿Pedido entregado?',
        text: '¿Confirmar que el pedido fue entregado exitosamente al cliente?',
        icon: 'success',
        confirmButtonColor: '#10b981',
        confirmButtonText: '<i class="fas fa-check-circle"></i> Sí, entregado',
        successTitle: '¡Entrega completada!',
        successText: 'El pedido ha sido marcado como entregado y finalizado'
      },
      'FALLIDO': {
        title: '¿Marcar como fallido?',
        text: 'Indica que no se pudo completar la entrega en este intento',
        icon: 'warning',
        confirmButtonColor: '#ef4444',
        confirmButtonText: '<i class="fas fa-times-circle"></i> Sí, fallido',
        successTitle: 'Entrega fallida',
        successText: 'El pedido ha sido marcado como fallido. Puedes reprogramarlo usando el botón "Reprogramar"'
      }
    };
    
    const config = configuraciones[estado];
    
    // ✅ CASO ESPECIAL: FALLIDO requiere nota obligatoria
    if (estado === 'FALLIDO') {
      Swal.fire({
        title: config.title,
        html: `
          <p style="color: #94a3b8; margin-bottom: 16px;">${config.text}</p>
          <div style="text-align: left; margin-top: 20px;">
            <label style="display: block; margin-bottom: 8px; color: #e2e8f0; font-weight: 600;">
              <i class="fas fa-comment-dots"></i> Motivo del fallo (obligatorio):
            </label>
            <textarea id="swal-nota-fallido" 
                      class="swal2-textarea" 
                      placeholder="Ej: Cliente no estaba, Dirección incorrecta, Negó recibir..."
                      style="width: 100%; min-height: 100px; background: rgba(15,23,42,0.6); border: 2px solid rgba(148,163,184,0.15); color: #e2e8f0; border-radius: 8px; padding: 12px; font-size: 14px;"></textarea>
          </div>
        `,
        icon: config.icon,
        showCancelButton: true,
        confirmButtonColor: config.confirmButtonColor,
        cancelButtonColor: '#6b7280',
        confirmButtonText: config.confirmButtonText,
        cancelButtonText: 'Cancelar',
        customClass: {
          popup: 'swal-dark'
        },
        preConfirm: () => {
          const nota = (document.getElementById('swal-nota-fallido') as HTMLTextAreaElement)?.value;
          if (!nota || nota.trim().length === 0) {
            Swal.showValidationMessage('Debes indicar el motivo del fallo');
            return false;
          }
          return { nota: nota.trim() };
        }
      }).then((result) => {
        if (result.isConfirmed && result.value) {
          const nota = result.value.nota;
          
          // Registrar evento con nota
          const evento = {
            pedidoId: pedidoId,
            conductorId: this.conductorId,
            tipoEvento: 'FALLIDO',
            estadoAnterior: 'EN_RUTA',
            estadoNuevo: 'FALLIDO',
            notas: nota
          };
          
          this.http.post('http://localhost:8080/api/eventos-entrega', evento).subscribe({
            next: () => {
              // Actualizar estado del pedido
              this.http.patch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, { estado: 'FALLIDO' }).subscribe({
                next: () => {
                  Swal.fire({
                    icon: 'info',
                    title: config.successTitle,
                    html: `<p>${config.successText}</p><p style="color: #94a3b8; margin-top: 8px; font-size: 14px;">Motivo: ${nota}</p>`,
                    confirmButtonColor: config.confirmButtonColor,
                    timer: 3000,
                    showConfirmButton: true,
                    customClass: {
                      popup: 'swal-dark'
                    }
                  });
                  this.cargarPedidosAsignados();
                },
                error: (err) => {
                  console.error('Error al finalizar pedido:', err);
                  Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudo actualizar el estado del pedido. Inténtalo nuevamente.',
                    confirmButtonColor: '#dc2626',
                    customClass: {
                      popup: 'swal-dark'
                    }
                  });
                }
              });
            },
            error: (err) => {
              console.error('Error al registrar evento:', err);
              // Intentar actualizar el pedido aunque falle el registro del evento
              this.http.patch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, { estado: 'FALLIDO' }).subscribe({
                next: () => {
                  this.cargarPedidosAsignados();
                }
              });
            }
          });
        }
      });
      return;
    }
    
    // ✅ CASO NORMAL: ENTREGADO (sin campos adicionales)
    Swal.fire({
      title: config.title,
      text: config.text,
      icon: config.icon,
      showCancelButton: true,
      confirmButtonColor: config.confirmButtonColor,
      cancelButtonColor: '#6b7280',
      confirmButtonText: config.confirmButtonText,
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-dark'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        // Registrar evento de entrega
        const evento = {
          pedidoId: pedidoId,
          conductorId: this.conductorId,
          tipoEvento: 'ENTREGADO',
          estadoAnterior: 'EN_RUTA',
          estadoNuevo: 'ENTREGADO'
        };
        
        this.http.post('http://localhost:8080/api/eventos-entrega', evento).subscribe({
          next: () => {
            // Actualizar estado del pedido
            this.http.patch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, { estado: 'ENTREGADO' }).subscribe({
              next: () => {
                Swal.fire({
                  icon: config.icon,
                  title: config.successTitle,
                  text: config.successText,
                  confirmButtonColor: config.confirmButtonColor,
                  timer: 2500,
                  showConfirmButton: true,
                  customClass: {
                    popup: 'swal-dark'
                  }
                });
                this.cargarPedidosAsignados();
              },
              error: (err) => {
                console.error('Error al finalizar pedido:', err);
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: 'No se pudo actualizar el estado del pedido. Inténtalo nuevamente.',
                  confirmButtonColor: '#dc2626',
                  customClass: {
                    popup: 'swal-dark'
                  }
                });
              }
            });
          },
          error: (err) => {
            console.error('Error al registrar evento:', err);
            // Intentar actualizar el pedido aunque falle el registro del evento
            this.http.patch(`http://localhost:8080/api/pedidos/${pedidoId}/estado`, { estado: 'ENTREGADO' }).subscribe({
              next: () => {
                this.cargarPedidosAsignados();
              }
            });
          }
        });
      }
    });
  }
  
  // 🔄 NUEVA FUNCIÓN: Reprogramar pedido fallido
  reprogramarPedido(pedidoId: number) {
    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0];
    
    Swal.fire({
      title: '📅 Reprogramar Entrega',
      html: `
        <p style="color: #94a3b8; margin-bottom: 16px;">Selecciona nueva fecha y horario para reintentar la entrega</p>
        <div style="text-align: left; margin-top: 20px;">
          <label style="display: block; margin-bottom: 8px; color: #e2e8f0; font-weight: 600;">
            <i class="fas fa-calendar"></i> Nueva fecha programada:
          </label>
          <input id="swal-fecha-reintento" 
                 type="date" 
                 min="${fechaMin}"
                 class="swal2-input" 
                 style="width: 100%; background: rgba(15,23,42,0.6); border: 2px solid rgba(148,163,184,0.15); color: #e2e8f0; border-radius: 8px; padding: 12px; font-size: 14px; margin-bottom: 12px;" />
          
          <label style="display: block; margin-bottom: 8px; color: #e2e8f0; font-weight: 600;">
            <i class="fas fa-clock"></i> Ventana de inicio:
          </label>
          <input id="swal-ventana-inicio" 
                 type="time" 
                 value="08:00"
                 class="swal2-input" 
                 style="width: 100%; background: rgba(15,23,42,0.6); border: 2px solid rgba(148,163,184,0.15); color: #e2e8f0; border-radius: 8px; padding: 12px; font-size: 14px; margin-bottom: 12px;" />
          
          <label style="display: block; margin-bottom: 8px; color: #e2e8f0; font-weight: 600;">
            <i class="fas fa-clock"></i> Ventana de fin:
          </label>
          <input id="swal-ventana-fin" 
                 type="time" 
                 value="12:00"
                 class="swal2-input" 
                 style="width: 100%; background: rgba(15,23,42,0.6); border: 2px solid rgba(148,163,184,0.15); color: #e2e8f0; border-radius: 8px; padding: 12px; font-size: 14px;" />
        </div>
      `,
      icon: 'info',
      showCancelButton: true,
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#6b7280',
      confirmButtonText: '<i class="fas fa-calendar-check"></i> Reprogramar',
      cancelButtonText: 'Cancelar',
      customClass: {
        popup: 'swal-dark'
      },
      width: '550px',
      preConfirm: () => {
        const fechaInput = (document.getElementById('swal-fecha-reintento') as HTMLInputElement)?.value;
        const ventanaInicio = (document.getElementById('swal-ventana-inicio') as HTMLInputElement)?.value;
        const ventanaFin = (document.getElementById('swal-ventana-fin') as HTMLInputElement)?.value;
        
        if (!fechaInput) {
          Swal.showValidationMessage('Debes seleccionar una nueva fecha');
          return false;
        }
        
        const fechaSeleccionada = new Date(fechaInput);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        fechaSeleccionada.setHours(0, 0, 0, 0);
        
        if (fechaSeleccionada < hoy) {
          Swal.showValidationMessage('La fecha no puede ser anterior a hoy');
          return false;
        }
        
        if (!ventanaInicio || !ventanaFin) {
          Swal.showValidationMessage('Debes especificar las ventanas de tiempo');
          return false;
        }
        
        return {
          fechaProgramada: fechaInput,
          ventanaInicio,
          ventanaFin
        };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        const { fechaProgramada, ventanaInicio, ventanaFin } = result.value;
        
        // Actualizar pedido con nueva fecha/hora y estado ASIGNADO
        const actualizacion = {
          fechaProgramada,
          ventanaInicio,
          ventanaFin,
          estado: 'ASIGNADO' // ✅ Volver a ASIGNADO para habilitar "Iniciar Ruta"
        };
        
        this.http.patch(`http://localhost:8080/api/pedidos/${pedidoId}/parcial`, actualizacion).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Pedido reprogramado!',
              html: `
                <p>El pedido ha sido reprogramado exitosamente:</p>
                <ul style="text-align: left; color: #94a3b8; margin-top: 12px;">
                  <li>Nueva fecha: <strong>${fechaProgramada}</strong></li>
                  <li>Ventana: <strong>${ventanaInicio} - ${ventanaFin}</strong></li>
                </ul>
                <p style="margin-top: 12px; color: #94a3b8;">Ahora puedes iniciarlo nuevamente</p>
              `,
              confirmButtonColor: '#10b981',
              timer: 4000,
              showConfirmButton: true,
              customClass: {
                popup: 'swal-dark'
              }
            });
            this.cargarPedidosAsignados();
          },
          error: (err) => {
            console.error('Error al reprogramar pedido:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'No se pudo reprogramar el pedido. Inténtalo nuevamente.',
              confirmButtonColor: '#dc2626',
              customClass: {
                popup: 'swal-dark'
              }
            });
          }
        });
      }
    });
  }
  
  private cargarDatosPeriodicamente() {
    this.cargarConductorYPedidos();
    setInterval(() => {
      this.cargarConductorYPedidos();
    }, 30000); // Actualizar cada 30 segundos
  }
}

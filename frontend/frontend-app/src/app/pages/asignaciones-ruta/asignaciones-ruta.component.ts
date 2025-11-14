import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RutasService } from '../../core/rutas.service';
import { ConductoresService } from '../../core/conductores.service';
import { VehiculosService } from '../../core/vehiculos.service';
import { Ruta, Conductor, Vehiculo } from '../../core/models';

@Component({
  selector: 'app-asignaciones-ruta',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="card" style="margin-bottom: 20px; text-align: center;">
        <h2 style="margin: 0 0 10px; color: var(--text);">🗺️ Asignaciones de Rutas</h2>
        <p class="badge">Conductores y vehículos asignados a cada ruta</p>
      </div>

      <!-- Información sobre asignaciones -->
      <div class="card" style="margin-bottom:20px;background:linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%);border-left:4px solid #667eea;">
        <p style="margin:0;color:var(--text);"><strong>ℹ️ Información:</strong></p>
        <p style="margin:5px 0 0;color:var(--muted);">
          Las asignaciones de rutas se crean automáticamente cuando se planifica una ruta en el sistema de pedidos.
          Aquí puedes ver qué conductor y vehículo está asignado a cada ruta.
        </p>
      </div>

      <!-- Filtros -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="row">
          <select [(ngModel)]="filtroEstado" (change)="aplicarFiltros()" class="input">
            <option value="">Todos los estados</option>
            <option value="PLANIFICADA">Planificada</option>
            <option value="ASIGNADA">Asignada</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="PAUSADA">Pausada</option>
            <option value="COMPLETADA">Completada</option>
          </select>
          <select [(ngModel)]="filtroConductor" (change)="aplicarFiltros()" class="input">
            <option value="">Todos los conductores</option>
            <option *ngFor="let c of conductores()" [value]="c.id">{{c.nombreCompleto}}</option>
          </select>
          <select [(ngModel)]="filtroVehiculo" (change)="aplicarFiltros()" class="input">
            <option value="">Todos los vehículos</option>
            <option *ngFor="let v of vehiculos()" [value]="v.id">{{v.placa}}</option>
          </select>
          <button (click)="cargarDatos()" class="btn btn-success">
            🔄 Recargar
          </button>
        </div>
      </div>

      <!-- Estadísticas -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));gap:15px;margin-bottom:20px;">
        <div class="card stat-card" style="border-left:4px solid #667eea;">
          <div style="font-size:12px;color:var(--muted);margin-bottom:5px;">Total Rutas</div>
          <div style="font-size:24px;font-weight:bold;color:var(--text);">{{todasLasRutas().length}}</div>
        </div>
        <div class="card stat-card" style="border-left:4px solid #38ef7d;">
          <div style="font-size:12px;color:var(--muted);margin-bottom:5px;">Asignadas</div>
          <div style="font-size:24px;font-weight:bold;color:var(--text);">{{contarPorEstado('ASIGNADA')}}</div>
        </div>
        <div class="card stat-card" style="border-left:4px solid #FFA500;">
          <div style="font-size:12px;color:var(--muted);margin-bottom:5px;">En Progreso</div>
          <div style="font-size:24px;font-weight:bold;color:var(--text);">{{contarPorEstado('EN_PROGRESO')}}</div>
        </div>
        <div class="card stat-card" style="border-left:4px solid #32CD32;">
          <div style="font-size:12px;color:var(--muted);margin-bottom:5px;">Completadas</div>
          <div style="font-size:24px;font-weight:bold;color:var(--text);">{{contarPorEstado('COMPLETADA')}}</div>
        </div>
      </div>

      <!-- Tabla de asignaciones -->
      <div class="card">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="border-bottom:2px solid rgba(148,163,184,0.15);">
              <tr>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Ruta ID</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Fecha Ruta</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Conductor</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Vehículo</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Paradas</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="rutasFiltradas().length === 0">
                <td colspan="6" style="padding:20px;text-align:center;color:var(--muted);">
                  No hay asignaciones de rutas
                </td>
              </tr>
              <tr *ngFor="let r of rutasFiltradas()" style="border-bottom:1px solid rgba(148,163,184,0.1);">
                <td style="padding:12px;font-weight:500;color:var(--text);">{{r.id}}</td>
                <td style="padding:12px;color:var(--text);">{{r.fechaRuta | date: 'dd/MM/yyyy'}}</td>
                <td style="padding:12px;">
                  <div style="font-weight:500;color:var(--text);">{{r.conductorNombre || '-'}}</div>
                  <div style="font-size:12px;color:var(--muted);" *ngIf="r.conductorId">ID: {{r.conductorId}}</div>
                </td>
                <td style="padding:12px;">
                  <div style="font-weight:500;color:var(--text);">{{r.vehiculoPlaca || '-'}}</div>
                  <div style="font-size:12px;color:var(--muted);" *ngIf="r.vehiculoId">ID: {{r.vehiculoId}}</div>
                </td>
                <td style="padding:12px;text-align:center;">
                  <span class="badge-estado-sm" style="background:#667eea;">
                    {{r.paradas?.length || 0}}
                  </span>
                </td>
                <td style="padding:12px;text-align:center;">
                  <span class="badge-estado-sm" [style.background-color]="getEstadoBadgeColor(r.estado)">
                    {{getEstadoTexto(r.estado)}}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding:15px;border-top:1px solid rgba(148,163,184,0.1);color:var(--muted);font-size:14px;">
          📊 Mostrando {{rutasFiltradas().length}} de {{todasLasRutas().length}} asignaciones
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .stat-card {
      padding: 20px;
    }
    
    .input {
      width: 100%;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: var(--text);
      transition: all 0.2s;
    }
    
    .input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }
    
    .badge {
      display: inline-block;
      padding: 6px 16px;
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
      border-radius: 20px;
      color: var(--muted);
      font-size: 14px;
    }
    
    .badge-estado-sm {
      padding: 4px 10px;
      border-radius: 16px;
      color: white;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-block;
    }
    
    .btn {
      padding: 10px 20px;
      border-radius: 8px;
      border: none;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.2s;
      color: white;
    }
    
    .btn-success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    
    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(56, 239, 125, 0.4);
    }
    
    .row {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    
    @media (max-width: 768px) {
      .row {
        flex-direction: column;
      }
    }
  `]
})
export class AsignacionesRutaComponent implements OnInit {
  private rutasService = inject(RutasService);
  private conductoresService = inject(ConductoresService);
  private vehiculosService = inject(VehiculosService);
  
  todasLasRutas = signal<Ruta[]>([]);
  rutasFiltradas = signal<Ruta[]>([]);
  conductores = signal<Conductor[]>([]);
  vehiculos = signal<Vehiculo[]>([]);
  
  filtroEstado = '';
  filtroConductor = '';
  filtroVehiculo = '';

  ngOnInit() {
    this.cargarDatos();
  }

  cargarDatos() {
    // Cargar rutas
    this.rutasService.obtenerRutas().subscribe({
      next: (rutas) => {
        this.todasLasRutas.set(rutas);
        this.aplicarFiltros();
      },
      error: (err) => console.error('Error al cargar rutas:', err)
    });

    // Cargar conductores
    this.conductoresService.listar().subscribe({
      next: (conductores) => this.conductores.set(conductores),
      error: (err) => console.error('Error al cargar conductores:', err)
    });

    // Cargar vehículos
    this.vehiculosService.listar().subscribe({
      next: (vehiculos) => this.vehiculos.set(vehiculos),
      error: (err) => console.error('Error al cargar vehículos:', err)
    });
  }

  aplicarFiltros() {
    let rutas = this.todasLasRutas();

    if (this.filtroEstado) {
      rutas = rutas.filter(r => r.estado === this.filtroEstado);
    }

    if (this.filtroConductor) {
      const conductorId = Number(this.filtroConductor);
      rutas = rutas.filter(r => r.conductorId === conductorId);
    }

    if (this.filtroVehiculo) {
      const vehiculoId = Number(this.filtroVehiculo);
      rutas = rutas.filter(r => r.vehiculoId === vehiculoId);
    }

    this.rutasFiltradas.set(rutas);
  }

  contarPorEstado(estado: string): number {
    return this.todasLasRutas().filter(r => r.estado === estado).length;
  }

  getEstadoColor(estado: string) {
    const colores: { [key: string]: { bg: string, text: string } } = {
      'PLANIFICADA': { bg: '#e5e7eb', text: '#374151' },
      'ASIGNADA': { bg: '#dbeafe', text: '#1e40af' },
      'EN_PROGRESO': { bg: '#fed7aa', text: '#92400e' },
      'PAUSADA': { bg: '#fef3c7', text: '#78350f' },
      'COMPLETADA': { bg: '#d1fae5', text: '#065f46' }
    };
    return colores[estado] || { bg: '#f3f4f6', text: '#6b7280' };
  }

  getEstadoBadgeColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PLANIFICADA': '#94A3B8',
      'ASIGNADA': '#4169E1',
      'EN_PROGRESO': '#FFA500',
      'PAUSADA': '#FFD700',
      'COMPLETADA': '#32CD32'
    };
    return colores[estado] || '#6B7280';
  }

  getEstadoTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'PLANIFICADA': 'Planificada',
      'ASIGNADA': 'Asignada',
      'EN_PROGRESO': 'En Progreso',
      'PAUSADA': 'Pausada',
      'COMPLETADA': 'Completada'
    };
    return textos[estado] || estado;
  }
}

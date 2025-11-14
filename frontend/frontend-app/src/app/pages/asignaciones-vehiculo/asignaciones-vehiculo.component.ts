import { Component, inject, OnInit, signal } from '@angular/core';
import { NgIf, NgFor, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { HttpClient } from '@angular/common/http';

interface AsignacionVehiculo {
  id: number;
  conductorId: number;
  conductorNombre: string;
  conductorLicencia: string;
  vehiculoId: number;
  vehiculoPlaca: string;
  vehiculoModelo: string;
  fechaAsignacion: string;
  fechaFinalizacion?: string;
  estado: 'ACTIVA' | 'FINALIZADA';
  observaciones?: string;
}

interface Conductor {
  id: number;
  nombreCompleto: string;
  licencia: string;
  telefono: string;
  estado: string;
}

interface Vehiculo {
  id: number;
  placa: string;
  modelo: string;
  estado: string;
}

@Component({
  standalone: true,
  selector: 'app-asignaciones-vehiculo',
  imports: [NgIf, NgFor, FormsModule, DatePipe],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <h2><i class="fas fa-truck"></i> Asignación de Vehículos</h2>
            <p>Gestiona las asignaciones de vehículos a conductores</p>
          </div>
          <button class="btn-new" (click)="mostrarModalCrear()">
            <i class="fas fa-plus-circle"></i> Nueva Asignación
          </button>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-card">
        <select class="filter-select" [(ngModel)]="filtroEstado" (change)="filtrarDatos()">
          <option value="">Todas las asignaciones</option>
          <option value="ACTIVA">Solo activas</option>
          <option value="FINALIZADA">Solo finalizadas</option>
        </select>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando()" class="loading-state">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; color: var(--primary);"></i>
        <p style="margin-top: 16px;">Cargando asignaciones...</p>
      </div>

      <!-- Sin asignaciones -->
      <div *ngIf="!cargando() && asignacionesFiltradas().length === 0" class="empty-state">
        <i class="fas fa-inbox" style="font-size: 48px; color: var(--text-muted); margin-bottom: 16px;"></i>
        <p>
          {{ filtroEstado ? 
            (filtroEstado === 'ACTIVA' ? 'No hay asignaciones activas' : 'No hay asignaciones finalizadas') : 
            'No hay asignaciones registradas. Crea una nueva para comenzar.' 
          }}
        </p>
      </div>

      <!-- Lista de asignaciones -->
      <div *ngFor="let asignacion of asignacionesFiltradas()" class="asignacion-card">
        
        <!-- Header -->
        <div class="asignacion-header">
          <div class="conductor-info">
            <h3>
              <i class="fas fa-user-circle"></i> {{asignacion.conductorNombre}}
            </h3>
            <span class="licencia-badge">
              <i class="fas fa-id-card"></i> {{asignacion.conductorLicencia}}
            </span>
          </div>
          <span class="estado-badge" 
                [class.estado-activa]="asignacion.estado === 'ACTIVA'"
                [class.estado-finalizada]="asignacion.estado === 'FINALIZADA'">
            <i class="fas" [class.fa-check-circle]="asignacion.estado === 'ACTIVA'" [class.fa-times-circle]="asignacion.estado === 'FINALIZADA'"></i>
            {{asignacion.estado === 'ACTIVA' ? 'ACTIVA' : 'FINALIZADA'}}
          </span>
        </div>

        <!-- Vehículo -->
        <div class="vehiculo-section">
          <h4><i class="fas fa-car"></i> Vehículo Asignado</h4>
          <div class="vehiculo-grid">
            <div class="vehiculo-item">
              <label><i class="fas fa-hashtag"></i> Placa</label>
              <p>{{asignacion.vehiculoPlaca}}</p>
            </div>
            <div class="vehiculo-item">
              <label><i class="fas fa-cog"></i> Modelo</label>
              <p>{{asignacion.vehiculoModelo || 'No especificado'}}</p>
            </div>
          </div>
        </div>

        <!-- Fechas -->
        <div class="fechas-section">
          <div class="fecha-item">
            <label><i class="fas fa-calendar-plus"></i> Fecha Asignación</label>
            <p>{{asignacion.fechaAsignacion | date: 'dd/MM/yyyy HH:mm'}}</p>
          </div>
          <div class="fecha-item" *ngIf="asignacion.fechaFinalizacion">
            <label><i class="fas fa-calendar-check"></i> Fecha Finalización</label>
            <p>{{asignacion.fechaFinalizacion | date: 'dd/MM/yyyy HH:mm'}}</p>
          </div>
        </div>

        <!-- Observaciones -->
        <div *ngIf="asignacion.observaciones" class="observaciones-box">
          <p><strong><i class="fas fa-sticky-note"></i> Observaciones:</strong> {{asignacion.observaciones}}</p>
        </div>

        <!-- Acciones -->
        <div class="actions-section">
          <button *ngIf="asignacion.estado === 'ACTIVA'" 
                  class="btn-action btn-finalizar"
                  (click)="finalizarAsignacion(asignacion.id)">
            <i class="fas fa-flag-checkered"></i> Finalizar
          </button>
          <button class="btn-action btn-eliminar"
                  (click)="eliminarAsignacion(asignacion.id)">
            <i class="fas fa-trash-alt"></i> Eliminar
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #667eea;
      --primary-dark: #5568d3;
      --success: #38ef7d;
      --warning: #f59e0b;
      --danger: #e53e3e;
      --card-bg: #1e1e1e;
      --card-hover: #252525;
      --border: rgba(148,163,184,0.15);
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
      min-height: 100vh;
    }

    .header-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      padding: 32px;
      margin-bottom: 24px;
      box-shadow: 0 10px 40px rgba(102,126,234,0.3);
      position: relative;
      overflow: hidden;
    }

    .header-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(30%, -30%);
    }

    .header-content {
      position: relative;
      z-index: 1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }

    .header-text h2 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
    }

    .header-text p {
      margin: 0;
      color: rgba(255,255,255,0.9);
      font-size: 15px;
    }

    .btn-new {
      padding: 14px 28px;
      background: white;
      color: #667eea;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .btn-new:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(0,0,0,0.3);
    }

    .filters-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 20px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .filter-select {
      width: 100%;
      max-width: 300px;
      padding: 12px 16px;
      background: #2a2a2a;
      border: 1px solid var(--border);
      border-radius: 10px;
      color: var(--text);
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .filter-select:hover {
      border-color: var(--primary);
    }

    .filter-select:focus {
      outline: none;
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
    }

    .asignacion-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
      transition: all 0.3s ease;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }

    .asignacion-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0,0,0,0.2);
      border-color: rgba(102,126,234,0.3);
    }

    .asignacion-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 20px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--border);
    }

    .conductor-info h3 {
      margin: 0 0 8px;
      font-size: 20px;
      color: var(--text);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .licencia-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(102,126,234,0.1);
      border: 1px solid rgba(102,126,234,0.3);
      border-radius: 8px;
      color: var(--primary);
      font-size: 13px;
      font-weight: 500;
    }

    .estado-badge {
      padding: 8px 16px;
      border-radius: 10px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }

    .estado-activa {
      background: linear-gradient(135deg, #38ef7d 0%, #2ecc71 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(56,239,125,0.3);
    }

    .estado-finalizada {
      background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(148,163,184,0.2);
    }

    .vehiculo-section {
      background: linear-gradient(135deg, rgba(102,126,234,0.08) 0%, rgba(118,75,162,0.08) 100%);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      border-left: 4px solid var(--primary);
    }

    .vehiculo-section h4 {
      margin: 0 0 16px;
      color: var(--text);
      font-size: 16px;
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .vehiculo-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
    }

    .vehiculo-item label {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .vehiculo-item p {
      margin: 0;
      font-size: 15px;
      color: var(--text);
      font-weight: 600;
    }

    .fechas-section {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 16px;
    }

    .fecha-item {
      padding: 16px;
      background: rgba(255,255,255,0.02);
      border-radius: 10px;
      border: 1px solid var(--border);
    }

    .fecha-item label {
      display: block;
      font-size: 12px;
      color: var(--text-muted);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .fecha-item p {
      margin: 0;
      font-size: 15px;
      color: var(--text);
      font-weight: 500;
    }

    .observaciones-box {
      padding: 16px;
      background: rgba(102,126,234,0.05);
      border-radius: 10px;
      border-left: 3px solid var(--primary);
      margin-bottom: 20px;
    }

    .observaciones-box p {
      margin: 0;
      color: var(--text-muted);
      font-size: 14px;
      line-height: 1.6;
    }

    .observaciones-box strong {
      color: var(--primary);
    }

    .actions-section {
      display: flex;
      gap: 12px;
      padding-top: 20px;
      border-top: 1px solid var(--border);
    }

    .btn-action {
      padding: 12px 20px;
      border: none;
      border-radius: 10px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 8px;
    }

    .btn-finalizar {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(245,158,11,0.3);
    }

    .btn-finalizar:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(245,158,11,0.4);
    }

    .btn-eliminar {
      background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(229,62,62,0.3);
    }

    .btn-eliminar:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(229,62,62,0.4);
    }

    .empty-state {
      text-align: center;
      padding: 60px 20px;
      background: var(--card-bg);
      border: 2px dashed var(--border);
      border-radius: 16px;
    }

    .empty-state p {
      margin: 0;
      color: var(--text-muted);
      font-size: 16px;
    }

    .loading-state {
      text-align: center;
      padding: 60px 20px;
    }

    .loading-state p {
      margin: 0;
      color: var(--text-muted);
      font-size: 16px;
    }
  `]
})
export class AsignacionesVehiculoComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  asignaciones = signal<AsignacionVehiculo[]>([]);
  conductores = signal<Conductor[]>([]);
  vehiculos = signal<Vehiculo[]>([]);
  cargando = signal(true);
  
  filtroEstado = '';

  ngOnInit(): void {
    this.cargarDatos();
  }

  async cargarDatos(): Promise<void> {
    this.cargando.set(true);
    try {
      const [asignaciones, conductores, vehiculos] = await Promise.all([
        this.http.get<AsignacionVehiculo[]>(`${this.apiUrl}/asignaciones-vehiculo`).toPromise(),
        this.http.get<Conductor[]>(`${this.apiUrl}/conductores`).toPromise(),
        this.http.get<Vehiculo[]>(`${this.apiUrl}/vehiculos`).toPromise()
      ]);
      
      this.asignaciones.set(asignaciones || []);
      this.conductores.set((conductores || []).filter(c => c.estado === 'ACTIVO'));
      this.vehiculos.set((vehiculos || []).filter(v => v.estado === 'ACTIVO'));
    } catch (error) {
      console.error('Error cargando datos:', error);
      Swal.fire('Error', 'No se pudieron cargar los datos', 'error');
    } finally {
      this.cargando.set(false);
    }
  }

  asignacionesFiltradas(): AsignacionVehiculo[] {
    if (!this.filtroEstado) {
      return this.asignaciones();
    }
    return this.asignaciones().filter(a => a.estado === this.filtroEstado);
  }

  filtrarDatos(): void {
    // La vista se actualiza automáticamente con asignacionesFiltradas()
  }

  async mostrarModalCrear(): Promise<void> {
    const conductoresDisponibles = this.conductores().filter(c => {
      // Conductores sin asignación activa
      return !this.asignaciones().some(a => a.conductorId === c.id && a.estado === 'ACTIVA');
    });

    const vehiculosDisponibles = this.vehiculos().filter(v => {
      // Vehículos sin asignación activa
      return !this.asignaciones().some(a => a.vehiculoId === v.id && a.estado === 'ACTIVA');
    });

    if (conductoresDisponibles.length === 0) {
      Swal.fire('Sin conductores', 'Todos los conductores activos ya tienen vehículo asignado', 'warning');
      return;
    }

    if (vehiculosDisponibles.length === 0) {
      Swal.fire('Sin vehículos', 'Todos los vehículos activos ya están asignados', 'warning');
      return;
    }

    const conductorOptions = conductoresDisponibles.reduce((acc, c) => {
      acc[c.id] = `${c.nombreCompleto} (${c.licencia})`;
      return acc;
    }, {} as Record<number, string>);

    const vehiculoOptions = vehiculosDisponibles.reduce((acc, v) => {
      acc[v.id] = `${v.placa} - ${v.modelo || 'Sin modelo'}`;
      return acc;
    }, {} as Record<number, string>);

    const { value: formValues } = await Swal.fire({
      title: '<span style="color: #667eea;"><i class="fas fa-plus-circle"></i> Nueva Asignación</span>',
      html: `
        <div style="text-align: left; padding: 20px;">
          <div style="margin-bottom: 24px;">
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: #667eea; font-weight: 600; font-size: 15px;">
              <i class="fas fa-user-circle"></i> Conductor:
            </label>
            <select id="conductor" class="swal2-input" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; transition: all 0.3s; background: #f8fafc;">
              <option value="">Seleccione un conductor</option>
              ${Object.entries(conductorOptions).map(([id, nombre]) => 
                `<option value="${id}">${nombre}</option>`
              ).join('')}
            </select>
          </div>
          
          <div style="margin-bottom: 24px;">
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: #667eea; font-weight: 600; font-size: 15px;">
              <i class="fas fa-car"></i> Vehículo:
            </label>
            <select id="vehiculo" class="swal2-input" style="width: 100%; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; transition: all 0.3s; background: #f8fafc;">
              <option value="">Seleccione un vehículo</option>
              ${Object.entries(vehiculoOptions).map(([id, placa]) => 
                `<option value="${id}">${placa}</option>`
              ).join('')}
            </select>
          </div>
          
          <div style="margin-bottom: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: #667eea; font-weight: 600; font-size: 15px;">
              <i class="fas fa-sticky-note"></i> Observaciones <span style="color: #94a3b8; font-weight: 400; font-size: 13px;">(opcional)</span>:
            </label>
            <textarea id="observaciones" class="swal2-textarea" placeholder="Notas adicionales sobre la asignación..." 
              style="width: 100%; min-height: 100px; padding: 12px; border: 2px solid #e2e8f0; border-radius: 10px; font-size: 14px; resize: vertical; font-family: inherit; background: #f8fafc;"></textarea>
          </div>
        </div>
        <style>
          .swal2-input:focus, .swal2-textarea:focus {
            border-color: #667eea !important;
            box-shadow: 0 0 0 3px rgba(102,126,234,0.1) !important;
            outline: none;
          }
          .swal2-input:hover, .swal2-textarea:hover {
            border-color: #667eea !important;
          }
        </style>
      `,
      width: '600px',
      padding: '0',
      background: '#ffffff',
      backdrop: 'rgba(0,0,0,0.6)',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-check-circle"></i> Crear Asignación',
      cancelButtonText: '<i class="fas fa-times-circle"></i> Cancelar',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#94a3b8',
      customClass: {
        confirmButton: 'swal-confirm-btn',
        cancelButton: 'swal-cancel-btn'
      },
      preConfirm: () => {
        const conductorId = (document.getElementById('conductor') as HTMLSelectElement).value;
        const vehiculoId = (document.getElementById('vehiculo') as HTMLSelectElement).value;
        const observaciones = (document.getElementById('observaciones') as HTMLTextAreaElement).value;

        if (!conductorId || !vehiculoId) {
          Swal.showValidationMessage('<i class="fas fa-exclamation-triangle"></i> Debe seleccionar conductor y vehículo');
          return null;
        }

        return { conductorId: Number(conductorId), vehiculoId: Number(vehiculoId), observaciones };
      }
    });

    if (formValues) {
      await this.crearAsignacion(formValues);
    }
  }

  async crearAsignacion(data: { conductorId: number; vehiculoId: number; observaciones: string }): Promise<void> {
    try {
      await this.http.post(`${this.apiUrl}/asignaciones-vehiculo`, data).toPromise();
      Swal.fire('¡Éxito!', 'Asignación creada correctamente', 'success');
      await this.cargarDatos();
    } catch (error: any) {
      console.error('Error creando asignación:', error);
      const mensaje = error.error?.error || 'No se pudo crear la asignación';
      Swal.fire('Error', mensaje, 'error');
    }
  }

  async finalizarAsignacion(id: number): Promise<void> {
    const { value: observaciones } = await Swal.fire({
      title: '<span style="color: #f59e0b;"><i class="fas fa-flag-checkered"></i> Finalizar Asignación</span>',
      html: `
        <div style="text-align: left; padding: 20px;">
          <div style="background: linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(217,119,6,0.1) 100%); padding: 16px; border-radius: 12px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <p style="margin: 0; color: #78350f; font-size: 14px; line-height: 1.6;">
              <i class="fas fa-info-circle"></i> Esta acción marcará la asignación como finalizada. El conductor y el vehículo quedarán disponibles para nuevas asignaciones.
            </p>
          </div>
          <label style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px; color: #f59e0b; font-weight: 600; font-size: 15px;">
            <i class="fas fa-sticky-note"></i> Observaciones <span style="color: #94a3b8; font-weight: 400; font-size: 13px;">(opcional)</span>:
          </label>
          <textarea id="swal-input1" class="swal2-textarea" placeholder="Motivo de finalización, estado del vehículo, etc..." 
            style="width: 100%; min-height: 120px; padding: 12px; border: 2px solid #fef3c7; border-radius: 10px; font-size: 14px; resize: vertical; font-family: inherit; background: #fffbeb;"></textarea>
        </div>
        <style>
          #swal-input1:focus {
            border-color: #f59e0b !important;
            box-shadow: 0 0 0 3px rgba(245,158,11,0.1) !important;
            outline: none;
          }
        </style>
      `,
      input: 'textarea',
      inputValue: '',
      width: '600px',
      padding: '0',
      backdrop: 'rgba(0,0,0,0.6)',
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-check-circle"></i> Finalizar',
      cancelButtonText: '<i class="fas fa-times-circle"></i> Cancelar',
      confirmButtonColor: '#f59e0b',
      cancelButtonColor: '#94a3b8'
    });

    if (observaciones !== undefined) {
      try {
        await this.http.put(`${this.apiUrl}/asignaciones-vehiculo/${id}/finalizar`, { observaciones }).toPromise();
        Swal.fire('¡Finalizada!', 'La asignación ha sido finalizada', 'success');
        await this.cargarDatos();
      } catch (error: any) {
        console.error('Error finalizando asignación:', error);
        const mensaje = error.error?.error || 'No se pudo finalizar la asignación';
        Swal.fire('Error', mensaje, 'error');
      }
    }
  }

  async eliminarAsignacion(id: number): Promise<void> {
    const result = await Swal.fire({
      title: '<span style="color: #e53e3e;"><i class="fas fa-exclamation-triangle"></i> ¿Eliminar asignación?</span>',
      html: `
        <div style="text-align: center; padding: 20px;">
          <div style="background: linear-gradient(135deg, rgba(229,62,62,0.1) 0%, rgba(197,48,48,0.1) 100%); padding: 20px; border-radius: 12px; margin-bottom: 20px; border: 2px solid rgba(229,62,62,0.2);">
            <i class="fas fa-trash-alt" style="font-size: 48px; color: #e53e3e; margin-bottom: 12px;"></i>
            <p style="margin: 0; color: #7f1d1d; font-size: 15px; line-height: 1.6; font-weight: 500;">
              Esta acción <strong>no se puede deshacer</strong>.<br>
              La asignación será eliminada permanentemente del sistema.
            </p>
          </div>
        </div>
      `,
      icon: 'warning',
      width: '500px',
      padding: '0',
      backdrop: 'rgba(0,0,0,0.6)',
      showCancelButton: true,
      confirmButtonText: '<i class="fas fa-trash-alt"></i> Sí, eliminar',
      cancelButtonText: '<i class="fas fa-times-circle"></i> Cancelar',
      confirmButtonColor: '#e53e3e',
      cancelButtonColor: '#94a3b8',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await this.http.delete(`${this.apiUrl}/asignaciones-vehiculo/${id}`).toPromise();
        Swal.fire('¡Eliminada!', 'La asignación ha sido eliminada', 'success');
        await this.cargarDatos();
      } catch (error: any) {
        console.error('Error eliminando asignación:', error);
        const mensaje = error.error?.error || 'No se pudo eliminar la asignación';
        Swal.fire('Error', mensaje, 'error');
      }
    }
  }
}


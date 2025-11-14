import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VehiculosService } from '../../core/vehiculos.service';
import { Vehiculo } from '../../core/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-vehiculos',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <h2><i class="fas fa-truck-moving"></i> Gestión de Vehículos</h2>
            <p>Sistema de administración de vehículos</p>
          </div>
        </div>
      </div>

      <!-- Formulario de creación -->
      <div class="card" style="margin-bottom: 20px;">
        <h3 style="margin:0 0 15px; color: var(--text); font-size: 18px;"><i class="fas fa-plus-circle"></i> Nuevo Vehículo</h3>
        <form (ngSubmit)="crearVehiculo()" style="display:grid;gap:15px;grid-template-columns:repeat(auto-fit, minmax(200px, 1fr));">
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Placa *</label>
            <input [(ngModel)]="nuevaPlaca" name="placa" required class="input"
                   (blur)="validarPlacaDuplicada()">
            <small *ngIf="placaError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
              {{placaError}}
            </small>
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Modelo</label>
            <input [(ngModel)]="nuevoModelo" name="modelo" class="input">
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Capacidad Volumen (m³) *</label>
            <input [(ngModel)]="nuevaCapacidadVolumen" name="capacidadVolumen" type="number" step="0.1" required class="input">
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Capacidad Peso (kg) *</label>
            <input [(ngModel)]="nuevaCapacidadPeso" name="capacidadPeso" type="number" step="0.1" required class="input">
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Notas</label>
            <input [(ngModel)]="nuevasNotas" name="notas" class="input">
          </div>
          <div style="display:flex;align-items:flex-end;">
            <button type="submit" [disabled]="!nuevaPlaca || !nuevaCapacidadVolumen || !nuevaCapacidadPeso || placaError" 
                    class="btn btn-primary">
              <i class="fas fa-plus-circle"></i> Crear Vehículo
            </button>
          </div>
        </form>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="row">
          <div class="col">
            <input [(ngModel)]="filtro" placeholder="🔍 Buscar vehículo..." class="input">
          </div>
          <select [(ngModel)]="filtroEstado" (change)="cargarVehiculos()" class="input" style="max-width:200px;">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
          <button (click)="cargarVehiculos()" class="btn btn-success">
            <i class="fas fa-sync-alt"></i> Recargar
          </button>
        </div>
      </div>

      <!-- Tabla de vehículos -->
      <div class="card">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="border-bottom:2px solid rgba(148,163,184,0.15);">
              <tr>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">ID</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Placa</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Modelo</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Cap. Volumen</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Cap. Peso</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Notas</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Estado</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="vehiculosFiltrados().length === 0">
                <td colspan="8" style="padding:20px;text-align:center;color:var(--muted);">
                  No hay vehículos registrados
                </td>
              </tr>
              <tr *ngFor="let v of vehiculosFiltrados()" style="border-bottom:1px solid rgba(148,163,184,0.1);">
                <td style="padding:12px;color:var(--muted);">{{v.id}}</td>
                <td style="padding:12px;font-weight:500;color:var(--text);">{{v.placa}}</td>
                <td style="padding:12px;color:var(--text);">{{v.modelo || '-'}}</td>
                <td style="padding:12px;text-align:center;color:var(--text);">{{v.capacidadVolumen}} m³</td>
                <td style="padding:12px;text-align:center;color:var(--text);">{{v.capacidadPeso}} kg</td>
                <td style="padding:12px;max-width:200px;overflow:hidden;text-overflow:ellipsis;color:var(--text);">{{v.notas || '-'}}</td>
                <td style="padding:12px;text-align:center;">
                  <span class="badge-estado-sm" [style.background-color]="getEstadoBadgeColor(v.estado)">
                    {{v.estado}}
                  </span>
                </td>
                <td style="padding:12px;text-align:center;">
                  <button (click)="abrirModalEditar(v)" class="btn-sm btn-edit" style="margin-right:8px;">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button (click)="toggleEstado(v)" 
                          [class]="v.estado === 'ACTIVO' ? 'btn-sm btn-toggle-inactive' : 'btn-sm btn-toggle-active'">
                    <i [class]="v.estado === 'ACTIVO' ? 'fas fa-pause-circle' : 'fas fa-play-circle'"></i>
                    {{v.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding:15px;border-top:1px solid rgba(148,163,184,0.1);color:var(--muted);font-size:14px;">
          <i class="fas fa-chart-bar"></i> Total: {{vehiculos().length}} vehículos
          <span *ngIf="filtroEstado"> • Mostrando: {{filtroEstado}}</span>
        </div>
      </div>

      <!-- Modal de edición -->
      <div *ngIf="editandoVehiculo" class="modal-overlay" (click)="cerrarModalEditar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="margin:0;color:var(--text);"><i class="fas fa-edit"></i> Editar Vehículo</h3>
            <button (click)="cerrarModalEditar()" class="btn-close"><i class="fas fa-times"></i></button>
          </div>
          
          <form (ngSubmit)="guardarEdicion()" style="display:grid;gap:15px;">
            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Placa *</label>
              <input [(ngModel)]="editPlaca" name="editPlaca" required class="input"
                     (blur)="validarPlacaDuplicadaEdit()">
              <small *ngIf="editPlacaError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
                {{editPlacaError}}
              </small>
            </div>

            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Modelo</label>
              <input [(ngModel)]="editModelo" name="editModelo" class="input">
            </div>

            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Capacidad Volumen (m³) *</label>
              <input [(ngModel)]="editCapacidadVolumen" name="editCapacidadVolumen" type="number" step="0.1" required class="input">
            </div>

            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Capacidad Peso (kg) *</label>
              <input [(ngModel)]="editCapacidadPeso" name="editCapacidadPeso" type="number" step="0.1" required class="input">
            </div>

            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Notas</label>
              <input [(ngModel)]="editNotas" name="editNotas" class="input">
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
              <button type="button" (click)="cerrarModalEditar()" class="btn" 
                      style="background:rgba(148,163,184,0.2);color:var(--text);">
                <i class="fas fa-times-circle"></i> Cancelar
              </button>
              <button type="submit" [disabled]="!editPlaca || !editCapacidadVolumen || !editCapacidadPeso || editPlacaError"
                      class="btn btn-primary">
                <i class="fas fa-save"></i> Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 24px;
      max-width: 1400px;
      margin: 0 auto;
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
    }

    .header-text h2 {
      margin: 0 0 8px;
      font-size: 28px;
      font-weight: 700;
      color: white;
      text-shadow: 0 2px 10px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-text p {
      margin: 0;
      color: rgba(255,255,255,0.9);
      font-size: 15px;
    }
    
    .card {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 24px;
      box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.08);
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
    
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
    }
    
    .btn-success {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }
    
    .btn-success:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(56, 239, 125, 0.4);
    }
    
    .btn-sm {
      padding: 8px 16px;
      font-size: 13px;
      border-radius: 6px;
      cursor: pointer;
      border: none;
      transition: all 0.3s ease;
      color: white;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-sm:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }

    .btn-sm:active {
      transform: translateY(0);
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    .btn-icon {
      font-size: 14px;
    }
    
    .btn-edit {
      background: linear-gradient(135deg, #4a5568 0%, #2d3748 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-edit:hover {
      background: linear-gradient(135deg, #5a6678 0%, #3d4758 100%);
    }

    .btn-toggle-inactive {
      background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-toggle-inactive:hover {
      background: linear-gradient(135deg, #f54e4e 0%, #d53040 100%);
    }

    .btn-toggle-active {
      background: linear-gradient(135deg, #38a169 0%, #2f855a 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    .btn-toggle-active:hover {
      background: linear-gradient(135deg, #48b179 0%, #3f956a 100%);
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
      .row {
        flex-direction: column;
      }
    }

    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(4px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }

    .modal-content {
      background: rgba(30, 30, 50, 0.95);
      backdrop-filter: blur(20px);
      border-radius: 16px;
      padding: 30px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(255, 255, 255, 0.1);
      max-height: 90vh;
      overflow-y: auto;
    }

    .btn-close {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: var(--text);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      cursor: pointer;
      font-size: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }

    .btn-close:hover {
      background: rgba(238, 9, 121, 0.2);
      color: #ff6a00;
    }
  `]
})
export class VehiculosNuevoComponent implements OnInit {
  private service = inject(VehiculosService);
  
  vehiculos = signal<Vehiculo[]>([]);
  filtro = '';
  filtroEstado = '';
  
  // Formulario crear
  nuevaPlaca = '';
  nuevoModelo = '';
  nuevaCapacidadVolumen: number | null = null;
  nuevaCapacidadPeso: number | null = null;
  nuevasNotas = '';
  placaError = '';

  // Formulario editar
  editandoVehiculo: Vehiculo | null = null;
  editPlaca = '';
  editModelo = '';
  editCapacidadVolumen: number | null = null;
  editCapacidadPeso: number | null = null;
  editNotas = '';
  editPlacaError = '';

  ngOnInit() {
    this.cargarVehiculos();
  }

  validarPlacaDuplicada() {
    if (!this.nuevaPlaca) {
      this.placaError = '';
      return;
    }

    const duplicado = this.vehiculos().find(
      v => v.placa.toLowerCase() === this.nuevaPlaca.toLowerCase()
    );

    if (duplicado) {
      this.placaError = `⚠️ Ya existe un vehículo con esta placa (ID: ${duplicado.id})`;
    } else {
      this.placaError = '';
    }
  }

  cargarVehiculos() {
    const request = this.filtroEstado === 'ACTIVO' 
      ? this.service.listarActivos() 
      : this.service.listar();
    
    request.subscribe({
      next: (data) => this.vehiculos.set(data),
      error: (err) => console.error('Error al cargar vehículos:', err)
    });
  }

  vehiculosFiltrados() {
    const lista = this.vehiculos();
    if (!this.filtro) return lista;
    
    const f = this.filtro.toLowerCase();
    return lista.filter(v => 
      v.placa.toLowerCase().includes(f) ||
      (v.modelo && v.modelo.toLowerCase().includes(f)) ||
      (v.notas && v.notas.toLowerCase().includes(f))
    );
  }

  crearVehiculo() {
    if (!this.nuevaPlaca || !this.nuevaCapacidadVolumen || !this.nuevaCapacidadPeso) return;

    // Verificar placa duplicada
    const placaDuplicada = this.vehiculos().find(
      v => v.placa.toLowerCase() === this.nuevaPlaca.toLowerCase()
    );
    
    if (placaDuplicada) {
      Swal.fire({
        icon: 'warning',
        title: '¡Placa duplicada!',
        html: `Ya existe un vehículo con la placa <strong>${this.nuevaPlaca}</strong><br><small>ID: ${placaDuplicada.id} - Estado: ${placaDuplicada.estado}</small>`,
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const nuevo: Partial<Vehiculo> = {
      placa: this.nuevaPlaca,
      modelo: this.nuevoModelo || undefined,
      capacidadVolumen: this.nuevaCapacidadVolumen,
      capacidadPeso: this.nuevaCapacidadPeso,
      notas: this.nuevasNotas || undefined,
      estado: 'ACTIVO'
    };

    this.service.crear(nuevo).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Vehículo creado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.nuevaPlaca = '';
        this.nuevoModelo = '';
        this.nuevaCapacidadVolumen = null;
        this.nuevaCapacidadPeso = null;
        this.nuevasNotas = '';
        this.placaError = '';
        this.cargarVehiculos();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Error al crear vehículo: ' + (err.error?.message || err.message),
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  cambiarEstado(vehiculo: Vehiculo, nuevoEstado: 'ACTIVO' | 'INACTIVO') {
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar'} el vehículo ${vehiculo.placa}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.cambiarEstado(vehiculo.id, nuevoEstado).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Actualizado!',
              text: `Vehículo ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`,
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarVehiculos();
          },
          error: (err) => {
            Swal.fire({
              icon: 'error',
              title: '¡Error!',
              text: 'Error al cambiar estado: ' + (err.error?.message || err.message),
              confirmButtonColor: '#667eea'
            });
          }
        });
      }
    });
  }

  toggleEstado(vehiculo: Vehiculo) {
    const nuevoEstado = vehiculo.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    this.cambiarEstado(vehiculo, nuevoEstado);
  }

  abrirModalEditar(vehiculo: Vehiculo) {
    this.editandoVehiculo = vehiculo;
    this.editPlaca = vehiculo.placa;
    this.editModelo = vehiculo.modelo || '';
    this.editCapacidadVolumen = vehiculo.capacidadVolumen;
    this.editCapacidadPeso = vehiculo.capacidadPeso;
    this.editNotas = vehiculo.notas || '';
    this.editPlacaError = '';
  }

  cerrarModalEditar() {
    this.editandoVehiculo = null;
    this.editPlaca = '';
    this.editModelo = '';
    this.editCapacidadVolumen = null;
    this.editCapacidadPeso = null;
    this.editNotas = '';
    this.editPlacaError = '';
  }

  validarPlacaDuplicadaEdit() {
    if (!this.editPlaca || !this.editandoVehiculo) {
      this.editPlacaError = '';
      return;
    }

    const duplicado = this.vehiculos().find(
      v => v.id !== this.editandoVehiculo!.id && 
           v.placa.toLowerCase() === this.editPlaca.toLowerCase()
    );

    if (duplicado) {
      this.editPlacaError = `⚠️ Ya existe otro vehículo con esta placa (ID: ${duplicado.id})`;
    } else {
      this.editPlacaError = '';
    }
  }

  guardarEdicion() {
    if (!this.editandoVehiculo || !this.editPlaca || !this.editCapacidadVolumen || !this.editCapacidadPeso) return;

    const actualizado: Partial<Vehiculo> = {
      placa: this.editPlaca,
      modelo: this.editModelo || undefined,
      capacidadVolumen: this.editCapacidadVolumen,
      capacidadPeso: this.editCapacidadPeso,
      notas: this.editNotas || undefined
    };

    this.service.actualizar(this.editandoVehiculo.id, actualizado).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Vehículo actualizado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.cerrarModalEditar();
        this.cargarVehiculos();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Error al actualizar vehículo: ' + (err.error?.message || err.message),
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  getEstadoColor(estado: string) {
    switch(estado) {
      case 'ACTIVO': return { bg: '#d1fae5', text: '#065f46' };
      case 'INACTIVO': return { bg: '#fee2e2', text: '#991b1b' };
      case 'MANTENIMIENTO': return { bg: '#fef3c7', text: '#92400e' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  }

  getEstadoBadgeColor(estado: string): string {
    switch(estado) {
      case 'ACTIVO': return '#38ef7d';
      case 'INACTIVO': return '#ff6a00';
      case 'MANTENIMIENTO': return '#f5576c';
      default: return '#94A3B8';
    }
  }
}

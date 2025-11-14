import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConductoresService } from '../../core/conductores.service';
import { Conductor } from '../../core/models';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-conductores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="card" style="margin-bottom: 20px; text-align: center;">
        <h2 style="margin: 0 0 10px; color: var(--text);">👨‍✈️ Gestión de Conductores</h2>
        <p class="badge">Sistema de administración de conductores</p>
      </div>

      <!-- Formulario de creación -->
      <div class="card" style="margin-bottom: 20px;">
        <h3 style="margin:0 0 15px; color: var(--text); font-size: 18px;">➕ Nuevo Conductor</h3>
        <form (ngSubmit)="crearConductor()" style="display:grid;gap:15px;grid-template-columns:repeat(auto-fit, minmax(250px, 1fr));">
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Nombre Completo *</label>
            <input [(ngModel)]="nuevoNombre" name="nombre" required class="input" 
                   (blur)="validarNombreDuplicado()">
            <small *ngIf="nombreError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
              {{nombreError}}
            </small>
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Licencia *</label>
            <input [(ngModel)]="nuevaLicencia" name="licencia" required class="input"
                   (blur)="validarLicenciaDuplicada()">
            <small *ngIf="licenciaError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
              {{licenciaError}}
            </small>
          </div>
          <div>
            <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Teléfono (10 dígitos)</label>
            <input [(ngModel)]="nuevoTelefono" name="telefono" class="input" 
                   placeholder="Ej: 3001234567" maxlength="10"
                   (input)="validarTelefono($event)"
                   (blur)="validarTelefonoDuplicado()">
            <small *ngIf="telefonoError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
              {{telefonoError}}
            </small>
          </div>
          <div style="display:flex;align-items:flex-end;">
            <button type="submit" [disabled]="!nuevoNombre || !nuevaLicencia || nombreError || licenciaError || telefonoError" class="btn btn-primary">
              ✅ Crear Conductor
            </button>
          </div>
        </form>
      </div>

      <!-- Filtros y búsqueda -->
      <div class="card" style="margin-bottom: 20px;">
        <div class="row">
          <div class="col">
            <input [(ngModel)]="filtro" placeholder="🔍 Buscar conductor..." class="input">
          </div>
          <select [(ngModel)]="filtroEstado" (change)="cargarConductores()" class="input" style="max-width:200px;">
            <option value="">Todos los estados</option>
            <option value="ACTIVO">Activos</option>
            <option value="INACTIVO">Inactivos</option>
          </select>
          <button (click)="cargarConductores()" class="btn btn-success">
            🔄 Recargar
          </button>
        </div>
      </div>

      <!-- Tabla de conductores -->
      <div class="card">
        <div style="overflow-x:auto;">
          <table style="width:100%;border-collapse:collapse;">
            <thead style="border-bottom:2px solid rgba(148,163,184,0.15);">
              <tr>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">ID</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Nombre</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Licencia</th>
                <th style="text-align:left;padding:12px;font-weight:600;color:var(--muted);">Teléfono</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Estado</th>
                <th style="text-align:center;padding:12px;font-weight:600;color:var(--muted);">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngIf="conductoresFiltrados().length === 0">
                <td colspan="6" style="padding:20px;text-align:center;color:var(--muted);">
                  No hay conductores registrados
                </td>
              </tr>
              <tr *ngFor="let c of conductoresFiltrados()" style="border-bottom:1px solid rgba(148,163,184,0.1);">
                <td style="padding:12px;color:var(--muted);">{{c.id}}</td>
                <td style="padding:12px;font-weight:500;color:var(--text);">{{c.nombreCompleto}}</td>
                <td style="padding:12px;color:var(--text);">{{c.licencia}}</td>
                <td style="padding:12px;color:var(--text);">{{c.telefono || '-'}}</td>
                <td style="padding:12px;text-align:center;">
                  <span class="badge-estado-sm" [style.background-color]="c.estado === 'ACTIVO' ? '#38ef7d' : '#ff6a00'">
                    {{c.estado}}
                  </span>
                </td>
                <td style="padding:12px;text-align:center;">
                  <button (click)="abrirModalEditar(c)" class="btn-sm btn-edit" style="margin-right:8px;">
                    <span class="btn-icon">✏️</span> Editar
                  </button>
                  <button (click)="toggleEstado(c)" 
                          [class]="c.estado === 'ACTIVO' ? 'btn-sm btn-toggle-inactive' : 'btn-sm btn-toggle-active'">
                    <span class="btn-icon">{{c.estado === 'ACTIVO' ? '⏸️' : '▶️'}}</span>
                    {{c.estado === 'ACTIVO' ? 'Desactivar' : 'Activar'}}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style="padding:15px;border-top:1px solid rgba(148,163,184,0.1);color:var(--muted);font-size:14px;">
          📊 Total: {{conductores().length}} conductores
          <span *ngIf="filtroEstado"> • Mostrando: {{filtroEstado}}</span>
        </div>
      </div>

      <!-- Modal de edición -->
      <div *ngIf="editandoConductor" class="modal-overlay" (click)="cerrarModalEditar()">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="margin:0;color:var(--text);">✏️ Editar Conductor</h3>
            <button (click)="cerrarModalEditar()" class="btn-close">✕</button>
          </div>
          
          <form (ngSubmit)="guardarEdicion()" style="display:grid;gap:15px;">
            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Nombre Completo *</label>
              <input [(ngModel)]="editNombre" name="editNombre" required class="input"
                     (blur)="validarNombreDuplicadoEdit()">
              <small *ngIf="editNombreError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
                {{editNombreError}}
              </small>
            </div>

            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Licencia *</label>
              <input [(ngModel)]="editLicencia" name="editLicencia" required class="input"
                     (blur)="validarLicenciaDuplicadaEdit()">
              <small *ngIf="editLicenciaError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
                {{editLicenciaError}}
              </small>
            </div>

            <div>
              <label style="display:block;margin-bottom:5px;font-weight:500;color:var(--muted);">Teléfono (10 dígitos)</label>
              <input [(ngModel)]="editTelefono" name="editTelefono" class="input"
                     placeholder="Ej: 3001234567" maxlength="10"
                     (input)="validarTelefonoEdit($event)"
                     (blur)="validarTelefonoDuplicadoEdit()">
              <small *ngIf="editTelefonoError" style="color:#ff6a00;font-size:12px;margin-top:4px;display:block;">
                {{editTelefonoError}}
              </small>
            </div>

            <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
              <button type="button" (click)="cerrarModalEditar()" class="btn" 
                      style="background:rgba(148,163,184,0.2);color:var(--text);">
                Cancelar
              </button>
              <button type="submit" [disabled]="!editNombre || !editLicencia || editNombreError || editLicenciaError || editTelefonoError"
                      class="btn btn-primary">
                💾 Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
      max-width: 1200px;
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
export class ConductoresComponent implements OnInit {
  private service = inject(ConductoresService);
  
  conductores = signal<Conductor[]>([]);
  filtro = '';
  filtroEstado = '';
  
  // Formulario crear
  nuevoNombre = '';
  nuevaLicencia = '';
  nuevoTelefono = '';
  nombreError = '';
  licenciaError = '';
  telefonoError = '';

  // Formulario editar
  editandoConductor: Conductor | null = null;
  editNombre = '';
  editLicencia = '';
  editTelefono = '';
  editEstado: 'ACTIVO' | 'INACTIVO' = 'ACTIVO';
  editNombreError = '';
  editLicenciaError = '';
  editTelefonoError = '';

  ngOnInit() {
    this.cargarConductores();
  }

  validarNombreDuplicado() {
    if (!this.nuevoNombre) {
      this.nombreError = '';
      return;
    }

    const duplicado = this.conductores().find(
      c => c.nombreCompleto.toLowerCase() === this.nuevoNombre.toLowerCase()
    );

    if (duplicado) {
      this.nombreError = `⚠️ Ya existe un conductor con este nombre (ID: ${duplicado.id})`;
    } else {
      this.nombreError = '';
    }
  }

  validarLicenciaDuplicada() {
    if (!this.nuevaLicencia) {
      this.licenciaError = '';
      return;
    }

    const duplicado = this.conductores().find(
      c => c.licencia.toLowerCase() === this.nuevaLicencia.toLowerCase()
    );

    if (duplicado) {
      this.licenciaError = `⚠️ Ya existe un conductor con esta licencia (${duplicado.nombreCompleto})`;
    } else {
      this.licenciaError = '';
    }
  }

  validarTelefonoDuplicado() {
    if (!this.nuevoTelefono || this.nuevoTelefono.length !== 10) {
      return;
    }

    const duplicado = this.conductores().find(
      c => c.telefono === this.nuevoTelefono
    );

    if (duplicado) {
      this.telefonoError = `⚠️ Ya existe un conductor con este teléfono (${duplicado.nombreCompleto})`;
    }
  }

  validarTelefono(event: any) {
    const valor = event.target.value;
    
    // Solo permitir números
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    this.nuevoTelefono = soloNumeros;
    event.target.value = soloNumeros;
    
    // Validar longitud si hay algo escrito
    if (soloNumeros.length > 0 && soloNumeros.length < 10) {
      this.telefonoError = '⚠️ El teléfono debe tener exactamente 10 dígitos';
    } else if (soloNumeros.length > 10) {
      this.telefonoError = '⚠️ El teléfono no puede tener más de 10 dígitos';
    } else {
      this.telefonoError = '';
    }
  }

  cargarConductores() {
    const request = this.filtroEstado === 'ACTIVO' 
      ? this.service.listarActivos() 
      : this.service.listar();
    
    request.subscribe({
      next: (data) => this.conductores.set(data),
      error: (err) => console.error('Error al cargar conductores:', err)
    });
  }

  conductoresFiltrados() {
    const lista = this.conductores();
    if (!this.filtro) return lista;
    
    const f = this.filtro.toLowerCase();
    return lista.filter(c => 
      c.nombreCompleto.toLowerCase().includes(f) ||
      c.licencia.toLowerCase().includes(f) ||
      (c.telefono && c.telefono.toLowerCase().includes(f))
    );
  }

  crearConductor() {
    if (!this.nuevoNombre || !this.nuevaLicencia) return;

    // Validar teléfono si fue proporcionado
    if (this.nuevoTelefono && this.nuevoTelefono.length !== 10) {
      Swal.fire({
        icon: 'error',
        title: '¡Error de validación!',
        text: 'El teléfono debe tener exactamente 10 dígitos',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    // Verificar duplicados
    const nombreDuplicado = this.conductores().find(
      c => c.nombreCompleto.toLowerCase() === this.nuevoNombre.toLowerCase()
    );
    
    if (nombreDuplicado) {
      Swal.fire({
        icon: 'warning',
        title: '¡Conductor duplicado!',
        html: `Ya existe un conductor con el nombre <strong>${this.nuevoNombre}</strong><br><small>ID: ${nombreDuplicado.id} - Estado: ${nombreDuplicado.estado}</small>`,
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const licenciaDuplicada = this.conductores().find(
      c => c.licencia.toLowerCase() === this.nuevaLicencia.toLowerCase()
    );
    
    if (licenciaDuplicada) {
      Swal.fire({
        icon: 'warning',
        title: '¡Licencia duplicada!',
        html: `Ya existe un conductor con la licencia <strong>${this.nuevaLicencia}</strong><br><small>Conductor: ${licenciaDuplicada.nombreCompleto}</small>`,
        confirmButtonColor: '#667eea'
      });
      return;
    }

    if (this.nuevoTelefono) {
      const telefonoDuplicado = this.conductores().find(
        c => c.telefono === this.nuevoTelefono
      );
      
      if (telefonoDuplicado) {
        Swal.fire({
          icon: 'warning',
          title: '¡Teléfono duplicado!',
          html: `Ya existe un conductor con el teléfono <strong>${this.nuevoTelefono}</strong><br><small>Conductor: ${telefonoDuplicado.nombreCompleto}</small>`,
          confirmButtonColor: '#667eea'
        });
        return;
      }
    }

    const nuevo: Partial<Conductor> = {
      nombreCompleto: this.nuevoNombre,
      licencia: this.nuevaLicencia,
      telefono: this.nuevoTelefono || undefined,
      estado: 'ACTIVO'
    };

    this.service.crear(nuevo).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Conductor creado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.nuevoNombre = '';
        this.nuevaLicencia = '';
        this.nuevoTelefono = '';
        this.telefonoError = '';
        this.cargarConductores();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Error al crear conductor: ' + (err.error?.message || err.message),
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  toggleEstado(conductor: Conductor) {
    const nuevoEstado = conductor.estado === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO';
    
    Swal.fire({
      title: '¿Estás seguro?',
      text: `¿Deseas ${nuevoEstado === 'ACTIVO' ? 'activar' : 'desactivar'} al conductor ${conductor.nombreCompleto}?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Sí, cambiar estado',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.cambiarEstado(conductor.id, nuevoEstado).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Actualizado!',
              text: `Conductor ${nuevoEstado === 'ACTIVO' ? 'activado' : 'desactivado'} exitosamente`,
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarConductores();
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

  abrirModalEditar(conductor: Conductor) {
    this.editandoConductor = conductor;
    this.editNombre = conductor.nombreCompleto;
    this.editLicencia = conductor.licencia;
    this.editTelefono = conductor.telefono || '';
    this.editEstado = conductor.estado;
    this.editNombreError = '';
    this.editLicenciaError = '';
    this.editTelefonoError = '';
  }

  cerrarModalEditar() {
    this.editandoConductor = null;
    this.editNombre = '';
    this.editLicencia = '';
    this.editTelefono = '';
    this.editEstado = 'ACTIVO';
    this.editNombreError = '';
    this.editLicenciaError = '';
    this.editTelefonoError = '';
  }

  validarNombreDuplicadoEdit() {
    if (!this.editNombre || !this.editandoConductor) {
      this.editNombreError = '';
      return;
    }

    const duplicado = this.conductores().find(
      c => c.id !== this.editandoConductor!.id && 
           c.nombreCompleto.toLowerCase() === this.editNombre.toLowerCase()
    );

    if (duplicado) {
      this.editNombreError = `⚠️ Ya existe otro conductor con este nombre (ID: ${duplicado.id})`;
    } else {
      this.editNombreError = '';
    }
  }

  validarLicenciaDuplicadaEdit() {
    if (!this.editLicencia || !this.editandoConductor) {
      this.editLicenciaError = '';
      return;
    }

    const duplicado = this.conductores().find(
      c => c.id !== this.editandoConductor!.id && 
           c.licencia.toLowerCase() === this.editLicencia.toLowerCase()
    );

    if (duplicado) {
      this.editLicenciaError = `⚠️ Ya existe otro conductor con esta licencia (${duplicado.nombreCompleto})`;
    } else {
      this.editLicenciaError = '';
    }
  }

  validarTelefonoDuplicadoEdit() {
    if (!this.editTelefono || this.editTelefono.length !== 10 || !this.editandoConductor) {
      return;
    }

    const duplicado = this.conductores().find(
      c => c.id !== this.editandoConductor!.id && 
           c.telefono === this.editTelefono
    );

    if (duplicado) {
      this.editTelefonoError = `⚠️ Ya existe otro conductor con este teléfono (${duplicado.nombreCompleto})`;
    }
  }

  validarTelefonoEdit(event: any) {
    const valor = event.target.value;
    
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    this.editTelefono = soloNumeros;
    event.target.value = soloNumeros;
    
    if (soloNumeros.length > 0 && soloNumeros.length < 10) {
      this.editTelefonoError = '⚠️ El teléfono debe tener exactamente 10 dígitos';
    } else if (soloNumeros.length > 10) {
      this.editTelefonoError = '⚠️ El teléfono no puede tener más de 10 dígitos';
    } else {
      this.editTelefonoError = '';
    }
  }

  guardarEdicion() {
    if (!this.editandoConductor || !this.editNombre || !this.editLicencia) return;

    if (this.editTelefono && this.editTelefono.length !== 10) {
      Swal.fire({
        icon: 'error',
        title: '¡Error de validación!',
        text: 'El teléfono debe tener exactamente 10 dígitos',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const actualizado: Partial<Conductor> = {
      nombreCompleto: this.editNombre,
      licencia: this.editLicencia,
      telefono: this.editTelefono || undefined,
      estado: this.editEstado
    };

    this.service.actualizar(this.editandoConductor.id, actualizado).subscribe({
      next: () => {
        Swal.fire({
          icon: 'success',
          title: '¡Actualizado!',
          text: 'Conductor actualizado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
        this.cerrarModalEditar();
        this.cargarConductores();
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: '¡Error!',
          text: 'Error al actualizar conductor: ' + (err.error?.message || err.message),
          confirmButtonColor: '#667eea'
        });
      }
    });
  }
}

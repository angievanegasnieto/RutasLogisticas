import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Direccion {
  id?: number;
  etiqueta: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  pais: string;
  codigoPostal?: string;
  lat?: number;
  lng?: number;
  verificada?: boolean;
  precisionGeocodificacion?: string;
}

interface Cliente {
  id?: number;
  nombre: string;
  nit: string;
  correoContacto: string;
  telefonoContacto: string;
  direcciones: Direccion[];
}

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="header-card">
        <div class="header-content">
          <div>
            <h1><i class="fas fa-building"></i> Gestión de Clientes</h1>
            <p class="subtitle">Administra clientes y sus direcciones de entrega</p>
          </div>
          <button class="btn btn-primary" (click)="abrirModalCrear()">
            <i class="fas fa-plus-circle"></i> Nuevo Cliente
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <div class="search-container">
            <i class="fas fa-search search-icon"></i>
            <input 
              type="text" 
              class="search-input" 
              [(ngModel)]="busqueda" 
              placeholder="Buscar por nombre, NIT, correo o teléfono..."
            >
          </div>
          <button class="btn-refresh" (click)="cargarClientes()" title="Refrescar">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>

        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th><i class="fas fa-user"></i> Nombre</th>
                <th><i class="fas fa-id-card"></i> NIT</th>
                <th><i class="fas fa-envelope"></i> Correo</th>
                <th><i class="fas fa-phone"></i> Teléfono</th>
                <th><i class="fas fa-map-marker-alt"></i> Direcciones</th>
                <th><i class="fas fa-cog"></i> Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cliente of clientesFiltrados()">
                <td><strong>{{cliente.nombre}}</strong></td>
                <td>{{cliente.nit || 'N/A'}}</td>
                <td>{{cliente.correoContacto || 'N/A'}}</td>
                <td>{{cliente.telefonoContacto || 'N/A'}}</td>
                <td>
                  <span class="badge">
                    <i class="fas fa-map-marker-alt"></i> {{cliente.direcciones?.length || 0}}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action btn-edit" (click)="abrirModalEditar(cliente)" title="Editar">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" (click)="eliminarCliente(cliente.id!)" title="Eliminar">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                </td>
              </tr>
              <tr *ngIf="clientesFiltrados().length === 0">
                <td colspan="6" class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <p>No se encontraron clientes</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal Crear/Editar -->
      <div class="modal-backdrop" *ngIf="mostrarModal" (click)="cerrarModal()">
        <div class="modal-dialog" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h2>
              <i class="fas fa-{{modoEdicion ? 'edit' : 'plus-circle'}}"></i>
              {{modoEdicion ? 'Editar Cliente' : 'Nuevo Cliente'}}
            </h2>
            <button class="btn-close" (click)="cerrarModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>

          <div class="modal-body">
            <!-- Datos del cliente -->
            <div class="form-section">
              <h3><i class="fas fa-user-circle"></i> Información del Cliente</h3>
              <div class="form-grid">
                <div class="form-group full-width">
                  <label><i class="fas fa-user"></i> Nombre *</label>
                  <input type="text" class="form-input" [(ngModel)]="clienteForm.nombre" placeholder="Nombre completo del cliente">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-id-card"></i> NIT</label>
                  <input type="text" class="form-input" [(ngModel)]="clienteForm.nit" placeholder="123456789-0">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-envelope"></i> Correo de Contacto</label>
                  <input type="email" class="form-input" [(ngModel)]="clienteForm.correoContacto" placeholder="correo@ejemplo.com">
                </div>
                <div class="form-group">
                  <label><i class="fas fa-phone"></i> Teléfono de Contacto</label>
                  <input type="text" class="form-input" [(ngModel)]="clienteForm.telefonoContacto" placeholder="3001234567">
                </div>
              </div>
            </div>

            <!-- Direcciones -->
            <div class="form-section">
              <div class="section-header">
                <h3><i class="fas fa-map-marked-alt"></i> Direcciones de Entrega</h3>
                <button class="btn btn-secondary btn-sm" (click)="agregarDireccion()">
                  <i class="fas fa-plus"></i> Agregar Dirección
                </button>
              </div>

              <div class="direcciones-list">
                <div class="direccion-card" *ngFor="let dir of clienteForm.direcciones; let i = index">
                  <div class="direccion-header">
                    <span class="direccion-numero">
                      <i class="fas fa-map-marker-alt"></i> Dirección {{i + 1}}
                    </span>
                    <button class="btn-action btn-delete" (click)="eliminarDireccion(i)">
                      <i class="fas fa-trash-alt"></i>
                    </button>
                  </div>
                  <div class="form-grid">
                    <div class="form-group full-width">
                      <label><i class="fas fa-tag"></i> Etiqueta</label>
                      <input type="text" class="form-input" [(ngModel)]="dir.etiqueta" placeholder="Ej: Sede Principal, Bodega Norte...">
                    </div>
                    <div class="form-group full-width">
                      <label><i class="fas fa-map-marker-alt"></i> Dirección *</label>
                      <input type="text" class="form-input" [(ngModel)]="dir.direccion" placeholder="Calle 123 #45-67">
                    </div>
                    <div class="form-group">
                      <label><i class="fas fa-city"></i> Ciudad *</label>
                      <div class="input-geocode-group">
                        <input type="text" class="form-input" [(ngModel)]="dir.ciudad" placeholder="Bogotá">
                        <button type="button" class="btn-geocode" (click)="geocodificarDireccion(dir, i)" 
                                [disabled]="!dir.direccion || !dir.ciudad"
                                title="Obtener coordenadas GPS">
                          <i class="fas fa-map-pin"></i> Geocodificar
                        </button>
                      </div>
                      <div *ngIf="dir.lat && dir.lng" class="coordenadas-info">
                        <i class="fas fa-check-circle"></i>
                        Coordenadas: {{dir.lat}}, {{dir.lng}} 
                        <span class="precision-badge" [class]="'precision-' + dir.precisionGeocodificacion?.toLowerCase()">
                          {{dir.precisionGeocodificacion || 'N/A'}}
                        </span>
                      </div>
                    </div>
                    <div class="form-group">
                      <label><i class="fas fa-map"></i> Departamento</label>
                      <input type="text" class="form-input" [(ngModel)]="dir.departamento" placeholder="Cundinamarca">
                    </div>
                    <div class="form-group">
                      <label><i class="fas fa-globe"></i> País</label>
                      <input type="text" class="form-input" [(ngModel)]="dir.pais" placeholder="Colombia">
                    </div>
                    <div class="form-group">
                      <label><i class="fas fa-mailbox"></i> Código Postal</label>
                      <input type="text" class="form-input" [(ngModel)]="dir.codigoPostal" placeholder="110111">
                    </div>
                  </div>
                </div>

                <div *ngIf="clienteForm.direcciones.length === 0" class="empty-direcciones">
                  <i class="fas fa-map-marker-alt"></i>
                  <p>No hay direcciones agregadas. Haz clic en "Agregar Dirección" para comenzar.</p>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-cancel" (click)="cerrarModal()">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button class="btn btn-primary" (click)="guardarCliente()">
              <i class="fas fa-save"></i> Guardar Cliente
            </button>
          </div>
        </div>
      </div>
    </div>

    <style>
      .container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 24px;
      }

      /* Header Card con Gradiente */
      .header-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 16px;
        padding: 32px;
        margin-bottom: 24px;
        box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
      }

      .header-content {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 20px;
      }

      .header-card h1 {
        font-size: 32px;
        font-weight: 700;
        color: white;
        margin: 0 0 8px 0;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .subtitle {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        margin: 0;
      }

      /* Card Principal */
      .card {
        background: white;
        border-radius: 12px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        overflow: hidden;
      }

      .card-header {
        padding: 20px;
        border-bottom: 1px solid #e5e7eb;
        display: flex;
        gap: 12px;
        align-items: center;
      }

      /* Búsqueda */
      .search-container {
        flex: 1;
        position: relative;
      }

      .search-icon {
        position: absolute;
        left: 14px;
        top: 50%;
        transform: translateY(-50%);
        color: #9ca3af;
        font-size: 16px;
      }

      .search-input {
        width: 100%;
        padding: 12px 14px 12px 42px;
        border: 2px solid #e5e7eb;
        border-radius: 10px;
        font-size: 14px;
        transition: all 0.2s;
        background: #f9fafb;
      }

      .search-input:focus {
        outline: none;
        border-color: #667eea;
        background: white;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      .btn-refresh {
        padding: 12px 16px;
        background: #f3f4f6;
        border: none;
        border-radius: 10px;
        color: #6b7280;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 16px;
      }

      .btn-refresh:hover {
        background: #667eea;
        color: white;
        transform: rotate(90deg);
      }

      /* Tabla */
      .table-container {
        overflow-x: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th {
        background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
        padding: 16px;
        text-align: left;
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        border-bottom: 2px solid #e5e7eb;
      }

      .table th i {
        margin-right: 6px;
        color: #667eea;
      }

      .table td {
        padding: 16px;
        border-bottom: 1px solid #f3f4f6;
        color: #374151;
        font-size: 14px;
      }

      .table tbody tr {
        transition: all 0.2s;
      }

      .table tbody tr:hover {
        background: #f9fafb;
        transform: scale(1.01);
      }

      /* Badge */
      .badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
      }

      /* Botones de Acción */
      .action-buttons {
        display: flex;
        gap: 8px;
      }

      .btn-action {
        padding: 8px 12px;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
      }

      .btn-edit {
        background: #dbeafe;
        color: #1e40af;
      }

      .btn-edit:hover {
        background: #3b82f6;
        color: white;
        transform: translateY(-2px);
      }

      .btn-delete {
        background: #fee2e2;
        color: #dc2626;
      }

      .btn-delete:hover {
        background: #ef4444;
        color: white;
        transform: translateY(-2px);
      }

      /* Estado Vacío */
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        color: #9ca3af;
      }

      .empty-state i {
        font-size: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0;
        font-size: 16px;
      }

      /* Botones Principales */
      .btn {
        padding: 12px 24px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      .btn-primary {
        background: white;
        color: #667eea;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      }

      .btn-primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(0,0,0,0.2);
      }

      .btn-secondary {
        background: #e5e7eb;
        color: #374151;
      }

      .btn-secondary:hover {
        background: #d1d5db;
      }

      .btn-cancel {
        background: #f3f4f6;
        color: #6b7280;
      }

      .btn-cancel:hover {
        background: #e5e7eb;
      }

      .btn-sm {
        padding: 8px 16px;
        font-size: 13px;
      }

      /* Modal */
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
        animation: fadeIn 0.2s;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      .modal-dialog {
        background: white;
        border-radius: 16px;
        width: 100%;
        max-width: 1000px;
        max-height: 90vh;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        animation: slideUp 0.3s;
      }

      @keyframes slideUp {
        from {
          transform: translateY(30px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .modal-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px 28px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 24px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .btn-close {
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        cursor: pointer;
        padding: 8px;
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 8px;
        font-size: 20px;
        transition: all 0.2s;
      }

      .btn-close:hover {
        background: rgba(255,255,255,0.3);
        transform: rotate(90deg);
      }

      .modal-body {
        padding: 28px;
        overflow-y: auto;
        flex: 1;
      }

      /* Secciones del Formulario */
      .form-section {
        margin-bottom: 28px;
        padding: 20px;
        background: #f9fafb;
        border-radius: 12px;
        border: 1px solid #e5e7eb;
      }

      .form-section h3 {
        margin: 0 0 20px;
        font-size: 18px;
        font-weight: 700;
        color: #374151;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .form-section h3 i {
        color: #667eea;
      }

      .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
      }

      .section-header h3 {
        margin: 0;
      }

      /* Grid del Formulario */
      .form-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .form-group.full-width {
        grid-column: span 2;
      }

      .form-group label {
        font-size: 13px;
        font-weight: 600;
        color: #6b7280;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .form-group label i {
        color: #667eea;
        font-size: 12px;
      }

      .form-input {
        padding: 12px 14px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        transition: all 0.2s;
        background: white;
      }

      .form-input:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }

      /* Geocodificación */
      .input-geocode-group {
        display: flex;
        gap: 8px;
        align-items: stretch;
      }

      .input-geocode-group .form-input {
        flex: 1;
      }

      .btn-geocode {
        padding: 12px 16px;
        background: linear-gradient(135deg, #10b981 0%, #059669 100%);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 14px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(16, 185, 129, 0.3);
      }

      .btn-geocode:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);
      }

      .btn-geocode:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .coordenadas-info {
        margin-top: 8px;
        padding: 10px 12px;
        background: #d1fae5;
        color: #065f46;
        border-radius: 8px;
        font-size: 13px;
        display: flex;
        align-items: center;
        gap: 8px;
        border-left: 4px solid #10b981;
      }

      .coordenadas-info i {
        color: #10b981;
        font-size: 16px;
      }

      .precision-badge {
        display: inline-block;
        padding: 4px 10px;
        border-radius: 12px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        margin-left: 8px;
      }

      .precision-exacta {
        background: #10b981;
        color: white;
      }

      .precision-alta {
        background: #3b82f6;
        color: white;
      }

      .precision-media {
        background: #f59e0b;
        color: white;
      }

      .precision-baja, .precision-calle {
        background: #ef4444;
        color: white;
      }

      /* Lista de Direcciones */
      .direcciones-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .direccion-card {
        border: 2px solid #e5e7eb;
        border-radius: 12px;
        padding: 20px;
        background: white;
        transition: all 0.2s;
      }

      .direccion-card:hover {
        border-color: #667eea;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.1);
      }

      .direccion-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 2px solid #f3f4f6;
      }

      .direccion-numero {
        font-weight: 700;
        color: #667eea;
        font-size: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .empty-direcciones {
        text-align: center;
        padding: 40px 20px;
        color: #9ca3af;
        background: white;
        border-radius: 12px;
        border: 2px dashed #e5e7eb;
      }

      .empty-direcciones i {
        font-size: 48px;
        margin-bottom: 12px;
        opacity: 0.5;
      }

      .empty-direcciones p {
        margin: 0;
        font-size: 14px;
      }

      /* Footer del Modal */
      .modal-footer {
        padding: 20px 28px;
        border-top: 1px solid #e5e7eb;
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        background: #f9fafb;
      }

      /* Responsive */
      @media (max-width: 768px) {
        .header-content {
          flex-direction: column;
          align-items: stretch;
        }

        .form-grid {
          grid-template-columns: 1fr;
        }

        .form-group.full-width {
          grid-column: span 1;
        }

        .table {
          font-size: 12px;
        }

        .table th, .table td {
          padding: 12px 8px;
        }
      }
    </style>
  `,
  styles: []
})
export class ClientesComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api';

  clientes: Cliente[] = [];
  busqueda: string = '';
  mostrarModal: boolean = false;
  modoEdicion: boolean = false;

  clienteForm: Cliente = {
    nombre: '',
    nit: '',
    correoContacto: '',
    telefonoContacto: '',
    direcciones: []
  };

  ngOnInit() {
    this.cargarClientes();
  }

  cargarClientes() {
    this.http.get<Cliente[]>(`${this.apiUrl}/clientes`).subscribe({
      next: (data) => {
        this.clientes = data;
      },
      error: (err) => {
        console.error('Error al cargar clientes:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los clientes',
          confirmButtonColor: '#3b82f6'
        });
      }
    });
  }

  clientesFiltrados(): Cliente[] {
    if (!this.busqueda) return this.clientes;
    
    const f = this.busqueda.toLowerCase();
    return this.clientes.filter(c => 
      c.nombre.toLowerCase().includes(f) || 
      c.nit?.toLowerCase().includes(f) ||
      c.correoContacto?.toLowerCase().includes(f) ||
      c.telefonoContacto?.toLowerCase().includes(f)
    );
  }

  abrirModalCrear() {
    this.modoEdicion = false;
    this.clienteForm = {
      nombre: '',
      nit: '',
      correoContacto: '',
      telefonoContacto: '',
      direcciones: []
    };
    this.mostrarModal = true;
  }

  abrirModalEditar(cliente: Cliente) {
    this.modoEdicion = true;
    this.clienteForm = JSON.parse(JSON.stringify(cliente)); // Deep copy
    this.mostrarModal = true;
  }

  cerrarModal() {
    this.mostrarModal = false;
  }

  agregarDireccion() {
    this.clienteForm.direcciones.push({
      etiqueta: '',
      direccion: '',
      ciudad: '',
      departamento: '',
      pais: 'Colombia'
    });
  }

  eliminarDireccion(index: number) {
    this.clienteForm.direcciones.splice(index, 1);
  }

  guardarCliente() {
    // Validaciones
    if (!this.clienteForm.nombre.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Campo requerido',
        text: 'El nombre es obligatorio',
        confirmButtonColor: '#3b82f6'
      });
      return;
    }

    // Validar direcciones
    for (let dir of this.clienteForm.direcciones) {
      if (!dir.direccion.trim() || !dir.ciudad.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Direcciones incompletas',
          text: 'Todas las direcciones deben tener dirección y ciudad',
          confirmButtonColor: '#3b82f6'
        });
        return;
      }
    }

    if (this.modoEdicion) {
      // Actualizar
      this.http.put<Cliente>(`${this.apiUrl}/clientes/${this.clienteForm.id}`, this.clienteForm).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Actualizado!',
            text: 'Cliente actualizado correctamente',
            confirmButtonColor: '#3b82f6',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al actualizar cliente:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo actualizar el cliente',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
    } else {
      // Crear
      this.http.post<Cliente>(`${this.apiUrl}/clientes`, this.clienteForm).subscribe({
        next: () => {
          Swal.fire({
            icon: 'success',
            title: '¡Creado!',
            text: 'Cliente creado correctamente',
            confirmButtonColor: '#3b82f6',
            timer: 2000,
            showConfirmButton: false
          });
          this.cargarClientes();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al crear cliente:', err);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo crear el cliente',
            confirmButtonColor: '#3b82f6'
          });
        }
      });
    }
  }

  eliminarCliente(id: number) {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Se eliminará el cliente y sus direcciones (si no tienen pedidos asociados)',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.delete(`${this.apiUrl}/clientes/${id}`).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: '¡Eliminado!',
              text: 'Cliente eliminado correctamente',
              confirmButtonColor: '#3b82f6',
              timer: 2000,
              showConfirmButton: false
            });
            this.cargarClientes();
          },
          error: (err) => {
            console.error('Error al eliminar cliente:', err);
            if (err.status === 409) {
              Swal.fire({
                icon: 'error',
                title: 'No se puede eliminar',
                text: 'Este cliente tiene pedidos asociados',
                confirmButtonColor: '#3b82f6'
              });
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No se pudo eliminar el cliente',
                confirmButtonColor: '#3b82f6'
              });
            }
          }
        });
      }
    });
  }

  geocodificarDireccion(direccion: any, index: number) {
    if (!direccion.direccion || !direccion.ciudad) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Se requiere dirección y ciudad para geocodificar',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const body = {
      direccion: direccion.direccion,
      ciudad: direccion.ciudad,
      departamento: direccion.departamento || '',
      pais: direccion.pais || 'Colombia'
    };

    // Mostrar loading
    Swal.fire({
      title: 'Geocodificando...',
      text: 'Obteniendo coordenadas de la dirección',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    this.http.post<any>('http://localhost:8080/api/geocodificacion', body).subscribe({
      next: (resultado) => {
        Swal.close();
        
        if (resultado.exitoso) {
          direccion.lat = parseFloat(resultado.latitud);
          direccion.lng = parseFloat(resultado.longitud);
          direccion.verificada = true;
          direccion.precisionGeocodificacion = resultado.precision;
          
          Swal.fire({
            icon: 'success',
            title: '¡Ubicación encontrada!',
            html: `
              <p><strong>Lat:</strong> ${resultado.latitud}</p>
              <p><strong>Lng:</strong> ${resultado.longitud}</p>
              <p><strong>Precisión:</strong> ${resultado.precision}</p>
            `,
            confirmButtonColor: '#667eea',
            timer: 3000
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: resultado.error || 'No se pudo geocodificar la dirección',
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: (err) => {
        Swal.close();
        console.error('Error al geocodificar:', err);
        
        let mensaje = 'No se pudo conectar con el servicio de geocodificación';
        if (err.error?.error) {
          mensaje = err.error.error;
        }
        
        Swal.fire({
          icon: 'warning',
          title: 'No se pudo geocodificar',
          text: mensaje,
          footer: 'La dirección se guardará sin coordenadas',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }
}


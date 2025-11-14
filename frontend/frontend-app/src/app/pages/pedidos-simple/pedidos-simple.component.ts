import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidosSimpleService, Pedido } from '../../services/pedidos-simple.service';
import { ClienteService, Cliente, DireccionService, Direccion } from '../../services/cliente.service';
import { ConductoresService } from '../../core/conductores.service';
import { Conductor, AsignacionVehiculo } from '../../core/models';
import { LocationService } from '../../core/location.service';
import { MapComponent, MapMarker } from '../../shared/components/map/map.component';
import { AsignacionesService } from '../../core/asignaciones.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-pedidos-simple',
  standalone: true,
  imports: [CommonModule, FormsModule, MapComponent],
  template: `
    <div class="pedidos-container">
      <!-- Header -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <h2><i class="fas fa-box"></i> Gestión de Pedidos</h2>
            <p>Administra los pedidos y asignaciones de entrega</p>
          </div>
          <div class="header-badge">
            <i class="fas fa-truck"></i>
            <span>{{pedidos.length}} pedidos</span>
          </div>
        </div>
      </div>

      <!-- Formulario -->
      <div class="form-card">
        <h3><i class="fas fa-plus-circle"></i> {{modoEdicion ? 'Editar Pedido' : 'Nuevo Pedido'}}</h3>
        
        <form (ngSubmit)="modoEdicion ? actualizarPedido() : crearPedido()" class="modern-form">
          <div class="form-grid">
            <!-- Cliente -->
            <div class="form-group">
              <label>
                <i class="fas fa-user-tie"></i>
                <span>Cliente <span class="required">*</span></span>
              </label>
              <select [(ngModel)]="nuevoPedido.clienteId" name="clienteId" required (change)="onClienteChange()" class="form-select">
                <option [value]="undefined">Seleccionar cliente</option>
                <option *ngFor="let cliente of clientes" [value]="cliente.id">{{cliente.nombre}}</option>
              </select>
            </div>

            <!-- Dirección (readonly) -->
            <div class="form-group">
              <label>
                <i class="fas fa-map-marker-alt"></i>
                <span>Dirección <span class="required">*</span></span>
              </label>
              <input type="text" 
                     [value]="direccionSeleccionadaTexto" 
                     name="direccion" 
                     readonly 
                     placeholder="Se cargará al seleccionar cliente"
                     class="form-input readonly" />
              <span *ngIf="geocodificando" class="geocoding-badge">
                <i class="fas fa-spinner fa-spin"></i> Geocodificando...
              </span>
            </div>

            <!-- Producto -->
            <div class="form-group">
              <label>
                <i class="fas fa-tag"></i>
                <span>Producto</span>
              </label>
              <input type="text" [(ngModel)]="nuevoPedido.producto" name="producto" placeholder="Nombre del producto" class="form-input" />
            </div>

            <!-- Fecha -->
            <div class="form-group">
              <label>
                <i class="fas fa-calendar"></i>
                <span>Fecha Programada <span class="required">*</span></span>
              </label>
              <input type="date" [(ngModel)]="nuevoPedido.fechaProgramada" name="fechaProgramada" required class="form-input" />
            </div>

            <!-- Cantidad -->
            <div class="form-group">
              <label>
                <i class="fas fa-sort-numeric-up"></i>
                <span>Cantidad</span>
              </label>
              <input type="number" [(ngModel)]="nuevoPedido.cantidad" name="cantidad" min="1" placeholder="1" class="form-input" />
            </div>

            <!-- Ventana Inicio -->
            <div class="form-group">
              <label>
                <i class="fas fa-clock"></i>
                <span>Ventana Inicio</span>
              </label>
              <input type="time" [(ngModel)]="nuevoPedido.ventanaInicio" name="ventanaInicio" class="form-input" />
            </div>

            <!-- Ventana Fin -->
            <div class="form-group">
              <label>
                <i class="fas fa-clock"></i>
                <span>Ventana Fin</span>
              </label>
              <input type="time" [(ngModel)]="nuevoPedido.ventanaFin" name="ventanaFin" class="form-input" />
            </div>

            <!-- Volumen -->
            <div class="form-group">
              <label>
                <i class="fas fa-cube"></i>
                <span>Volumen (m³)</span>
              </label>
              <input type="number" [(ngModel)]="nuevoPedido.volumen" name="volumen" step="0.1" min="0" placeholder="0.0" class="form-input" />
            </div>

            <!-- Peso -->
            <div class="form-group">
              <label>
                <i class="fas fa-weight"></i>
                <span>Peso (kg)</span>
              </label>
              <input type="number" [(ngModel)]="nuevoPedido.peso" name="peso" step="0.1" min="0" placeholder="0.0" class="form-input" />
            </div>

            <!-- Conductor -->
            <div class="form-group">
              <label>
                <i class="fas fa-id-card"></i>
                <span>Conductor</span>
              </label>
              <select [(ngModel)]="nuevoPedido.conductorId" name="conductorId" class="form-select">
                <option [value]="undefined">Sin asignar</option>
                <option *ngFor="let c of conductores" [value]="c.id">
                  {{c.nombreCompleto}} - {{obtenerVehiculoConductor(c.id)}}
                </option>
              </select>
            </div>

            <!-- Estado (solo en edición) -->
            <div class="form-group" *ngIf="modoEdicion">
              <label>
                <i class="fas fa-flag"></i>
                <span>Estado <span class="required">*</span></span>
              </label>
              <select [(ngModel)]="nuevoPedido.estado" name="estado" class="form-select">
                <option value="PENDIENTE">Pendiente</option>
                <option value="ASIGNADO">Asignado</option>
                <option value="EN_RUTA">En Ruta</option>
                <option value="ENTREGADO">Entregado</option>
                <option value="FALLIDO">Fallido</option>
                <option value="REINTENTO">Reintento</option>
              </select>
            </div>
          </div>

          <div class="form-actions">
            <button *ngIf="modoEdicion" type="button" class="btn-cancel" (click)="cancelarEdicion()">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" 
                    [disabled]="!nuevoPedido.clienteId || !nuevoPedido.direccionId || !nuevoPedido.fechaProgramada"
                    [class.btn-update]="modoEdicion"
                    [class.btn-create]="!modoEdicion"
                    class="btn-submit">
              <i class="fas" [class.fa-save]="modoEdicion" [class.fa-plus-circle]="!modoEdicion"></i>
              {{modoEdicion ? 'Actualizar Pedido' : 'Crear Pedido'}}
            </button>
          </div>
        </form>

        <!-- Mapa -->
        <div *ngIf="mostrarMapa" class="map-section">
          <h4><i class="fas fa-map-marked-alt"></i> Ubicación de Entrega</h4>
          <app-map [markers]="mapMarkers" [height]="'350px'" [autoFitBounds]="true"></app-map>
        </div>
      </div>

      <!-- Lista de Pedidos -->
      <div class="pedidos-list">
        <h3><i class="fas fa-list"></i> Pedidos Registrados</h3>
        
        <div class="pedidos-grid">
          <div *ngFor="let p of pedidos" class="pedido-card">
            <div class="pedido-header">
              <div class="pedido-id">
                <i class="fas fa-hashtag"></i> {{p.id}}
              </div>
              <span class="estado-badge" [ngClass]="'estado-' + p.estado?.toLowerCase()">
                {{p.estado}}
              </span>
            </div>

            <div class="pedido-body">
              <div class="pedido-info">
                <div class="info-item">
                  <i class="fas fa-user"></i>
                  <span><strong>Cliente:</strong> {{p.clienteNombre || p.cliente}}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-map-marker-alt"></i>
                  <span><strong>Dirección:</strong> {{p.direccionCompleta || p.direccion}} - {{p.ciudad || '-'}}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-box"></i>
                  <span><strong>Producto:</strong> {{p.producto || '-'}}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-sort-numeric-up"></i>
                  <span><strong>Cantidad:</strong> {{p.cantidad || '-'}}</span>
                </div>
                <div class="info-item">
                  <i class="fas fa-calendar"></i>
                  <span><strong>Fecha:</strong> {{p.fechaProgramada}}</span>
                </div>
                <div class="info-item" *ngIf="p.conductorNombre || p.conductorId">
                  <i class="fas fa-user-tie"></i>
                  <span><strong>Conductor:</strong> {{p.conductorNombre || 'ID ' + p.conductorId}}</span>
                </div>
              </div>
            </div>

            <div class="pedido-actions">
              <button class="btn-action btn-edit" 
                      (click)="editarPedido(p)" 
                      [disabled]="p.estado === 'ENTREGADO' || p.estado === 'FALLIDO'"
                      [title]="(p.estado === 'ENTREGADO' || p.estado === 'FALLIDO') ? 'No se puede editar un pedido finalizado' : 'Editar pedido'">
                <i class="fas fa-edit"></i> Editar
              </button>
              <button class="btn-action btn-assign" 
                      (click)="openAssignDialog(p)"
                      [disabled]="p.estado === 'ENTREGADO' || p.estado === 'FALLIDO'"
                      [title]="(p.estado === 'ENTREGADO' || p.estado === 'FALLIDO') ? 'No se puede reasignar un pedido finalizado' : 'Asignar conductor'">
                <i class="fas fa-user-plus"></i> Asignar
              </button>
              <button class="btn-action btn-delete" 
                      (click)="eliminarPedido(p.id!)"
                      [disabled]="p.estado === 'ENTREGADO' || p.estado === 'FALLIDO'"
                      [title]="(p.estado === 'ENTREGADO' || p.estado === 'FALLIDO') ? 'No se puede eliminar un pedido finalizado' : 'Eliminar pedido'">
                <i class="fas fa-trash"></i> Eliminar
              </button>
            </div>
          </div>
        </div>

        <div *ngIf="pedidos.length === 0" class="empty-state">
          <i class="fas fa-inbox"></i>
          <p>No hay pedidos registrados</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --primary: #667eea;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --info: #3b82f6;
      --card-bg: #1e1e1e;
      --border: rgba(148,163,184,0.15);
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }
    .pedidos-container { max-width: 1600px; margin: 0 auto; padding: 24px; }
    .header-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(102,126,234,0.3); }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
    .header-text h2 { margin: 0 0 8px; font-size: 32px; font-weight: 800; color: white; display: flex; align-items: center; gap: 12px; }
    .header-text p { margin: 0; color: rgba(255,255,255,0.9); font-size: 16px; }
    .header-badge { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 12px; color: white; font-size: 18px; font-weight: 600; }
    .form-card { background: var(--card-bg); border-radius: 20px; padding: 32px; margin-bottom: 24px; border: 1px solid var(--border); }
    .form-card h3 { margin: 0 0 24px; font-size: 24px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 12px; }
    .modern-form { display: flex; flex-direction: column; gap: 24px; }
    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--text); }
    .form-group label i { color: var(--primary); font-size: 14px; }
    .required { color: var(--danger); }
    .form-input, .form-select { width: 100%; padding: 12px 14px; background: rgba(15,23,42,0.6); border: 2px solid var(--border); border-radius: 10px; color: var(--text); font-size: 14px; transition: all 0.3s; font-family: inherit; }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
    .form-input.readonly { background: rgba(15,23,42,0.3); cursor: not-allowed; color: var(--text-muted); }
    .geocoding-badge { display: inline-flex; align-items: center; gap: 6px; font-size: 12px; color: var(--warning); margin-top: 4px; }
    .form-actions { display: flex; gap: 12px; justify-content: flex-end; padding-top: 20px; border-top: 1px solid var(--border); }
    .btn-submit { padding: 14px 28px; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
    .btn-submit:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-create { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; box-shadow: 0 4px 12px rgba(102,126,234,0.3); }
    .btn-create:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.4); }
    .btn-update { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; box-shadow: 0 4px 12px rgba(16,185,129,0.3); }
    .btn-update:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
    .btn-cancel { padding: 14px 24px; background: rgba(148,163,184,0.1); border: 1px solid var(--border); border-radius: 12px; color: var(--text-muted); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 8px; }
    .btn-cancel:hover { background: rgba(148,163,184,0.2); color: var(--text); }
    .map-section { margin-top: 32px; padding-top: 32px; border-top: 1px solid var(--border); }
    .map-section h4 { margin: 0 0 16px; font-size: 18px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 10px; }
    .pedidos-list { background: var(--card-bg); border-radius: 20px; padding: 32px; border: 1px solid var(--border); }
    .pedidos-list h3 { margin: 0 0 24px; font-size: 24px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 12px; }
    .pedidos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 20px; }
    .pedido-card { background: rgba(30,41,59,0.6); border: 1px solid var(--border); border-radius: 16px; overflow: hidden; transition: all 0.3s; }
    .pedido-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.3); border-color: var(--primary); }
    .pedido-header { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; background: rgba(102,126,234,0.1); border-bottom: 1px solid var(--border); }
    .pedido-id { font-size: 16px; font-weight: 700; color: var(--primary); display: flex; align-items: center; gap: 6px; }
    .estado-badge { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .estado-pendiente { background: rgba(148,163,184,0.2); color: #94a3b8; }
    .estado-asignado { background: rgba(59,130,246,0.2); color: #60a5fa; }
    .estado-en_ruta { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .estado-entregado { background: rgba(16,185,129,0.2); color: #34d399; }
    .estado-fallido { background: rgba(239,68,68,0.2); color: #f87171; }
    .estado-reintento { background: rgba(249,115,22,0.2); color: #fb923c; }
    .pedido-body { padding: 20px; }
    .pedido-info { display: flex; flex-direction: column; gap: 12px; }
    .info-item { display: flex; align-items: flex-start; gap: 10px; font-size: 14px; color: var(--text-muted); }
    .info-item i { color: var(--primary); font-size: 14px; margin-top: 2px; flex-shrink: 0; }
    .info-item strong { color: var(--text); }
    .pedido-actions { display: flex; gap: 8px; padding: 16px 20px; border-top: 1px solid var(--border); }
    .btn-action { flex: 1; padding: 10px 14px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .btn-action:disabled { opacity: 0.4; cursor: not-allowed; filter: grayscale(0.5); transform: none !important; box-shadow: none !important; }
    .btn-edit { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
    .btn-edit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.4); }
    .btn-assign { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; }
    .btn-assign:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(59,130,246,0.4); }
    .btn-delete { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
    .btn-delete:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239,68,68,0.4); }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
    .empty-state i { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .empty-state p { margin: 0; font-size: 16px; }
    @media (max-width: 768px) { .pedidos-grid { grid-template-columns: 1fr; } .form-grid { grid-template-columns: 1fr; } .pedido-actions { flex-direction: column; } }
  `]
})
export class PedidosSimpleComponent implements OnInit {
  pedidos: Pedido[] = [];
  clientes: Cliente[] = [];
  direcciones: Direccion[] = [];
  direccionesFiltradas: Direccion[] = [];
  conductores: Conductor[] = [];
  asignacionesActivas: AsignacionVehiculo[] = [];
  modoEdicion: boolean = false;
  pedidoEditandoId: number | null = null;
  geocodificando: boolean = false;
  mostrarMapa: boolean = false;
  mapMarkers: MapMarker[] = [];
  direccionSeleccionadaTexto: string = ''; // Texto para mostrar en input readonly

  // ✅ modelo inicial con todos los campos necesarios
  nuevoPedido: Partial<Pedido> = {
    clienteId: undefined,
    direccionId: undefined,
    conductorId: undefined,
    producto: '',
    cantidad: 1,
    fechaProgramada: '',
    ventanaInicio: '08:00',
    ventanaFin: '12:00',
    volumen: 0,
    peso: 0
  };

  constructor(
    private pedidosService: PedidosSimpleService,
    private clienteService: ClienteService,
    private direccionService: DireccionService,
    private conductoresService: ConductoresService,
    private asignacionesService: AsignacionesService,
    private locationService: LocationService
  ) {}

  ngOnInit(): void {
    this.cargarPedidos();
    this.cargarClientes();
    this.cargarDirecciones();
    this.cargarConductores();
  }

  // Cargar conductores activos para asignación
  cargarConductores(): void {
    this.conductores = [];
    this.asignacionesActivas = [];
    
    // Cargar conductores y asignaciones activas en paralelo
    this.conductoresService.listarActivos().subscribe({
      next: (data) => {
        this.conductores = data;
        console.log('Conductores activos cargados:', data);
      },
      error: (err) => console.error('Error cargando conductores:', err)
    });
    
    this.asignacionesService.listarActivas().subscribe({
      next: (data) => {
        this.asignacionesActivas = data;
        console.log('Asignaciones activas cargadas:', data);
      },
      error: (err) => console.error('Error cargando asignaciones:', err)
    });
  }
  
  // Obtener vehículo asignado a un conductor
  obtenerVehiculoConductor(conductorId: number): string {
    const asignacion = this.asignacionesActivas.find(a => a.conductorId === conductorId);
    if (asignacion && asignacion.vehiculoPlaca) {
      return `Vehículo: ${asignacion.vehiculoPlaca}`;
    }
    return 'Sin asignación vehículo';
  }

  // ✅ carga la lista de pedidos
  cargarPedidos(): void {
    this.pedidosService.getAll().subscribe((data) => {
      this.pedidos = data;
    });
  }

  // ✅ carga la lista de clientes
  cargarClientes(): void {
    this.clienteService.getAll().subscribe({
      next: (data) => {
        this.clientes = data;
        console.log('Clientes cargados:', data);
      },
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }

  // ✅ carga la lista de direcciones
  cargarDirecciones(): void {
    this.direccionService.getAll().subscribe({
      next: (data) => {
        // Mapear lat/lng del backend a latitud/longitud del frontend
        this.direcciones = data.map(d => ({
          ...d,
          latitud: d.lat,
          longitud: d.lng
        }));
        this.direccionesFiltradas = this.direcciones;
        console.log('Direcciones cargadas:', this.direcciones);
        console.log('Primera dirección detallada:', JSON.stringify(this.direcciones[0], null, 2));
      },
      error: (err) => console.error('Error cargando direcciones:', err)
    });
  }

  // ✅ filtrar direcciones por cliente seleccionado y autoseleccionar si hay una sola
  onClienteChange(): void {
    if (this.nuevoPedido.clienteId) {
      console.log('Cliente seleccionado ID:', this.nuevoPedido.clienteId);
      console.log('Tipo de clienteId seleccionado:', typeof this.nuevoPedido.clienteId);
      console.log('Todas las direcciones disponibles:', this.direcciones);
      
      // Convertir clienteId a número si es string (viene del select)
      const clienteIdNum = Number(this.nuevoPedido.clienteId);
      
      // Filtrar direcciones del cliente
      this.direccionesFiltradas = this.direcciones.filter(
        d => d.clienteId === clienteIdNum
      );
      
      console.log('Direcciones filtradas para este cliente:', this.direccionesFiltradas);
      
      // Si el cliente tiene una sola dirección, autoseleccionarla
      if (this.direccionesFiltradas.length === 1) {
        const dir = this.direccionesFiltradas[0];
        this.nuevoPedido.direccionId = dir.id;
        this.direccionSeleccionadaTexto = `${dir.direccion} - ${dir.ciudad}`;
        console.log('✅ Dirección autoseleccionada:', this.direccionSeleccionadaTexto);
        // Geocodificar automáticamente
        this.onDireccionChange();
      } else if (this.direccionesFiltradas.length === 0) {
        // Sin direcciones
        this.nuevoPedido.direccionId = undefined;
        this.direccionSeleccionadaTexto = 'Este cliente no tiene direcciones registradas';
        this.nuevoPedido.latitud = undefined;
        this.nuevoPedido.longitud = undefined;
        console.warn('⚠️ Cliente sin direcciones');
      } else {
        // Múltiples direcciones
        const dir = this.direccionesFiltradas[0]; // Tomar la primera
        this.nuevoPedido.direccionId = dir.id;
        this.direccionSeleccionadaTexto = `${dir.direccion} - ${dir.ciudad} (${this.direccionesFiltradas.length} direcciones disponibles)`;
        console.log('✅ Cliente con múltiples direcciones, usando la primera');
        this.onDireccionChange();
      }
    } else {
      this.direccionesFiltradas = this.direcciones;
      this.direccionSeleccionadaTexto = '';
    }
  }

  // ✅ Geocodificar dirección cuando se selecciona
  async onDireccionChange(): Promise<void> {
    if (!this.nuevoPedido.direccionId) {
      this.nuevoPedido.latitud = undefined;
      this.nuevoPedido.longitud = undefined;
      this.mostrarMapa = false;
      return;
    }

    const direccion = this.direcciones.find(d => d.id === this.nuevoPedido.direccionId);
    if (!direccion) return;

    // Si la dirección YA TIENE coordenadas en BD, usarlas directamente
    if (direccion.latitud && direccion.longitud) {
      this.nuevoPedido.latitud = direccion.latitud;
      this.nuevoPedido.longitud = direccion.longitud;
      this.updateMapMarker();
      console.log('✅ Usando coordenadas existentes de BD:', direccion.latitud, direccion.longitud);
      return;
    }

    // Si NO tiene coordenadas, geocodificar con LocationIQ
    this.geocodificando = true;
    try {
      const direccionCompleta = `${direccion.direccion}, ${direccion.ciudad || 'Santa Cruz'}, Bolivia`;
      
      const resultado = await this.locationService.geocode(direccionCompleta).toPromise();
      
      if (resultado) {
        this.nuevoPedido.latitud = parseFloat(resultado.latitude);
        this.nuevoPedido.longitud = parseFloat(resultado.longitude);
        
        this.updateMapMarker();
        
        await Swal.fire({
          icon: 'success',
          title: 'Dirección geocodificada',
          text: `Ubicación encontrada: ${resultado.displayName}`,
          timer: 2000,
          showConfirmButton: false
        });
      }
    } catch (error) {
      console.error('Error al geocodificar:', error);
      await Swal.fire({
        icon: 'warning',
        title: 'Geocodificación parcial',
        text: 'No se pudo obtener coordenadas exactas. Puedes continuar o ajustar la dirección.',
        confirmButtonText: 'Entendido'
      });
    } finally {
      this.geocodificando = false;
    }
  }

  // ✅ Actualizar marcador en el mapa
  updateMapMarker(): void {
    if (this.nuevoPedido.latitud && this.nuevoPedido.longitud) {
      const direccion = this.direcciones.find(d => d.id === this.nuevoPedido.direccionId);
      this.mapMarkers = [{
        id: 'nuevo-pedido',
        lat: this.nuevoPedido.latitud,
        lng: this.nuevoPedido.longitud,
        title: 'Ubicación de entrega',
        description: direccion ? `${direccion.direccion}, ${direccion.ciudad}` : '',
        icon: 'delivery'
      }];
      this.mostrarMapa = true;
    } else {
      this.mapMarkers = [];
      this.mostrarMapa = false;
    }
  }

  // ✅ crear pedido con validación mínima
  async crearPedido(): Promise<void> {
    if (
      !this.nuevoPedido.clienteId ||
      !this.nuevoPedido.direccionId ||
      !this.nuevoPedido.fechaProgramada
    ) {
      await Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Cliente, Dirección y Fecha son obligatorios.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    // ✅ Validar que la fecha y hora no sean anteriores a la actual
    const fechaProgramada = new Date(this.nuevoPedido.fechaProgramada);
    const ahora = new Date();
    ahora.setHours(0, 0, 0, 0); // Comparar solo fecha
    fechaProgramada.setHours(0, 0, 0, 0);

    if (fechaProgramada < ahora) {
      await Swal.fire({
        icon: 'error',
        title: 'Fecha inválida',
        text: 'No puedes crear un pedido con fecha anterior a hoy.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#ef4444'
      });
      return;
    }

    // ✅ Validar ventanas de tiempo si la fecha es hoy
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    if (fechaProgramada.getTime() === hoy.getTime()) {
      const horaActual = new Date();
      const [horaInicio, minInicio] = (this.nuevoPedido.ventanaInicio || '00:00').split(':').map(Number);
      const [horaFin, minFin] = (this.nuevoPedido.ventanaFin || '23:59').split(':').map(Number);
      
      const ventanaInicioDate = new Date();
      ventanaInicioDate.setHours(horaInicio, minInicio, 0, 0);
      
      const ventanaFinDate = new Date();
      ventanaFinDate.setHours(horaFin, minFin, 0, 0);

      if (ventanaInicioDate < horaActual) {
        await Swal.fire({
          icon: 'error',
          title: 'Hora inválida',
          text: 'La ventana de inicio no puede ser anterior a la hora actual.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444'
        });
        return;
      }

      if (ventanaFinDate < horaActual) {
        await Swal.fire({
          icon: 'error',
          title: 'Hora inválida',
          text: 'La ventana de fin no puede ser anterior a la hora actual.',
          confirmButtonText: 'Entendido',
          confirmButtonColor: '#ef4444'
        });
        return;
      }
    }

    this.pedidosService.create(this.nuevoPedido).subscribe({
      next: async () => {
        this.cargarPedidos();
        this.resetForm();
        await Swal.fire({
          icon: 'success',
          title: '¡Pedido creado!',
          text: 'El pedido se ha registrado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error al crear pedido',
          text: err.error?.message || err.message,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  // Abrir diálogo para asignar conductor a un pedido existente
  async openAssignDialog(pedido: Pedido) {
    const options: Record<string,string> = {};
    this.conductores.forEach(c => {
      const vehiculoInfo = this.obtenerVehiculoConductor(c.id);
      options[String(c.id)] = `${c.nombreCompleto} - ${vehiculoInfo}`;
    });

    const { value: conductorId } = await Swal.fire({
      title: 'Asignar conductor',
      html: '<p style="color: #64748b; font-size: 14px; margin-bottom: 12px;">Selecciona el conductor que realizará la entrega</p>',
      input: 'select',
      inputOptions: options,
      inputPlaceholder: 'Selecciona un conductor',
      showCancelButton: true,
      confirmButtonText: 'Asignar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#667eea',
      cancelButtonColor: '#64748b',
      reverseButtons: true
    });

    if (conductorId) {
      const id = Number(conductorId);
      const conductor = this.conductores.find(c => c.id === id);
      
      this.pedidosService.assignConductor(pedido.id!, id).subscribe({
        next: async (updated) => {
          this.cargarPedidos();
          await Swal.fire({
            icon: 'success',
            title: '¡Conductor asignado!',
            html: `<p>El pedido ha sido asignado a <strong>${conductor?.nombreCompleto}</strong></p>`,
            timer: 2500,
            showConfirmButton: false
          });
        },
        error: async (err) => {
          console.error('Error asignando conductor:', err);
          await Swal.fire({
            icon: 'error',
            title: 'Error al asignar',
            text: err.error?.message || err.message,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#ef4444'
          });
        }
      });
    }
  }

  // ✅ editar pedido existente
  editarPedido(pedido: Pedido): void {
    this.modoEdicion = true;
    this.pedidoEditandoId = pedido.id!;
    
    // Asignar valores del pedido
    this.nuevoPedido = {
      clienteId: pedido.clienteId,
      direccionId: pedido.direccionId,
      producto: pedido.producto,
      cantidad: pedido.cantidad,
      fechaProgramada: pedido.fechaProgramada,
      ventanaInicio: pedido.ventanaInicio?.substring(0, 5) || '08:00',
      ventanaFin: pedido.ventanaFin?.substring(0, 5) || '12:00',
      volumen: pedido.volumen,
      peso: pedido.peso,
      estado: pedido.estado,
      conductorId: (pedido as any).conductorId
    };
    
    // Cargar direcciones del cliente seleccionado y mostrar texto
    if (this.nuevoPedido.clienteId) {
      this.direccionesFiltradas = this.direcciones.filter(
        d => d.clienteId === this.nuevoPedido.clienteId
      );
      
      // Mostrar la dirección seleccionada como texto
      const dir = this.direcciones.find(d => d.id === this.nuevoPedido.direccionId);
      if (dir) {
        this.direccionSeleccionadaTexto = `${dir.direccion} - ${dir.ciudad}`;
      }
    }
  }

  // ✅ actualizar pedido
  async actualizarPedido(): Promise<void> {
    if (!this.pedidoEditandoId) return;

    this.pedidosService.update(this.pedidoEditandoId, this.nuevoPedido).subscribe({
      next: async () => {
        this.cargarPedidos();
        this.resetForm();
        await Swal.fire({
          icon: 'success',
          title: '¡Pedido actualizado!',
          text: 'Los cambios se han guardado exitosamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: async (err) => {
        console.error('Error:', err);
        await Swal.fire({
          icon: 'error',
          title: 'Error al actualizar',
          text: err.error?.message || err.message,
          confirmButtonText: 'Cerrar',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  // ✅ eliminar pedido
  async eliminarPedido(id: number): Promise<void> {
    const result = await Swal.fire({
      title: '¿Eliminar pedido?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      this.pedidosService.delete(id).subscribe({
        next: async () => {
          this.cargarPedidos();
          await Swal.fire({
            icon: 'success',
            title: '¡Eliminado!',
            text: 'El pedido ha sido eliminado',
            timer: 2000,
            showConfirmButton: false
          });
        },
        error: async (err) => {
          console.error('Error:', err);
          await Swal.fire({
            icon: 'error',
            title: 'Error al eliminar',
            text: err.error?.message || err.message,
            confirmButtonText: 'Cerrar',
            confirmButtonColor: '#ef4444'
          });
        }
      });
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
      clienteId: undefined,
      direccionId: undefined,
      producto: '',
      cantidad: 1,
      fechaProgramada: '',
      ventanaInicio: '08:00',
      ventanaFin: '12:00',
      volumen: 0,
      peso: 0,
      conductorId: undefined
    };
    this.direccionesFiltradas = this.direcciones;
    this.direccionSeleccionadaTexto = '';
    this.mostrarMapa = false;
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';

interface PedidoReporte {
  id: number;
  clienteNombre: string;
  direccion: string;
  ciudad: string;
  departamento: string;
  producto: string;
  cantidad: number;
  volumen: number;
  peso: number;
  estado: string;
  fechaProgramada: string;
  ventanaInicio: string;
  ventanaFin: string;
  conductorNombre: string;
  conductorId: number;
  creadoEn: string;
}

@Component({
  standalone: true,
  selector: 'app-reportes-pedidos',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <h2><i class="fas fa-file-alt"></i> Reportes de Pedidos</h2>
            <p>Genera reportes detallados de todos los pedidos por estado</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filters-card">
        <h3><i class="fas fa-filter"></i> Filtros de Reporte</h3>
        
        <div class="form-grid">
          <div class="form-group">
            <label><i class="fas fa-calendar"></i> Fecha Inicio</label>
            <input type="date" [(ngModel)]="fechaInicio" class="form-control">
          </div>

          <div class="form-group">
            <label><i class="fas fa-calendar"></i> Fecha Fin</label>
            <input type="date" [(ngModel)]="fechaFin" class="form-control">
          </div>

          <div class="form-group">
            <label><i class="fas fa-info-circle"></i> Estado (Opcional)</label>
            <select [(ngModel)]="estadoFiltro" class="form-control">
              <option value="">Todos los estados</option>
              <option value="PENDIENTE">Pendiente</option>
              <option value="ASIGNADO">Asignado</option>
              <option value="EN_RUTA">En Ruta</option>
              <option value="ENTREGADO">Entregado</option>
              <option value="FALLIDO">Fallido</option>
              <option value="REINTENTO">Reintento</option>
            </select>
          </div>

          <div class="form-group">
            <label><i class="fas fa-user-tie"></i> Conductor (Opcional)</label>
            <input type="number" [(ngModel)]="conductorId" placeholder="ID del conductor" class="form-control">
          </div>
        </div>

        <div class="button-group">
          <button class="btn btn-preview" (click)="previsualizarReporte()">
            <i class="fas fa-eye"></i> Previsualizar
          </button>
          <button class="btn btn-excel" (click)="descargarExcel()" [disabled]="cargando">
            <i class="fas fa-file-excel"></i> Descargar Excel
          </button>
          <button class="btn btn-csv" (click)="descargarCSV()" [disabled]="cargando">
            <i class="fas fa-file-csv"></i> Descargar CSV
          </button>
        </div>
      </div>

      <!-- Loading -->
      <div *ngIf="cargando" class="loading-card">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Generando reporte...</p>
      </div>

      <!-- Tabla de previsualización -->
      <div *ngIf="datosReporte.length > 0 && !cargando" class="table-card">
        <div class="section-header">
          <h3><i class="fas fa-table"></i> Previsualización del Reporte</h3>
          <span class="count-badge">{{datosReporte.length}} registro(s)</span>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente</th>
                <th>Dirección</th>
                <th>Ciudad</th>
                <th>Departamento</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Volumen</th>
                <th>Peso</th>
                <th>Estado</th>
                <th>F. Programada</th>
                <th>Ventana</th>
                <th>Conductor</th>
                <th>Creado</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of datosReporte">
                <td>{{item.id}}</td>
                <td>{{item.clienteNombre}}</td>
                <td>{{item.direccion}}</td>
                <td>{{item.ciudad}}</td>
                <td>{{item.departamento || 'N/A'}}</td>
                <td>{{item.producto || 'N/A'}}</td>
                <td>{{item.cantidad || 0}}</td>
                <td>{{item.volumen}} m³</td>
                <td>{{item.peso}} kg</td>
                <td>
                  <span class="badge badge-{{getEstadoClass(item.estado)}}">
                    {{item.estado}}
                  </span>
                </td>
                <td>{{item.fechaProgramada | date:'dd/MM/yyyy'}}</td>
                <td class="ventana">
                  {{item.ventanaInicio && item.ventanaFin ? (item.ventanaInicio + ' - ' + item.ventanaFin) : 'N/A'}}
                </td>
                <td>{{item.conductorNombre || 'Sin asignar'}}</td>
                <td>{{item.creadoEn | date:'dd/MM/yyyy HH:mm'}}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Empty State -->
      <div *ngIf="datosReporte.length === 0 && !cargando && mostrarEmpty" class="empty-state">
        <i class="fas fa-inbox"></i>
        <p>No se encontraron pedidos con los filtros seleccionados</p>
        <small>Intenta ajustar las fechas o filtros</small>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 24px;
    }

    /* Header Card */
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
    }

    .header-text h2 {
      color: white;
      font-size: 32px;
      font-weight: 700;
      margin: 0 0 8px 0;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .header-text p {
      color: rgba(255, 255, 255, 0.9);
      font-size: 16px;
      margin: 0;
    }

    /* Filters Card */
    .filters-card {
      background: white;
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 24px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .filters-card h3 {
      margin: 0 0 24px;
      font-size: 20px;
      font-weight: 700;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .filters-card h3 i {
      color: #667eea;
    }

    /* Form Grid */
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-group label {
      font-size: 14px;
      font-weight: 600;
      color: #6b7280;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    .form-group label i {
      color: #667eea;
      font-size: 13px;
    }

    .form-control {
      padding: 12px 14px;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 14px;
      transition: all 0.2s;
      background: white;
    }

    .form-control:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    /* Button Group */
    .button-group {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
    }

    .btn {
      padding: 14px 28px;
      border: none;
      border-radius: 10px;
      font-size: 15px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      display: inline-flex;
      align-items: center;
      gap: 10px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-preview {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    }

    .btn-preview:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
    }

    .btn-excel {
      background: linear-gradient(135deg, #10b981 0%, #059669 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-excel:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4);
    }

    .btn-csv {
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: white;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn-csv:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
    }

    /* Loading Card */
    .loading-card {
      background: white;
      border-radius: 12px;
      padding: 60px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .loading-card i {
      font-size: 48px;
      color: #667eea;
      margin-bottom: 16px;
    }

    .loading-card p {
      color: #6b7280;
      font-size: 16px;
      margin: 0;
    }

    /* Table Card */
    .table-card {
      background: white;
      border-radius: 12px;
      padding: 28px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .section-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 700;
      color: #374151;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .section-header h3 i {
      color: #667eea;
    }

    .count-badge {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
    }

    /* Table */
    .table-container {
      overflow-x: auto;
      margin-top: 20px;
    }

    .data-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 14px;
    }

    .data-table thead {
      background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
    }

    .data-table th {
      padding: 14px 12px;
      text-align: left;
      font-weight: 600;
      color: #6b7280;
      border-bottom: 2px solid #e5e7eb;
      white-space: nowrap;
    }

    .data-table td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
      color: #374151;
    }

    .data-table tbody tr {
      transition: all 0.2s;
    }

    .data-table tbody tr:hover {
      background: #f9fafb;
    }

    .ventana {
      font-family: monospace;
      font-size: 13px;
      white-space: nowrap;
    }

    /* Badges */
    .badge {
      display: inline-block;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      white-space: nowrap;
    }

    .badge-pendiente {
      background: #fef3c7;
      color: #92400e;
    }

    .badge-asignado {
      background: #dbeafe;
      color: #1e40af;
    }

    .badge-en_ruta {
      background: #e0e7ff;
      color: #3730a3;
    }

    .badge-entregado {
      background: #d1fae5;
      color: #065f46;
    }

    .badge-fallido {
      background: #fee2e2;
      color: #991b1b;
    }

    .badge-reintento {
      background: #fed7aa;
      color: #9a3412;
    }

    /* Empty State */
    .empty-state {
      background: white;
      border-radius: 12px;
      padding: 80px 40px;
      text-align: center;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .empty-state i {
      font-size: 80px;
      color: #d1d5db;
      margin-bottom: 20px;
    }

    .empty-state p {
      color: #6b7280;
      font-size: 18px;
      margin: 0 0 8px 0;
      font-weight: 600;
    }

    .empty-state small {
      color: #9ca3af;
      font-size: 14px;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }

      .button-group {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }

      .data-table {
        font-size: 12px;
      }

      .data-table th,
      .data-table td {
        padding: 8px 6px;
      }
    }
  `]
})
export class ReportesPedidosComponent implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/reportes';

  fechaInicio: string = '';
  fechaFin: string = '';
  estadoFiltro: string = '';
  conductorId: number | null = null;
  datosReporte: PedidoReporte[] = [];
  cargando = false;
  mostrarEmpty = false;

  ngOnInit() {
    // Establecer fecha por defecto (último año)
    const hoy = new Date();
    const haceUnAno = new Date();
    haceUnAno.setFullYear(hoy.getFullYear() - 1);
    
    this.fechaInicio = haceUnAno.toISOString().split('T')[0];
    this.fechaFin = hoy.toISOString().split('T')[0];
  }

  getEstadoClass(estado: string): string {
    return estado.toLowerCase();
  }

  previsualizarReporte() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor selecciona fecha de inicio y fin',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    this.cargando = true;
    this.mostrarEmpty = false;

    let params = new HttpParams()
      .set('fechaInicio', this.fechaInicio)
      .set('fechaFin', this.fechaFin);

    if (this.estadoFiltro) {
      params = params.set('estado', this.estadoFiltro);
    }

    if (this.conductorId) {
      params = params.set('conductorId', this.conductorId.toString());
    }

    this.http.get<PedidoReporte[]>(`${this.apiUrl}/pedidos`, { params }).subscribe({
      next: (data) => {
        this.datosReporte = data;
        this.cargando = false;
        this.mostrarEmpty = true;

        if (data.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron pedidos con los filtros seleccionados',
            confirmButtonColor: '#667eea'
          });
        } else {
          Swal.fire({
            icon: 'success',
            title: '¡Reporte generado!',
            text: `Se encontraron ${data.length} pedido(s)`,
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        console.error('Error al generar reporte:', err);
        this.cargando = false;
        this.mostrarEmpty = true;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo generar el reporte. Verifica los filtros.',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  descargarExcel() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor selecciona fecha de inicio y fin',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    this.cargando = true;

    let params = new HttpParams()
      .set('fechaInicio', this.fechaInicio)
      .set('fechaFin', this.fechaFin);

    if (this.estadoFiltro) {
      params = params.set('estado', this.estadoFiltro);
    }

    if (this.conductorId) {
      params = params.set('conductorId', this.conductorId.toString());
    }

    this.http.get(`${this.apiUrl}/pedidos/excel`, {
      params,
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        this.cargando = false;
        const blob = response.body;
        if (blob) {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_pedidos_${this.fechaInicio}_${this.fechaFin}.xlsx`;
          a.click();
          window.URL.revokeObjectURL(url);

          Swal.fire({
            icon: 'success',
            title: '¡Descarga exitosa!',
            text: 'El archivo Excel se ha descargado correctamente',
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        console.error('Error al descargar Excel:', err);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo descargar el archivo Excel',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }

  descargarCSV() {
    if (!this.fechaInicio || !this.fechaFin) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos requeridos',
        text: 'Por favor selecciona fecha de inicio y fin',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    this.cargando = true;

    let params = new HttpParams()
      .set('fechaInicio', this.fechaInicio)
      .set('fechaFin', this.fechaFin);

    if (this.estadoFiltro) {
      params = params.set('estado', this.estadoFiltro);
    }

    if (this.conductorId) {
      params = params.set('conductorId', this.conductorId.toString());
    }

    this.http.get(`${this.apiUrl}/pedidos/csv`, {
      params,
      responseType: 'text',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        this.cargando = false;
        const csv = response.body;
        if (csv) {
          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `reporte_pedidos_${this.fechaInicio}_${this.fechaFin}.csv`;
          a.click();
          window.URL.revokeObjectURL(url);

          Swal.fire({
            icon: 'success',
            title: '¡Descarga exitosa!',
            text: 'El archivo CSV se ha descargado correctamente',
            confirmButtonColor: '#667eea',
            timer: 2000,
            showConfirmButton: false
          });
        }
      },
      error: (err) => {
        console.error('Error al descargar CSV:', err);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo descargar el archivo CSV',
          confirmButtonColor: '#667eea'
        });
      }
    });
  }
}

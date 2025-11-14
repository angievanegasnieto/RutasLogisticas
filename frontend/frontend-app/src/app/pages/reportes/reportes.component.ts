import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpParams } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  standalone: true,
  selector: 'app-reportes',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <!-- Header -->
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <h2><i class="fas fa-chart-bar"></i> Reportes de Pedidos Entregados</h2>
            <p>Genera reportes detallados en Excel o CSV</p>
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
                <th>Producto</th>
                <th>Cant.</th>
                <th>Conductor</th>
                <th>F. Programada</th>
                <th>Ventana</th>
                <th>F. Inicio Ruta</th>
                <th>F. Entrega</th>
                <th>Estado</th>
                <th>Reintentos</th>
                <th>Notas</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of datosReporte">
                <td>{{item.pedidoId}}</td>
                <td>{{item.clienteNombre}}</td>
                <td>{{item.direccion}}</td>
                <td>{{item.ciudad}}</td>
                <td>{{item.producto}}</td>
                <td>{{item.cantidad}}</td>
                <td>{{item.conductorNombre || 'N/A'}}</td>
                <td>{{item.fechaProgramada | date:'dd/MM/yyyy'}}</td>
                <td class="ventana">{{item.ventanaHoraria}}</td>
                <td>{{item.fechaInicioRuta ? (item.fechaInicioRuta | date:'dd/MM HH:mm') : '-'}}</td>
                <td>{{item.fechaEntrega ? (item.fechaEntrega | date:'dd/MM HH:mm') : '-'}}</td>
                <td><span class="badge badge-success">{{item.estadoFinal}}</span></td>
                <td class="text-center">{{item.numeroReintentos || 0}}</td>
                <td class="notas">
                  <span *ngIf="item.notasReprogramacion || item.notasFallo" class="has-notes" 
                        [title]="(item.notasReprogramacion || '') + ' ' + (item.notasFallo || '')">
                    <i class="fas fa-sticky-note"></i>
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Sin resultados -->
      <div *ngIf="datosReporte.length === 0 && !cargando && previsualizacionRealizada" class="empty-card">
        <i class="fas fa-inbox"></i>
        <p>No se encontraron pedidos entregados con los filtros seleccionados</p>
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

    .container { max-width: 1600px; margin: 0 auto; padding: 24px; }

    .header-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(102,126,234,0.3); }
    .header-content { display: flex; justify-content: space-between; align-items: center; }
    .header-text h2 { margin: 0 0 8px; font-size: 32px; font-weight: 800; color: white; display: flex; align-items: center; gap: 12px; }
    .header-text p { margin: 0; color: rgba(255,255,255,0.9); font-size: 16px; }

    .filters-card { background: var(--card-bg); border-radius: 20px; padding: 32px; border: 1px solid var(--border); margin-bottom: 24px; }
    .filters-card h3 { margin: 0 0 24px; color: var(--text); font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; }

    .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 24px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-group label { font-size: 14px; font-weight: 600; color: var(--text); display: flex; align-items: center; gap: 8px; }
    .form-control { padding: 12px 16px; border: 2px solid var(--border); border-radius: 8px; background: rgba(255,255,255,0.05); color: var(--text); font-size: 14px; transition: all 0.3s; }
    .form-control:focus { outline: none; border-color: var(--primary); background: rgba(255,255,255,0.08); }

    .button-group { display: flex; gap: 12px; flex-wrap: wrap; }
    .btn { padding: 14px 24px; border: none; border-radius: 10px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 10px; color: white; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-preview { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .btn-preview:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.4); }
    .btn-excel { background: linear-gradient(135deg, #10b981 0%, #059669 100%); }
    .btn-excel:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16,185,129,0.4); }
    .btn-csv { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
    .btn-csv:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(245,158,11,0.4); }

    .loading-card { background: var(--card-bg); border-radius: 20px; padding: 60px 20px; text-align: center; border: 1px solid var(--border); color: var(--text-muted); }
    .loading-card i { font-size: 48px; margin-bottom: 16px; color: var(--primary); }

    .table-card { background: var(--card-bg); border-radius: 20px; padding: 32px; border: 1px solid var(--border); }
    .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--border); }
    .section-header h3 { margin: 0; color: var(--text); font-size: 20px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
    .count-badge { background: rgba(102,126,234,0.2); color: var(--primary); padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }

    .table-container { overflow-x: auto; }
    .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .data-table thead { background: rgba(102,126,234,0.1); }
    .data-table th { padding: 14px 12px; text-align: left; font-weight: 700; color: var(--text); border-bottom: 2px solid var(--border); white-space: nowrap; }
    .data-table td { padding: 12px; border-bottom: 1px solid var(--border); color: var(--text-muted); vertical-align: top; }
    .data-table tbody tr:hover { background: rgba(102,126,234,0.05); }

    .text-center { text-align: center !important; }
    .ventana { font-size: 12px; white-space: nowrap; }
    .notas { text-align: center; }
    .has-notes { color: var(--warning); font-size: 18px; cursor: help; }
    .badge { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
    .badge-success { background: rgba(16,185,129,0.2); color: var(--success); }

    .empty-card { background: var(--card-bg); border-radius: 20px; padding: 60px 20px; text-align: center; border: 1px solid var(--border); color: var(--text-muted); }
    .empty-card i { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
  `]
})
export class ReportesComponent implements OnInit {
  private http = inject(HttpClient);

  fechaInicio: string = '';
  fechaFin: string = '';
  conductorId: number | null = null;
  cargando: boolean = false;
  datosReporte: any[] = [];
  previsualizacionRealizada: boolean = false;

  ngOnInit() {
    // Establecer fechas por defecto (6 meses hacia atrás y 6 meses hacia adelante)
    const hoy = new Date();
    const hace6Meses = new Date();
    hace6Meses.setMonth(hoy.getMonth() - 6);
    
    const en6Meses = new Date();
    en6Meses.setMonth(hoy.getMonth() + 6);

    this.fechaInicio = hace6Meses.toISOString().split('T')[0];
    this.fechaFin = en6Meses.toISOString().split('T')[0];
  }

  previsualizarReporte() {
    this.cargando = true;
    this.previsualizacionRealizada = true;

    let params = new HttpParams();
    if (this.fechaInicio) params = params.set('fechaInicio', this.fechaInicio);
    if (this.fechaFin) params = params.set('fechaFin', this.fechaFin);
    if (this.conductorId) params = params.set('conductorId', this.conductorId.toString());

    this.http.get<any[]>('http://localhost:8080/api/reportes/pedidos-entregados', { params }).subscribe({
      next: (datos) => {
        this.datosReporte = datos;
        this.cargando = false;
        
        if (datos.length === 0) {
          Swal.fire({
            icon: 'info',
            title: 'Sin resultados',
            text: 'No se encontraron pedidos entregados con los filtros seleccionados',
            confirmButtonColor: '#667eea'
          });
        }
      },
      error: (err) => {
        console.error('Error al cargar reporte:', err);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar el reporte. Verifica que el backend esté funcionando.',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  descargarExcel() {
    this.cargando = true;

    let params = new HttpParams();
    if (this.fechaInicio) params = params.set('fechaInicio', this.fechaInicio);
    if (this.fechaFin) params = params.set('fechaFin', this.fechaFin);
    if (this.conductorId) params = params.set('conductorId', this.conductorId.toString());

    this.http.get('http://localhost:8080/api/reportes/pedidos-entregados/excel', {
      params,
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_pedidos_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.cargando = false;

        Swal.fire({
          icon: 'success',
          title: '¡Descarga exitosa!',
          text: 'El archivo Excel se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al descargar Excel:', err);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo descargar el archivo Excel',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  descargarCSV() {
    this.cargando = true;

    let params = new HttpParams();
    if (this.fechaInicio) params = params.set('fechaInicio', this.fechaInicio);
    if (this.fechaFin) params = params.set('fechaFin', this.fechaFin);
    if (this.conductorId) params = params.set('conductorId', this.conductorId.toString());

    this.http.get('http://localhost:8080/api/reportes/pedidos-entregados/csv', {
      params,
      responseType: 'blob'
    }).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `reporte_pedidos_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        this.cargando = false;

        Swal.fire({
          icon: 'success',
          title: '¡Descarga exitosa!',
          text: 'El archivo CSV se ha descargado correctamente',
          timer: 2000,
          showConfirmButton: false
        });
      },
      error: (err) => {
        console.error('Error al descargar CSV:', err);
        this.cargando = false;
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo descargar el archivo CSV',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }
}

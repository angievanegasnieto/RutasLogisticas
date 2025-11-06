import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { Assignment, Driver, Vehicle } from '../../core/models';

@Component({
  selector: 'app-asignaciones',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card">
    <h2 style="margin:0 0 10px;">Asignación de Conductores a Vehículos</h2>
    <p class="badge" style="margin:0 0 8px;">Activas: {{activeCount()}} · Finalizadas: {{endedCount()}} · Total: {{assignments.length}}</p>
    <div class="row" style="gap:8px; align-items:end;">
      <div class="col">
        <label>Conductor</label>
        <select class="input" [(ngModel)]="selectedDriver">
          <option [ngValue]="null">Seleccione un conductor</option>
          <option *ngFor="let d of drivers" [ngValue]="d">{{d.name}} ({{d.email || d.phone || 's/d'}})</option>
        </select>
      </div>
      <div class="col">
        <label>Vehículo</label>
        <select class="input" [(ngModel)]="selectedVehicle">
          <option [ngValue]="null">Seleccione un vehículo</option>
          <option *ngFor="let v of vehicles" [ngValue]="v">{{v.plate}} {{v.model ? '('+v.model+')':''}}</option>
        </select>
      </div>
      <div class="col">
        <label>Inicio programado</label>
        <input class="input" type="datetime-local" [(ngModel)]="plannedStart">
      </div>
      <div class="col">
        <label>Fin programado</label>
        <input class="input" type="datetime-local" [(ngModel)]="plannedEnd">
      </div>
      <div class="col">
        <button class="btn" (click)="asignar()" [disabled]="!selectedDriver || !selectedVehicle">Asignar</button>
      </div>
      <div class="col" style="margin-left:auto;text-align:right;">
        <button class="btn secondary" (click)="exportCsv()">Exportar CSV</button>
      </div>
    </div>
    <p *ngIf="error" style="color:#ef4444;margin-top:8px">{{error}}</p>
  </div>

  <div class="card" style="margin-top:16px;">
    <h3 style="margin:0 0 8px;">Asignaciones</h3>
    <div class="row" style="gap:8px;align-items:end;margin:0 0 8px;">
      <div class="col"><label>Buscar</label><input class="input" [(ngModel)]="search" placeholder="Conductor o vehículo"></div>
      <div class="col">
        <label>Estado (vigencia)</label>
        <select class="input" [(ngModel)]="statusFilter">
          <option value="ALL">Todas</option>
          <option value="ACTIVE">Activas</option>
          <option value="ENDED">Finalizadas</option>
        </select>
      </div>
      <div class="col">
        <label>Estado (respuesta)</label>
        <select class="input" [(ngModel)]="stateFilter">
          <option value="ALL">Todos</option>
          <option value="PENDING">PENDIENTE</option>
          <option value="ACCEPTED">ACEPTADA</option>
          <option value="REJECTED">RECHAZADA</option>
        </select>
      </div>
    </div>
    <div *ngIf="assignments.length === 0" style="color:#6b7280;">No hay asignaciones registradas.</div>
    <div *ngIf="loading" class="badge">Cargando...</div>
    <table *ngIf="!loading && sortedFiltered().length > 0" class="table" style="width:100%;border-collapse:collapse;">
      <thead>
        <tr>
          <th (click)="setSort('driver')" style="cursor:pointer;text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Conductor</th>
          <th (click)="setSort('vehicle')" style="cursor:pointer;text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Vehículo</th>
          <th (click)="setSort('type')" style="cursor:pointer;text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Tipo</th>
          <th (click)="setSort('start')" style="cursor:pointer;text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Inicio</th>
          <th (click)="setSort('end')" style="cursor:pointer;text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Fin</th>
          <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Estado</th>
          <th style="padding:6px;border-bottom:1px solid #e5e7eb;">Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let a of paged()">
          <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{a.driver?.name}}</td>
          <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{a.vehicle?.plate}} {{a.vehicle?.model ? '('+a.vehicle?.model+')':''}}</td>
          <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{a.vehicle?.type==='MOTO' ? 'Moto' : 'Carro'}}</td>
          <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{a.assignedAt | date:'short' }}</td>
          <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{a.endedAt ? (a.endedAt | date:'short') : '-'}}</td>
          <td style="padding:6px;border-bottom:1px solid #f3f4f6;"><span class="badge">{{a.status || 'PENDING'}}</span></td>
          <td style="padding:6px;border-bottom:1px solid #f3f4f6;">
            <div style="display:flex; gap:6px; justify-content:flex-end; align-items:center;">
              <button class="btn secondary" (click)="finalizar(a)" [disabled]="!!a.endedAt">Finalizar</button>
              <button class="btn secondary" (click)="toggleReassign(a)">Reasignar</button>
              <button class="btn secondary" (click)="eliminar(a)">Eliminar</button>
            </div>
            <div *ngIf="reassignId===a.id" style="margin-top:6px;display:flex;gap:6px;align-items:end;">
              <div class="col" style="flex:1;">
                <label>Nuevo vehículo</label>
                <select class="input" [(ngModel)]="reassignVehicleId">
                  <option [ngValue]="null">Seleccione</option>
                  <option *ngFor="let v of vehicles" [ngValue]="v.id" [disabled]="v.id===a.vehicleId || v.id===a.vehicle?.id">
                    {{v.plate}} {{v.model? '('+v.model+')':''}}
                  </option>
                </select>
              </div>
              <div class="col"><button class="btn" (click)="doReassign(a)">Confirmar</button></div>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
    <div *ngIf="!loading && sortedFiltered().length === 0" style="color:#6b7280;">Sin resultados para los filtros aplicados.</div>
    <div *ngIf="!loading && sortedFiltered().length > 0" style="display:flex;gap:8px;align-items:center;justify-content:flex-end;margin-top:8px;">
      <label>Tamaño página</label>
      <select class="input" [(ngModel)]="pageSize">
        <option [ngValue]="5">5</option>
        <option [ngValue]="10">10</option>
        <option [ngValue]="20">20</option>
      </select>
      <button class="btn secondary" (click)="page=Math.max(1,page-1)">◀</button>
      <span class="badge">{{page}} / {{ Math.max(1, Math.ceil(sortedFiltered().length / pageSize)) }}</span>
      <button class="btn secondary" (click)="page=Math.min(Math.ceil(sortedFiltered().length/pageSize), page+1)">▶</button>
    </div>
  </div>
  `
})
export class AsignacionesComponent implements OnInit {
  private api = inject(ApiService);
  private toastSvc = inject(ToastService);
  drivers: Driver[] = [];
  vehicles: Vehicle[] = [];
  assignments: Assignment[] = [];
  selectedDriver: Driver | null = null;
  selectedVehicle: Vehicle | null = null;
  error = '';
  search = '';
  statusFilter: 'ALL'|'ACTIVE'|'ENDED' = 'ALL';
  stateFilter: 'ALL'|'PENDING'|'ACCEPTED'|'REJECTED' = 'ALL';
  reassignId: number | null = null;
  reassignVehicleId: number | null = null;
  loading = false;
  plannedStart: string = '';
  plannedEnd: string = '';

  // Ordenamiento y paginación
  sortKey: 'driver'|'vehicle'|'type'|'start'|'end' = 'start';
  sortDir: 'asc'|'desc' = 'desc';
  pageSize = 10;
  page = 1;

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos(){
    this.loading = true;
    this.api.listDrivers().subscribe(d => this.drivers = d);
    this.api.listVehicles().subscribe(v => this.vehicles = v);
    this.api.listAssignments().subscribe(a => { this.assignments = a; this.loading = false; });
  }

  asignar(){
    this.error = '';
    if (!this.selectedDriver || !this.selectedVehicle) return;
    // Validación de fechas programadas
    const ps = this.plannedStart ? new Date(this.plannedStart) : null;
    const pe = this.plannedEnd ? new Date(this.plannedEnd) : null;
    if (ps && pe && pe <= ps){ this.error = 'El fin programado debe ser mayor al inicio'; return; }
    // Pre-validaciones: evitar doble asignación activa
    const activeForDriver = this.assignments.some(x => !x.endedAt && (x.driverId === this.selectedDriver!.id || x.driver?.id === this.selectedDriver!.id));
    if (activeForDriver){ this.error = 'El conductor ya tiene una asignación activa'; return; }
    const activeForVehicle = this.assignments.some(x => !x.endedAt && (x.vehicleId === this.selectedVehicle!.id || x.vehicle?.id === this.selectedVehicle!.id));
    if (activeForVehicle){ this.error = 'El vehículo ya está asignado'; return; }
    this.loading = true;
    this.api.createAssignment(this.selectedDriver.id, this.selectedVehicle.id, this.plannedStart||null, this.plannedEnd||null).subscribe({
      next: a => { this.selectedDriver = null; this.selectedVehicle = null; this.cargarDatos(); this.toastSvc.show('Asignación creada'); },
      error: err => this.error = (err?.error?.error || 'No se pudo crear la asignación')
    });
  }

  finalizar(a: Assignment){
    if (!confirm('Finalizar esta asignación?')) return;
    this.loading = true;
    this.api.endAssignment(a.id).subscribe({
      next: r => { this.cargarDatos(); this.toastSvc.show('Asignación finalizada'); },
      error: err => this.error = (err?.error?.error || 'No se pudo finalizar la asignación')
    });
  }

  eliminar(a: Assignment){
    if (!confirm('Eliminar esta asignación?')) return;
    this.loading = true;
    this.api.deleteAssignment(a.id).subscribe({
      next: () => { this.cargarDatos(); this.toastSvc.show('Asignación eliminada'); },
      error: err => this.error = (err?.error?.error || 'No se pudo eliminar la asignación')
    });
  }

  // Utilidades de UI
  activeCount(){ return this.assignments.filter(x => !x.endedAt).length; }
  endedCount(){ return this.assignments.filter(x => !!x.endedAt).length; }
  filtered(){
    const q = this.search.trim().toLowerCase();
    return this.assignments.filter(a => {
      const matchesQ = !q || (a.driver?.name?.toLowerCase().includes(q) || a.vehicle?.plate?.toLowerCase().includes(q));
      const matchesStatus = this.statusFilter==='ALL' || (this.statusFilter==='ACTIVE' ? !a.endedAt : !!a.endedAt);
      const matchesState = this.stateFilter==='ALL' || ((a as any).status === this.stateFilter);
      return matchesQ && matchesStatus && matchesState;
    });
  }
  sortedFiltered(){
    const list = [...this.filtered()];
    const dir = this.sortDir === 'asc' ? 1 : -1;
    list.sort((a,b) => {
      let av:any, bv:any;
      switch(this.sortKey){
        case 'driver': av = a.driver?.name||''; bv = b.driver?.name||''; break;
        case 'vehicle': av = a.vehicle?.plate||''; bv = b.vehicle?.plate||''; break;
        case 'type': av = a.vehicle?.type||''; bv = b.vehicle?.type||''; break;
        case 'start': av = a.assignedAt; bv = b.assignedAt; break;
        case 'end': av = a.endedAt||''; bv = b.endedAt||''; break;
      }
      return (av>bv?1:av<bv?-1:0)*dir;
    });
    return list;
  }
  paged(){
    const list = this.sortedFiltered();
    const totalPages = Math.max(1, Math.ceil(list.length/this.pageSize));
    if (this.page>totalPages) this.page = totalPages;
    const start = (this.page-1)*this.pageSize;
    return list.slice(start, start+this.pageSize);
  }
  setSort(k:'driver'|'vehicle'|'type'|'start'|'end'){
    if (this.sortKey===k){ this.sortDir = this.sortDir==='asc'?'desc':'asc'; }
    else { this.sortKey = k; this.sortDir = 'asc'; }
  }
  exportCsv(){
    const rows = [['Conductor','Vehículo','Tipo','Inicio','Fin'], ...this.filtered().map(a => [
      a.driver?.name||'', a.vehicle?.plate||'', (a.vehicle?.type==='MOTO'?'Moto':'Carro'), a.assignedAt, a.endedAt||''
    ])];
    const csv = rows.map(r => r.map(x => '"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'asignaciones.csv'; a.click(); URL.revokeObjectURL(url);
  }
  toggleReassign(a: Assignment){
    this.reassignId = (this.reassignId === a.id) ? null : a.id;
    this.reassignVehicleId = null;
  }
  doReassign(a: Assignment){
    this.error = '';
    if (this.reassignId !== a.id) return;
    const newVid = this.reassignVehicleId;
    const driverId = a.driver?.id ?? (a as any).driverId;
    if (!driverId || !newVid){ this.error = 'Seleccione un nuevo vehículo'; return; }
    if ((a.vehicle?.id ?? (a as any).vehicleId) === newVid){ this.error = 'Seleccione un vehículo diferente'; return; }
    if (!confirm('Reasignar al nuevo vehículo?')) return;
    // Finaliza y crea una nueva asignación
    this.loading = true;
    this.api.endAssignment(a.id).subscribe({
      next: _ => {
        this.api.createAssignment(driverId, newVid).subscribe({
          next: _2 => { this.toastSvc.show('Reasignación completada'); this.reassignId = null; this.reassignVehicleId = null; this.cargarDatos(); },
          error: err => this.error = (err?.error?.error || 'No se pudo crear la nueva asignación')
        });
      },
      error: err => this.error = (err?.error?.error || 'No se pudo finalizar la asignación actual')
    });
  }
}

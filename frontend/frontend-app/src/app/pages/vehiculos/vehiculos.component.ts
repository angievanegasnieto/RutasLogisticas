import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { Vehicle } from '../../core/models';

@Component({
  selector: "app-vehiculos",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h3 style="margin:0 0 10px;">Vehículos</h3>
      <div class="row" style="gap:8px; align-items:end;">
        <div class="col"><label>Placa</label><input class="input" [(ngModel)]="plate" (ngModelChange)="detectarTipo()" placeholder="ABC-123 o ABC-12A"></div>
        <div class="col"><label>Modelo</label><input class="input" [(ngModel)]="model" placeholder="Modelo"></div>
        <div class="col">
          <label>Tipo</label>
          <div style="display:flex;gap:8px;align-items:center;">
            <label><input type="radio" name="tipo" [value]="'AUTO'" [(ngModel)]="tipoSeleccionado"> Carro</label>
            <label><input type="radio" name="tipo" [value]="'MOTO'" [(ngModel)]="tipoSeleccionado"> Moto</label>
          </div>
        </div>
        <div class="col"><button class="btn" (click)="crear()">Crear</button></div>
      </div>
      <p class="badge" *ngIf="tipoDetectado!=='DESCONOCIDO'">Detectado: {{ tipoDetectado==='AUTO' ? 'Carro' : (tipoDetectado==='MOTO' ? 'Moto' : 'Inválido') }}</p>
      <p *ngIf="error" style="color:#ef4444;margin-top:8px">{{error}}</p>
    </div>
    <div class="card small" style="margin-top:16px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin:0 0 6px;">
        <h4 style="margin:0;">Listado</h4>
        <div>
          <input class="input" placeholder="Buscar" [(ngModel)]="filter" style="width:180px;margin-right:8px;">
          <button class="btn secondary" (click)="exportCsv()">Exportar CSV</button>
        </div>
      </div>
      <table class="table" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Placa</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Modelo</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Tipo</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Estado</th>
            <th style="padding:6px;border-bottom:1px solid #e5e7eb;"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let v of vehiclesFiltered(); let i = index">
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{v.plate}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{v.model || '-'}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{v.type === 'MOTO' ? 'Moto' : 'Carro'}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">
              <span class="badge" [style.background]="occupiedIds.has(v.id)? '#ef4444' : '#22c55e'">{{ occupiedIds.has(v.id) ? 'Ocupado' : 'Libre' }}</span>
            </td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;text-align:right;">
              <button class="btn secondary" (click)="eliminar(v)" [disabled]="occupiedIds.has(v.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class VehiculosComponent implements OnInit {
  private api = inject(ApiService);
  private toastSvc = inject(ToastService);
  vehicles: Vehicle[] = [];
  occupiedIds = new Set<number>();
  plate = '';
  model = '';
  error = '';
  tipoDetectado: 'AUTO'|'MOTO'|'INVALIDO'|'DESCONOCIDO' = 'DESCONOCIDO';
  tipoSeleccionado: 'AUTO'|'MOTO'|'' = '';
  filter = '';

  ngOnInit(): void {
    this.cargar();
  }
  vehiclesFiltered(){
    const f = this.filter.trim().toLowerCase();
    if (!f) return this.vehicles;
    return this.vehicles.filter(v =>
      v.plate.toLowerCase().includes(f) ||
      (v.model||'').toLowerCase().includes(f) ||
      ((v.type||'').toLowerCase().includes(f))
    );
  }
  exportCsv(){
    const rows = [['Placa','Modelo','Tipo'], ...this.vehicles.map(v => [v.plate, v.model||'', v.type||''])];
    const csv = rows.map(r => r.map(x => '"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'vehiculos.csv';
    a.click(); URL.revokeObjectURL(url);
  }

  cargar(){
    this.api.listVehicles().subscribe(v => this.vehicles = v);
    // Marcar ocupados según asignaciones activas
    this.api.listAssignments().subscribe(a => {
      this.occupiedIds = new Set(a.filter(x => !x.endedAt).map(x => x.vehicle?.id ?? x.vehicleId));
    });
  }

  crear(){
    this.error = '';
    if (!this.plate.trim()) { this.error = 'La placa es obligatoria'; return; }
    this.detectarTipo();
    if (this.tipoDetectado === 'INVALIDO') { this.error = 'Formato de placa inválido. Auto: ABC-123. Moto: ABC-12A'; return; }
    // Si el usuario eligió manualmente, debe coincidir con lo detectado
    if (this.tipoSeleccionado && this.tipoSeleccionado !== (this.tipoDetectado==='MOTO'?'MOTO':'AUTO')){
      this.error = 'El tipo seleccionado no coincide con el formato de la placa';
      return;
    }
    const type = (this.tipoSeleccionado || (this.tipoDetectado==='MOTO'?'MOTO':'AUTO')) as 'AUTO'|'MOTO';
    this.api.createVehicle({ plate: this.plate, model: this.model, type }).subscribe({
      next: v => { this.plate = this.model = ''; this.cargar(); this.toastSvc.show('Vehículo creado'); },
      error: err => this.error = (err?.error?.error || 'No se pudo crear el vehículo')
    });
  }

  detectarTipo(){
    const p = this.plate.trim().toUpperCase();
    const auto = /^[A-Z]{3}-?\d{3}$/;
    const moto = /^[A-Z]{3}-?\d{2}[A-Z]$/;
    if (!p) { this.tipoDetectado = 'DESCONOCIDO'; return; }
    if (auto.test(p)) this.tipoDetectado = 'AUTO';
    else if (moto.test(p)) this.tipoDetectado = 'MOTO';
    else this.tipoDetectado = 'INVALIDO';
  }

  eliminar(v: Vehicle){
    this.error = '';
    if (this.occupiedIds.has(v.id)) { this.error = 'No se puede eliminar: vehículo con asignación activa'; return; }
    if (!confirm(`Eliminar vehículo ${v.plate}?`)) return;
    this.api.deleteVehicle(v.id).subscribe({
      next: () => { this.cargar(); this.toastSvc.show('Vehículo eliminado'); },
      error: err => this.error = (err?.error?.error || 'No se pudo eliminar el vehículo')
    });
  }
}

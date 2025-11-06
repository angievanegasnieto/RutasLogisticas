import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { Driver } from '../../core/models';

@Component({
  selector: "app-conductores",
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h3 style="margin:0 0 10px;">Conductores</h3>
      <div class="row" style="gap:8px; align-items:end;">
        <div class="col"><label>Nombre</label><input class="input" [(ngModel)]="name" placeholder="Nombre"></div>
        <div class="col"><label>Email</label><input class="input" [(ngModel)]="email" placeholder="Email"></div>
        <div class="col"><label>Teléfono</label><input class="input" [(ngModel)]="phone" placeholder="10 dígitos" inputmode="numeric" pattern="\\d*"></div>
        <div class="col"><button class="btn" (click)="crear()">Crear</button></div>
      </div>
      <p *ngIf="nameError" style="color:#ef4444;margin-top:8px">{{nameError}}</p>
      <p *ngIf="phoneError" style="color:#ef4444;margin-top:4px">{{phoneError}}</p>
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
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Nombre</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Email</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Teléfono</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Estado</th>
            <th style="padding:6px;border-bottom:1px solid #e5e7eb;"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let d of driversFiltered()">
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{d.name}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{d.email || 's/d'}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{d.phone || 's/d'}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">
              <span class="badge" [style.background]="occupiedIds.has(d.id)? '#ef4444' : '#22c55e'">{{ occupiedIds.has(d.id) ? 'Ocupado' : 'Libre' }}</span>
            </td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;text-align:right;">
              <button class="btn secondary" (click)="eliminar(d)" [disabled]="occupiedIds.has(d.id)">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `,
})
export class ConductoresComponent implements OnInit {
  private api = inject(ApiService);
  private toastSvc = inject(ToastService);
  drivers: Driver[] = [];
  occupiedIds = new Set<number>();
  name = '';
  email = '';
  phone = '';
  error = '';
  nameError = '';
  phoneError = '';
  filter = '';

  ngOnInit(): void {
    this.cargar();
  }

  cargar(){
    this.api.listDrivers().subscribe(d => this.drivers = d);
    this.api.listAssignments().subscribe(a => {
      this.occupiedIds = new Set(a.filter(x => !x.endedAt).map(x => x.driver?.id ?? x.driverId));
    });
  }

  crear(){
    this.error = '';
    if (!this.name.trim()) { this.error = 'El nombre es obligatorio'; return; }
    const nameOk = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]{2,}$/.test(this.name.trim());
    this.nameError = nameOk ? '' : 'El nombre solo acepta letras y espacios';
    const phoneOk = this.phone ? /^\d{10}$/.test(this.phone.trim()) : true;
    this.phoneError = phoneOk ? '' : 'El teléfono debe tener 10 dígitos';
    if (!nameOk || !phoneOk) return;
    this.api.createDriver({ name: this.name, email: this.email, phone: this.phone }).subscribe({
      next: d => { this.name = this.email = this.phone = ''; this.cargar(); this.toastSvc.show('Conductor creado'); },
      error: err => this.error = (err?.error?.error || 'No se pudo crear el conductor')
    });
  }

  eliminar(d: Driver){
    this.error = '';
    if (this.occupiedIds.has(d.id)) { this.error = 'No se puede eliminar: conductor con asignación activa'; return; }
    if (!confirm(`Eliminar conductor ${d.name}?`)) return;
    this.api.deleteDriver(d.id).subscribe({
      next: () => { this.cargar(); this.toastSvc.show('Conductor eliminado'); },
      error: err => this.error = (err?.error?.error || 'No se pudo eliminar el conductor')
    });
  }

  driversFiltered(){
    const f = this.filter.trim().toLowerCase();
    if (!f) return this.drivers;
    return this.drivers.filter(d =>
      d.name.toLowerCase().includes(f) ||
      (d.email||'').toLowerCase().includes(f) ||
      (d.phone||'').toLowerCase().includes(f)
    );
  }

  exportCsv(){
    const rows = [['Nombre','Email','Teléfono'], ...this.drivers.map(d => [d.name, d.email||'', d.phone||''])];
    const csv = rows.map(r => r.map(x => '"'+String(x).replaceAll('"','""')+'"').join(',')).join('\n');
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'conductores.csv';
    a.click(); URL.revokeObjectURL(url);
  }
}

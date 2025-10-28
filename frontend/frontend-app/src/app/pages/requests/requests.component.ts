import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';

@Component({
  selector: 'app-requests',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card">
      <h3 style="margin:0 0 10px;">Solicitudes de Cambio</h3>
      <div style="display:flex;gap:8px;align-items:end;margin-bottom:8px;">
        <div>
          <label>Estado</label>
          <select class="input" [(ngModel)]="status" (change)="cargar()">
            <option [ngValue]="null">Todos</option>
            <option value="PENDING">Pendiente</option>
            <option value="APPROVED">Aprobada</option>
            <option value="DENIED">Denegada</option>
          </select>
        </div>
        <button class="btn secondary" (click)="cargar()">Refrescar</button>
      </div>
      <p *ngIf="error" style="color:#ef4444;">{{error}}</p>
      <div *ngIf="items.length===0" style="color:#6b7280;">No hay solicitudes.</div>
      <table *ngIf="items.length>0" class="table" style="width:100%;border-collapse:collapse;">
        <thead>
          <tr>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Conductor</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Mensaje</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Estado</th>
            <th style="text-align:left;padding:6px;border-bottom:1px solid #e5e7eb;">Creada</th>
            <th style="padding:6px;border-bottom:1px solid #e5e7eb;"></th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let r of items">
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{r.driver?.name || '-'}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{r.message}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{r.status}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;">{{r.createdAt | date:'short'}}</td>
            <td style="padding:6px;border-bottom:1px solid #f3f4f6;text-align:right;display:flex;gap:6px;justify-content:flex-end;">
              <button class="btn secondary" (click)="aprobar(r)" [disabled]="r.status!=='PENDING'">Aprobar</button>
              <button class="btn secondary" (click)="denegar(r)" [disabled]="r.status!=='PENDING'">Denegar</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class RequestsComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  items: any[] = [];
  error = '';
  status: any = null;

  ngOnInit(): void { this.cargar(); }
  cargar(){
    this.error = '';
    this.api.listRequests(this.status||undefined).subscribe({
      next: (list:any) => this.items = list,
      error: err => this.error = (err?.error?.error || 'No se pudo cargar')
    });
  }
  aprobar(r:any){
    if (!confirm('Aprobar solicitud?')) return;
    this.api.approveRequest(r.id).subscribe({
      next: _ => { this.toast.show('Solicitud aprobada'); this.cargar(); },
      error: err => this.error = (err?.error?.error || 'No se pudo aprobar')
    });
  }
  denegar(r:any){
    if (!confirm('Denegar solicitud?')) return;
    this.api.denyRequest(r.id).subscribe({
      next: _ => { this.toast.show('Solicitud denegada','info'); this.cargar(); },
      error: err => this.error = (err?.error?.error || 'No se pudo denegar')
    });
  }
}

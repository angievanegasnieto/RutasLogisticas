import { Component, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';
import { ApiService } from '../../core/api.service';
import { Assignment, UserView } from '../../core/models';

@Component({
  standalone: true,
  imports: [AsyncPipe, NgIf, DatePipe],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px;">Mi perfil</h2>
      <ng-container *ngIf="vm() as v">
        <div style="display:flex; gap:16px; align-items:center;">
          <img *ngIf="v.user?.avatarUrl" [src]="v.user?.avatarUrl!" alt="avatar" style="width:72px;height:72px;border-radius:50%;object-fit:cover;border:1px solid #e5e7eb;"/>
          <div>
            <div style="font-size:18px;font-weight:600;">{{ v.user?.name }}</div>
            <div style="color:#6b7280;">{{ v.user?.email }}</div>
            <div class="badge" style="margin-top:6px;">{{ v.user?.role }}</div>
          </div>
        </div>
        <div style="margin-top:16px;">
          <div><b>Fecha de ingreso:</b> {{ v.user?.createdAt | date:'medium' }}</div>
          <div><b>Vehículo actual:</b> {{ v.vehicleLabel }}</div>
        </div>
      </ng-container>
    </div>
  `
})
export class ProfileComponent {
  private auth = inject(AuthService);
  private api = inject(ApiService);

  // Simple view-model with async composition
  vm = () => {
    this.auth.me().subscribe((u: UserView) => {
      const email = u.email;
      this.api.getMyActiveAssignment(email).subscribe((a: Assignment | null) => {
        const label = a?.vehicle?.plate ? `${a.vehicle.plate}${a.vehicle.model ? ' · ' + a.vehicle.model : ''}` : 'Sin asignación';
        this._vm = { user: u, vehicleLabel: label };
      });
    });
    return this._vm;
  };
  private _vm: { user: UserView; vehicleLabel: string } | null = null;
}


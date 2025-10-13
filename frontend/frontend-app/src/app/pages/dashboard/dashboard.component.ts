

import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px;">Dashboard</h2>
      <ng-container *ngIf="user && user.role === 'ADMIN'; else noAdmin">
        <button class="btn" style="margin-bottom:16px;" routerLink="/register">Crear cuenta</button>
        <p class="badge">Eres administrador. Puedes crear cuentas y gestionar el sistema.</p>
      </ng-container>
      <ng-template #noAdmin>
        <p style="font-size:1.2em;margin-bottom:8px;">Bienvenido al Sistema de Gestión de Rutas Logísticas</p>
        <p style="color:#555;">Este sistema optimiza, visualiza y monitorea rutas de distribución.</p>
      </ng-template>
    </div>
  `
})
export class DashboardComponent {
  private auth = inject(AuthService);
  get user() { return this.auth.user(); }
}

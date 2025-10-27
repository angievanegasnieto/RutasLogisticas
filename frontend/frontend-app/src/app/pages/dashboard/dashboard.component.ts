import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { UsersAdminComponent } from '../admin/users-admin/users-admin.component';

@Component({
  standalone: true,
  imports: [NgIf, UsersAdminComponent],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px;">Dashboard</h2>
      <ng-container *ngIf="user && user.role === 'ADMIN'; else noAdmin">
        <button class="btn" style="margin-bottom:16px;" (click)="goToRegister()">Crear cuenta</button>
        <p class="badge">Eres administrador. Puedes crear cuentas y gestionar el sistema.</p>
      </ng-container>
      <ng-template #noAdmin>
        <p style="font-size:1.2em;margin-bottom:8px;">Bienvenido al Sistema de Gestion de Rutas Logisticas</p>
        <p style="color:#555;">Este sistema optimiza, visualiza y monitorea rutas de distribucion.</p>
      </ng-template>
    </div>
    <app-users-admin *ngIf="user?.role === 'ADMIN'"></app-users-admin>
  `
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  get user() { return this.auth.user(); }
  goToRegister() {
    this.router.navigateByUrl('/register');
  }
}

import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgIf],
  template: `
    <nav class="top-bar">
      <a routerLink="/dashboard" class="brand" aria-label="Rutas Logisticas">
        <img src="assets/Camion.png" alt="Camion de Rutas Logisticas" class="brand-logo">
        <span class="brand-text">Rutas Logisticas</span>
      </a>
      <span class="right">
        <span class="badge user-name" *ngIf="auth.isLoggedIn()">Hola, {{ auth.user()?.name }}</span>
        <button class="btn secondary" *ngIf="!auth.isLoggedIn()" (click)="goLogin()">Iniciar sesion</button>
        <button class="btn secondary" *ngIf="auth.isLoggedIn()" (click)="logout()">Cerrar sesion</button>
      </span>
    </nav>
    <div class="app-shell">
      <aside class="sidebar" *ngIf="auth.isOperator()">
        <div class="sidebar-title">Operador</div>
        <nav class="sidebar-links">
          <a routerLink="/clientes" routerLinkActive="active">Clientes</a>
        </nav>
      </aside>
      <main class="app-content">
        <div class="container">
          <router-outlet />
        </div>
      </main>
    </div>
  `
})
export class AppComponent {
  auth = inject(AuthService);

  constructor(private router: Router) {}

  goLogin(): void {
    this.router.navigateByUrl('/login');
  }

  logout(): void {
    this.auth.logout();
  }
}

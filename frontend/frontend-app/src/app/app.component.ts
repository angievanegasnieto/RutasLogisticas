import { Component, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from './core/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  template: `
    <nav class="container nav-bar">
      <a routerLink="/dashboard" class="brand" aria-label="Rutas Logisticas">
        <img src="assets/Camion.png" alt="Camion de Rutas Logisticas" class="brand-logo">
        <span class="brand-text">Rutas Logisticas</span>
      </a>
      <span class="right">
        <span class="badge" *ngIf="auth.isLoggedIn()">Hola, {{auth.user()?.name}}</span>
        <button class="btn secondary" *ngIf="!auth.isLoggedIn()" (click)="goLogin()">Iniciar sesion</button>
        <button class="btn secondary" *ngIf="auth.isLoggedIn()" (click)="logout()">Cerrar sesion</button>
      </span>
    </nav>
    <div class="container">
      <router-outlet/>
    </div>
  `
})
export class AppComponent {
  auth = inject(AuthService);
  constructor(private router: Router) {}
  goLogin() { this.router.navigateByUrl('/login'); }
  logout() { this.auth.logout(); }
}

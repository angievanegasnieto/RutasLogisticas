
import { Component, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { AuthService } from './core/auth.service';
import { NgIf } from '@angular/common';
import { ToastsComponent } from './core/toasts.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf, ToastsComponent],
  template: `
    <nav class="container">
      <a routerLink="/" class="brand">Rutas</a>
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <!-- Solo Admin/Operator ven administración -->
      <a routerLink="/asignaciones" routerLinkActive="active" *ngIf="isStaff()">Asignaciones</a>
      <a routerLink="/conductores" routerLinkActive="active" *ngIf="isStaff()">Conductores</a>
      <a routerLink="/vehiculos" routerLinkActive="active" *ngIf="isStaff()">Vehículos</a>
      <a routerLink="/pedidos" routerLinkActive="active" *ngIf="isStaff()">Estado de pedidos</a>
      <a routerLink="/solicitudes" routerLinkActive="active" *ngIf="isAdmin()">Solicitudes</a>
      <a routerLink="/profile" routerLinkActive="active" *ngIf="auth.isLoggedIn()">Perfil</a>
      <span class="right">
        <span class="badge" *ngIf="auth.isLoggedIn()">Hola, {{auth.user()?.name}}</span>
        <button class="btn secondary" *ngIf="!auth.isLoggedIn()" (click)="goLogin()">Iniciar sesión</button>
        <button class="btn secondary" *ngIf="auth.isLoggedIn()" (click)="robustLogout()">Cerrar sesión</button>
      </span>
    </nav>
    <div class="container">
      <router-outlet/>
    </div>
    <app-toasts/>
  `
})
export class AppComponent{
  auth = inject(AuthService);
  constructor(private router: Router){}
  goLogin(){ this.router.navigateByUrl('/login'); }
  logout(){ this.auth.logout(); this.router.navigateByUrl('/login'); }
  // Hacer el logout más robusto, garantizando navegación al login
  // incluso si el router no resuelve inmediatamente.
  async robustLogout(){
    this.auth.logout();
    try{
      const ok = await this.router.navigateByUrl('/login', { replaceUrl: true });
      if (!ok) throw new Error('nav failed');
    }catch{
      // Último recurso: navegación dura
      setTimeout(() => { (window as any).location.href = '/login'; }, 0);
    }
  }
  isAdmin(){ return this.auth.user()?.role === 'ADMIN'; }
  isStaff(){ const r = this.auth.user()?.role; return r === 'ADMIN' || r === 'OPERATOR'; }
}

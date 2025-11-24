
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
    <nav class="navbar" *ngIf="auth.isLoggedIn()">
      <div class="nav-container">
        <!-- Logo y Marca -->
        <a routerLink="/" class="brand-logo">
          <div class="logo-icon">
            <i class="fas fa-route"></i>
          </div>
          <div class="brand-text">
            <span class="brand-name">RutasLog</span>
            <span class="brand-subtitle">Sistema de Gestión</span>
          </div>
        </a>

        <!-- Navegación Principal -->
        <div class="nav-links">
          <a routerLink="/dashboard" routerLinkActive="active" class="nav-link">
            <i class="fas fa-th-large"></i>
            <span>Dashboard</span>
          </a>

          <!-- Menú para OPERADOR -->
          <ng-container *ngIf="auth.isOperator()">
            <a routerLink="/clientes" routerLinkActive="active" class="nav-link">
              <i class="fas fa-building"></i>
              <span>Clientes</span>
            </a>
            <a routerLink="/asignaciones" routerLinkActive="active" class="nav-link">
              <i class="fas fa-user-tie"></i>
              <span>Asignaciones</span>
            </a>
            <a routerLink="/vehiculos" routerLinkActive="active" class="nav-link">
              <i class="fas fa-truck"></i>
              <span>Vehículos</span>
            </a>
            <a routerLink="/pedidos-operador" routerLinkActive="active" class="nav-link">
              <i class="fas fa-box"></i>
              <span>Pedidos</span>
            </a>
            <a routerLink="/reportes" routerLinkActive="active" class="nav-link">
              <i class="fas fa-chart-bar"></i>
              <span>Reportes Entregados</span>
            </a>
            <a routerLink="/reportes-pedidos" routerLinkActive="active" class="nav-link">
              <i class="fas fa-file-alt"></i>
              <span>Reportes Pedidos</span>
            </a>
          </ng-container>

          <!-- Menú para CONDUCTOR -->
          <ng-container *ngIf="auth.user()?.role === 'CONDUCTOR'">
            <a routerLink="/pedidos" routerLinkActive="active" class="nav-link">
              <i class="fas fa-clipboard-list"></i>
              <span>Pedidos</span>
            </a>
            <a routerLink="/rutas" routerLinkActive="active" class="nav-link">
              <i class="fas fa-map-marked-alt"></i>
              <span>Mis Rutas</span>
            </a>
          </ng-container>
        </div>

        <!-- Usuario y Sesión -->
        <div class="nav-right">
          <a routerLink="/profile" routerLinkActive="active" class="nav-link profile-link" *ngIf="auth.isLoggedIn()">
            <i class="fas fa-user-circle"></i>
            <span class="user-name">{{auth.user()?.name}}</span>
          </a>
          <button class="btn-logout" *ngIf="auth.isLoggedIn()" (click)="robustLogout()">
            <i class="fas fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </div>
    </nav>
    <div class="main-container">
      <router-outlet/>
    </div>
    <app-toasts/>

    <style>
      .navbar {
        background: linear-gradient(135deg, #1a1f35 0%, #2d3748 100%);
        border-bottom: 2px solid rgba(102,126,234,0.3);
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        position: sticky;
        top: 0;
        z-index: 1000;
      }

      .nav-container {
        max-width: 1800px;
        margin: 0 auto;
        padding: 12px 24px;
        display: flex;
        align-items: center;
        gap: 32px;
      }

      .brand-logo {
        display: flex;
        align-items: center;
        gap: 12px;
        text-decoration: none;
        transition: transform 0.3s ease;
      }

      .brand-logo:hover {
        transform: translateY(-2px);
      }

      .logo-icon {
        width: 48px;
        height: 48px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24px;
        color: white;
        box-shadow: 0 4px 15px rgba(102,126,234,0.4);
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { box-shadow: 0 4px 15px rgba(102,126,234,0.4); }
        50% { box-shadow: 0 4px 25px rgba(102,126,234,0.6); }
      }

      .brand-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .brand-name {
        font-size: 22px;
        font-weight: 800;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        letter-spacing: -0.5px;
      }

      .brand-subtitle {
        font-size: 11px;
        color: #94a3b8;
        font-weight: 500;
        letter-spacing: 0.5px;
      }

      .nav-links {
        display: flex;
        align-items: center;
        gap: 8px;
        flex: 1;
      }

      .nav-link {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        border-radius: 10px;
        text-decoration: none;
        color: #cbd5e1;
        font-size: 14px;
        font-weight: 600;
        transition: all 0.3s ease;
        position: relative;
      }

      .nav-link i {
        font-size: 16px;
      }

      .nav-link:hover {
        background: rgba(102,126,234,0.15);
        color: #fff;
        transform: translateY(-1px);
      }

      .nav-link.active {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102,126,234,0.3);
      }

      .nav-link.active::before {
        content: '';
        position: absolute;
        bottom: -12px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background: #667eea;
        border-radius: 50%;
        box-shadow: 0 0 10px #667eea;
      }

      .nav-right {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .profile-link {
        background: rgba(102,126,234,0.1);
        border: 1px solid rgba(102,126,234,0.2);
      }

      .user-name {
        max-width: 120px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .btn-login, .btn-logout {
        padding: 10px 20px;
        border: none;
        border-radius: 10px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .btn-login {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        box-shadow: 0 4px 12px rgba(102,126,234,0.3);
      }

      .btn-login:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(102,126,234,0.4);
      }

      .btn-logout {
        background: rgba(239,68,68,0.1);
        color: #ef4444;
        border: 1px solid rgba(239,68,68,0.3);
      }

      .btn-logout:hover {
        background: #ef4444;
        color: white;
        transform: translateY(-2px);
      }

      .main-container {
        min-height: calc(100vh - 80px);
        padding: 24px;
      }

      @media (max-width: 1200px) {
        .brand-subtitle {
          display: none;
        }
        .nav-link span {
          display: none;
        }
        .user-name {
          display: none;
        }
      }

      @media (max-width: 768px) {
        .nav-container {
          gap: 16px;
        }
        .nav-links {
          gap: 4px;
        }
        .nav-link {
          padding: 8px;
        }
      }
    </style>
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
  isStaff(){ 
    const r = this.auth.user()?.role; 
    return r === 'ADMIN' || r === 'OPERADOR'; 
  }
}

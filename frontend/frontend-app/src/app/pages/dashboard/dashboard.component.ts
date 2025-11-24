import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { UsersAdminComponent } from '../admin/users-admin/users-admin.component';

@Component({
  standalone: true,
  imports: [NgIf, RouterLink, UsersAdminComponent],
  template: `
    <div class="dashboard-container">
      <!-- Header del Dashboard -->
      <div class="dashboard-header">
        <div class="header-content">
          <div class="welcome-section">
            <h1 class="dashboard-title">
              <i class="fas fa-chart-line"></i> Dashboard
            </h1>
            <p class="dashboard-subtitle">{{getWelcomeMessage()}}</p>
          </div>
          <div class="user-badge-large">
            <div class="badge-icon">
              <i class="fas" [class.fa-user-shield]="user?.role === 'ADMIN'" 
                 [class.fa-user-cog]="user?.role === 'OPERADOR'"
                 [class.fa-user-tie]="user?.role === 'CONDUCTOR'"></i>
            </div>
            <div class="badge-info">
              <span class="badge-name">{{user?.name}}</span>
              <span class="badge-role">{{getRoleLabel()}}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Vista para ADMIN: Gestión de usuarios -->
      <ng-container *ngIf="user?.role === 'ADMIN'">
        <div class="info-banner admin-banner">
          <i class="fas fa-crown"></i>
          <div>
            <h3>Panel de Administración</h3>
            <p>Gestiona usuarios, permisos y configuración del sistema</p>
          </div>
        </div>
        <app-users-admin></app-users-admin>
      </ng-container>
      
      <!-- Vista para OPERADOR: Cards de gestión operativa -->
      <ng-container *ngIf="user?.role === 'OPERADOR'">
        <div class="info-banner operator-banner">
          <i class="fas fa-briefcase"></i>
          <div>
            <h3>Panel Operativo</h3>
            <p>Gestiona asignaciones, vehículos, pedidos y rutas del sistema</p>
          </div>
        </div>

        <div class="cards-grid">
          <a routerLink="/clientes" class="dashboard-card card-pink">
            <div class="card-icon">
              <i class="fas fa-building"></i>
            </div>
            <div class="card-content">
              <h3>Clientes</h3>
              <p>Gestiona clientes y sus direcciones</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>

          <a routerLink="/asignaciones-vehiculo" class="dashboard-card card-purple">
            <div class="card-icon">
              <i class="fas fa-user-tie"></i>
            </div>
            <div class="card-content">
              <h3>Asignaciones de Vehículos</h3>
              <p>Asigna conductores a vehículos</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>

          <a routerLink="/vehiculos" class="dashboard-card card-blue">
            <div class="card-icon">
              <i class="fas fa-truck"></i>
            </div>
            <div class="card-content">
              <h3>Gestionar Vehículos</h3>
              <p>Administra la flota de vehículos</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>

          <a routerLink="/pedidos-operador" class="dashboard-card card-green">
            <div class="card-icon">
              <i class="fas fa-box"></i>
            </div>
            <div class="card-content">
              <h3>Pedidos</h3>
              <p>Gestiona pedidos y entregas</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>

          <a routerLink="/reportes" class="dashboard-card card-purple">
            <div class="card-icon">
              <i class="fas fa-chart-bar"></i>
            </div>
            <div class="card-content">
              <h3>Reportes Entregados</h3>
              <p>Reportes de pedidos entregados</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>

          <a routerLink="/reportes-pedidos" class="dashboard-card card-orange">
            <div class="card-icon">
              <i class="fas fa-file-alt"></i>
            </div>
            <div class="card-content">
              <h3>Reportes Pedidos</h3>
              <p>Reportes por estado en Excel y CSV</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>
        </div>
      </ng-container>
      
      <!-- Vista para CONDUCTOR: Cards de visualización -->
      <ng-container *ngIf="user?.role === 'CONDUCTOR'">
        <div class="info-banner conductor-banner">
          <i class="fas fa-id-badge"></i>
          <div>
            <h3>Panel del Conductor</h3>
            <p>Accede a tus pedidos y rutas</p>
          </div>
        </div>

        <div class="cards-grid">
          <a routerLink="/pedidos" class="dashboard-card card-cyan">
            <div class="card-icon">
              <i class="fas fa-clipboard-list"></i>
            </div>
            <div class="card-content">
              <h3>Estado de Pedidos</h3>
              <p>Consulta el estado de tus entregas</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>

          <a routerLink="/rutas" class="dashboard-card card-indigo">
            <div class="card-icon">
              <i class="fas fa-map-marked-alt"></i>
            </div>
            <div class="card-content">
              <h3>Mis Rutas</h3>
              <p>Visualiza tus rutas asignadas</p>
            </div>
            <div class="card-arrow">
              <i class="fas fa-arrow-right"></i>
            </div>
          </a>
        </div>
      </ng-container>
    </div>

    <style>
      .dashboard-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 24px;
      }

      .dashboard-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 20px;
        padding: 40px;
        margin-bottom: 32px;
        box-shadow: 0 10px 40px rgba(102,126,234,0.3);
        position: relative;
        overflow: hidden;
      }

      .dashboard-header::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 400px;
        height: 400px;
        background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
        border-radius: 50%;
        transform: translate(30%, -30%);
      }

      .header-content {
        position: relative;
        z-index: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 24px;
      }

      .welcome-section {
        flex: 1;
      }

      .dashboard-title {
        margin: 0 0 8px;
        font-size: 36px;
        font-weight: 800;
        color: white;
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .dashboard-subtitle {
        margin: 0;
        font-size: 18px;
        color: rgba(255,255,255,0.9);
        font-weight: 500;
      }

      .user-badge-large {
        display: flex;
        align-items: center;
        gap: 16px;
        background: rgba(255,255,255,0.15);
        backdrop-filter: blur(10px);
        padding: 16px 24px;
        border-radius: 16px;
        border: 1px solid rgba(255,255,255,0.2);
      }

      .badge-icon {
        width: 56px;
        height: 56px;
        background: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        color: #667eea;
      }

      .badge-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .badge-name {
        font-size: 18px;
        font-weight: 700;
        color: white;
      }

      .badge-role {
        font-size: 13px;
        color: rgba(255,255,255,0.8);
        font-weight: 500;
      }

      .info-banner {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 24px;
        border-radius: 16px;
        margin-bottom: 32px;
        border-left: 4px solid;
      }

      .info-banner i {
        font-size: 40px;
      }

      .info-banner h3 {
        margin: 0 0 6px;
        font-size: 20px;
        font-weight: 700;
      }

      .info-banner p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .admin-banner {
        background: linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.1) 100%);
        border-left-color: #f59e0b;
        color: #78350f;
      }

      .operator-banner {
        background: linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(37,99,235,0.1) 100%);
        border-left-color: #3b82f6;
        color: #1e3a8a;
      }

      .conductor-banner {
        background: linear-gradient(135deg, rgba(16,185,129,0.1) 0%, rgba(5,150,105,0.1) 100%);
        border-left-color: #10b981;
        color: #064e3b;
      }

      .cards-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
        gap: 24px;
      }

      .dashboard-card {
        position: relative;
        background: #1e1e1e;
        border-radius: 20px;
        padding: 28px;
        text-decoration: none;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        border: 2px solid transparent;
        overflow: hidden;
        display: flex;
        align-items: center;
        gap: 20px;
      }

      .dashboard-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        opacity: 0;
        transition: opacity 0.4s;
      }

      .dashboard-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        border-color: currentColor;
      }

      .dashboard-card:hover::before {
        opacity: 0.08;
      }

      .card-icon {
        width: 64px;
        height: 64px;
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 28px;
        flex-shrink: 0;
        transition: transform 0.4s;
      }

      .dashboard-card:hover .card-icon {
        transform: scale(1.1) rotate(5deg);
      }

      .card-content {
        flex: 1;
      }

      .card-content h3 {
        margin: 0 0 8px;
        font-size: 18px;
        font-weight: 700;
        color: #e2e8f0;
      }

      .card-content p {
        margin: 0;
        font-size: 14px;
        color: #94a3b8;
        line-height: 1.5;
      }

      .card-arrow {
        font-size: 20px;
        color: #64748b;
        transition: transform 0.4s;
      }

      .dashboard-card:hover .card-arrow {
        transform: translateX(8px);
        color: currentColor;
      }

      .card-badge {
        position: absolute;
        top: 16px;
        right: 16px;
        background: rgba(251,191,36,0.2);
        color: #fbbf24;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 6px;
        backdrop-filter: blur(10px);
      }

      .featured {
        grid-column: span 2;
      }

      @media (max-width: 768px) {
        .featured {
          grid-column: span 1;
        }
      }

      /* Colores de las cards */
      .card-purple { color: #a78bfa; }
      .card-purple .card-icon { background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); color: white; }
      .card-purple::before { background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%); }

      .card-blue { color: #60a5fa; }
      .card-blue .card-icon { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); color: white; }
      .card-blue::before { background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%); }

      .card-green { color: #4ade80; }
      .card-green .card-icon { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); color: white; }
      .card-green::before { background: linear-gradient(135deg, #4ade80 0%, #22c55e 100%); }

      .card-orange { color: #fb923c; }
      .card-orange .card-icon { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); color: white; }
      .card-orange::before { background: linear-gradient(135deg, #fb923c 0%, #f97316 100%); }

      .card-red { color: #f87171; }
      .card-red .card-icon { background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); color: white; }
      .card-red::before { background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); }

      .card-cyan { color: #22d3ee; }
      .card-cyan .card-icon { background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); color: white; }
      .card-cyan::before { background: linear-gradient(135deg, #22d3ee 0%, #06b6d4 100%); }

      .card-indigo { color: #818cf8; }
      .card-indigo .card-icon { background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%); color: white; }
      .card-indigo::before { background: linear-gradient(135deg, #818cf8 0%, #6366f1 100%); }

      .card-pink { color: #f472b6; }
      .card-pink .card-icon { background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%); color: white; }
      .card-pink::before { background: linear-gradient(135deg, #f472b6 0%, #ec4899 100%); }
    </style>
  `,
  styles: []
})
export class DashboardComponent {
  private auth = inject(AuthService);
  
  get user() { return this.auth.user(); }

  getWelcomeMessage(): string {
    const role = this.user?.role;
    if (role === 'ADMIN') return 'Panel de administración del sistema';
    if (role === 'OPERADOR') return 'Gestiona las operaciones del día a día';
    if (role === 'CONDUCTOR') return 'Bienvenido a tu panel de conductor';
    return 'Bienvenido al sistema';
  }

  getRoleLabel(): string {
    const role = this.user?.role;
    if (role === 'ADMIN') return 'Administrador';
    if (role === 'OPERADOR') return 'Operador';
    if (role === 'CONDUCTOR') return 'Conductor';
    return 'Usuario';
  }
}

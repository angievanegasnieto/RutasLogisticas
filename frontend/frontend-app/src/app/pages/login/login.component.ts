
import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
  <div class="login-container">
    <div class="login-card">
      <!-- Logo y Marca -->
      <div class="login-header">
        <div class="logo-section">
          <div class="logo-icon">
            <i class="fas fa-route"></i>
          </div>
          <div class="brand-text">
            <h1>RutasLog</h1>
            <p>Sistema de Gestión Logística</p>
          </div>
        </div>
      </div>

      <!-- Alerta de sesión expirada -->
      <div class="session-alert" *ngIf="expiredSession">
        <i class="fas fa-clock"></i>
        <span>Tu sesión ha expirado. Por favor, inicia sesión nuevamente.</span>
      </div>

      <!-- Formulario -->
      <form (ngSubmit)="doLogin()" novalidate class="login-form">
        <div class="form-group">
          <label>
            <i class="fas fa-envelope"></i>
            <span>Correo Electrónico</span>
          </label>
          <input 
            class="form-input" 
            name="email" 
            type="email"
            placeholder="tu@email.com" 
            [(ngModel)]="email"
            autocomplete="email">
        </div>

        <div class="form-group">
          <label>
            <i class="fas fa-lock"></i>
            <span>Contraseña</span>
          </label>
          <input 
            class="form-input" 
            type="password" 
            name="password" 
            placeholder="••••••••" 
            [(ngModel)]="password"
            autocomplete="current-password">
        </div>

        <button class="btn-login" type="submit">
          <i class="fas fa-sign-in-alt"></i>
          <span>Iniciar Sesión</span>
        </button>

        <div class="error-message" *ngIf="error">
          <i class="fas fa-exclamation-circle"></i>
          <span>{{error}}</span>
        </div>
      </form>

      <!-- Footer -->
      <div class="login-footer">
        <p>
          <i class="fas fa-shield-alt"></i>
          Acceso seguro al sistema
        </p>
      </div>
    </div>

    <!-- Decoración de fondo -->
    <div class="background-decoration">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
      <div class="circle circle-3"></div>
    </div>
  </div>

  <style>
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
      position: relative;
      overflow: hidden;
    }

    .background-decoration {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
      pointer-events: none;
    }

    .circle {
      position: absolute;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%);
      animation: float 20s infinite ease-in-out;
    }

    .circle-1 {
      width: 500px;
      height: 500px;
      top: -250px;
      left: -250px;
    }

    .circle-2 {
      width: 400px;
      height: 400px;
      bottom: -200px;
      right: -200px;
      animation-delay: -10s;
    }

    .circle-3 {
      width: 300px;
      height: 300px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      animation-delay: -5s;
    }

    @keyframes float {
      0%, 100% { transform: translate(0, 0) scale(1); }
      50% { transform: translate(50px, 50px) scale(1.1); }
    }

    .login-card {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      background: rgba(30,41,59,0.95);
      backdrop-filter: blur(20px);
      border-radius: 24px;
      padding: 48px;
      box-shadow: 0 25px 60px rgba(0,0,0,0.5), 0 0 1px rgba(102,126,234,0.3);
      border: 1px solid rgba(148,163,184,0.1);
    }

    .login-header {
      margin-bottom: 40px;
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 20px;
      justify-content: center;
    }

    .logo-icon {
      width: 72px;
      height: 72px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 36px;
      color: white;
      box-shadow: 0 8px 24px rgba(102,126,234,0.4);
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { box-shadow: 0 8px 24px rgba(102,126,234,0.4); }
      50% { box-shadow: 0 8px 32px rgba(102,126,234,0.6); }
    }

    .brand-text {
      text-align: left;
    }

    .brand-text h1 {
      margin: 0 0 6px;
      font-size: 32px;
      font-weight: 800;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      letter-spacing: -0.5px;
    }

    .brand-text p {
      margin: 0;
      font-size: 14px;
      color: #94a3b8;
      font-weight: 500;
    }

    .session-alert {
      display: flex;
      align-items: center;
      gap: 12px;
      background: linear-gradient(135deg, rgba(245,158,11,0.15) 0%, rgba(217,119,6,0.15) 100%);
      border: 1px solid rgba(245,158,11,0.3);
      border-radius: 12px;
      padding: 14px 18px;
      margin-bottom: 28px;
      color: #fbbf24;
      font-size: 14px;
      line-height: 1.5;
    }

    .session-alert i {
      font-size: 18px;
      flex-shrink: 0;
    }

    .login-form {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 14px;
      font-weight: 600;
      color: #cbd5e1;
    }

    .form-group label i {
      color: #667eea;
      font-size: 16px;
    }

    .form-input {
      width: 100%;
      padding: 14px 16px;
      background: rgba(15,23,42,0.6);
      border: 2px solid rgba(148,163,184,0.2);
      border-radius: 12px;
      color: #e2e8f0;
      font-size: 15px;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-input::placeholder {
      color: #64748b;
    }

    .form-input:focus {
      outline: none;
      border-color: #667eea;
      background: rgba(15,23,42,0.8);
      box-shadow: 0 0 0 4px rgba(102,126,234,0.1);
    }

    .btn-login {
      width: 100%;
      padding: 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border: none;
      border-radius: 12px;
      color: white;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      box-shadow: 0 8px 20px rgba(102,126,234,0.3);
      margin-top: 8px;
    }

    .btn-login:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 28px rgba(102,126,234,0.4);
    }

    .btn-login:active {
      transform: translateY(0);
    }

    .error-message {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, rgba(239,68,68,0.15) 0%, rgba(220,38,38,0.15) 100%);
      border: 1px solid rgba(239,68,68,0.3);
      border-radius: 12px;
      padding: 14px 18px;
      color: #fca5a5;
      font-size: 14px;
      line-height: 1.5;
    }

    .error-message i {
      font-size: 18px;
      flex-shrink: 0;
    }

    .login-footer {
      margin-top: 32px;
      padding-top: 24px;
      border-top: 1px solid rgba(148,163,184,0.1);
      text-align: center;
    }

    .login-footer p {
      margin: 0;
      font-size: 13px;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .login-footer i {
      color: #667eea;
    }

    @media (max-width: 640px) {
      .login-card {
        padding: 32px 24px;
      }

      .logo-icon {
        width: 60px;
        height: 60px;
        font-size: 28px;
      }

      .brand-text h1 {
        font-size: 26px;
      }
    }
  </style>
  `
})
export class LoginComponent{
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; error='';
  expiredSession = sessionStorage.getItem('sessionExpired') === '1';

  constructor() {
    if (this.expiredSession) {
      sessionStorage.removeItem('sessionExpired');
    }
  }

  doLogin(){
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: res => { this.auth.saveSession(res); this.router.navigateByUrl('/dashboard'); },
      error: err => this.error = 'Usuario o contrasena incorrectos. Intenta de nuevo.'
    });
  }
}

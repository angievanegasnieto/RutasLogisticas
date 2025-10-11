
import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, RouterLink, NgIf],
  template: `
  <div class="card" style="max-width:520px;margin:40px auto;">
    <h2 style="margin:0 0 10px;">Iniciar sesión</h2>
    <p class="badge">rutas logisticas</p>
    <div class="row">
      <div class="col"><input class="input" placeholder="Email" [(ngModel)]="email"></div>
    </div>
    <div class="row">
      <div class="col"><input class="input" type="password" placeholder="Contraseña" [(ngModel)]="password"></div>
    </div>
    <div class="row">
      <div class="col"><button class="btn" (click)="doLogin()">Entrar</button></div>
      <div class="col"><a routerLink="/register" class="btn secondary" style="display:inline-block;text-align:center">Crear cuenta</a></div>
    </div>
    <p *ngIf="error" style="color:#ef4444;margin-top:8px">{{error}}</p>
  </div>
  `
})
export class LoginComponent{
  private auth = inject(AuthService);
  private router = inject(Router);
  email = ''; password = ''; error='';

  doLogin(){
    this.error = '';
    this.auth.login(this.email, this.password).subscribe({
      next: res => { this.auth.saveSession(res); this.router.navigateByUrl('/dashboard'); },
      error: err => this.error = 'Credenciales inválidas'
    });
  }
}


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
    <p class="badge">rutas logísticas</p>
    <div class="row">
      <div class="col"><input class="input" placeholder="Email" [(ngModel)]="email"></div>
    </div>
    <div class="row">
      <div class="col"><input class="input" type="password" placeholder="Contraseña" [(ngModel)]="password"></div>
    </div>
    <div class="row">
      <div class="col"><button class="btn" (click)="doLogin()">Entrar</button></div>
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
    const email = (this.email || '').trim().toLowerCase();
    const password = (this.password || '').trim();
    this.auth.login(email, password).subscribe({
      next: res => { this.auth.saveSession(res); this.router.navigateByUrl('/dashboard'); },
      error: err => this.error = 'Credenciales inválidas'
    });
  }
}

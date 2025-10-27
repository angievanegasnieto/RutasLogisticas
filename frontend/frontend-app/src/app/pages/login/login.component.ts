
import { Component, inject } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule, NgIf],
  template: `
  <div class="card" style="max-width:520px;margin:40px auto;">
    <h2 style="margin:0 0 10px;">Iniciar sesion</h2>
    <p class="badge">rutas logisticas</p>
    <p *ngIf="expiredSession" style="background:#fef3c7;color:#92400e;padding:8px 12px;border-radius:6px;margin:0 0 12px;">
      Tu sesion expiro, por favor inicia de nuevo.
    </p>
    <form (ngSubmit)="doLogin()" novalidate>
      <div class="row">
        <div class="col"><input class="input" name="email" placeholder="Email" [(ngModel)]="email"></div>
      </div>
      <div class="row">
        <div class="col"><input class="input" type="password" name="password" placeholder="Contrasena" [(ngModel)]="password"></div>
      </div>
      <div class="row">
        <div class="col"><button class="btn" type="submit">Entrar</button></div>
      </div>
    </form>
    <p *ngIf="error" style="color:#ef4444;margin-top:8px">{{error}}</p>
  </div>
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

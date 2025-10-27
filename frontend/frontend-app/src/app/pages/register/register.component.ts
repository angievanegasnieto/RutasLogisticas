
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  imports: [FormsModule],
  template: `
  <div class="card" style="max-width:520px;margin:40px auto;">
    <h2 style="margin:0 0 10px;">Crear cuenta</h2>
    <div class="row"><div class="col"><input class="input" placeholder="Nombre" [(ngModel)]="name"></div></div>
    <div class="row"><div class="col"><input class="input" placeholder="Email" [(ngModel)]="email"></div></div>
    <div class="row"><div class="col"><input class="input" type="password" placeholder="Contrasena" [(ngModel)]="password"></div></div>
    <div class="row"><div class="col">
      <select class="input" [(ngModel)]="role">
        <option value="ADMIN">Administrador</option>
        <option value="OPERADOR">Operador</option>
        <option value="CONDUCTOR">Conductor</option>
      </select>
    </div></div>
    <div class="row"><div class="col"><button class="btn" (click)="doRegister()">Crear</button></div></div>
  </div>
  `
})
export class RegisterComponent{
  private auth = inject(AuthService);
  private router = inject(Router);
  name=''; email=''; password='';
  role: 'ADMIN' | 'OPERADOR' | 'CONDUCTOR' = 'OPERADOR';

  doRegister(){
    this.auth.register(this.name, this.email, this.password, this.role).subscribe({
      next: res => { this.auth.saveSession(res); this.router.navigateByUrl('/dashboard'); }
    });
  }
}

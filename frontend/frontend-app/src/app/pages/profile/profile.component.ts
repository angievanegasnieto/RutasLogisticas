import { Component, inject } from "@angular/core";
import { AsyncPipe } from "@angular/common";
import { AuthService } from "../../core/auth.service";

@Component({
  standalone: true,
  imports: [AsyncPipe],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px;">Mi perfil</h2>
      <div *ngIf="auth.me() | async as me">
        <p><strong>Nombre:</strong> {{ me.name }}</p>
        <p><strong>Email:</strong> {{ me.email }}</p>
        <p><strong>Rol:</strong> {{ me.role }}</p>
        <p *ngIf="me.role === 'ADMIN'" style="color:#075985">
          Eres administrador. Puedes crear cuentas y gestionar el sistema.
        </p>
      </div>
    </div>
  `,
})
export class ProfileComponent {
  auth = inject(AuthService);
}

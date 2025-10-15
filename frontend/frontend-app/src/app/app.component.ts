import { Component, computed, inject } from "@angular/core";
import { RouterOutlet, RouterLink, Router } from "@angular/router";
import { AuthService } from "./core/auth.service";
import { NgIf } from "@angular/common";

@Component({
  selector: "app-root",
  standalone: true,
  imports: [RouterOutlet, RouterLink, NgIf],
  template: `
    <nav class="container">
      <a routerLink="/" class="brand">🚚 Rutas</a>
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a
        routerLink="/admin/users"
        routerLinkActive="active"
        *ngIf="auth.isAdmin()"
        >Administración</a
      >
      <a
        routerLink="/profile"
        routerLinkActive="active"
        *ngIf="auth.isLoggedIn()"
        >Perfil</a
      >
      <span class="right">
        <span class="badge" *ngIf="auth.isLoggedIn()"
          >Hola, {{ auth.user()?.name }}</span
        >
        <button
          class="btn secondary"
          *ngIf="!auth.isLoggedIn()"
          (click)="goLogin()"
        >
          Iniciar sesión
        </button>
        <button
          class="btn secondary"
          *ngIf="auth.isLoggedIn()"
          (click)="logout()"
        >
          Cerrar sesión
        </button>
      </span>
    </nav>
    <div class="container">
      <router-outlet />
    </div>
  `,
})
export class AppComponent {
  auth = inject(AuthService);
  constructor(private router: Router) {}
  goLogin() {
    this.router.navigateByUrl("/login");
  }
  logout() {
    this.auth.logout();
    this.router.navigateByUrl("/login");
  }
}

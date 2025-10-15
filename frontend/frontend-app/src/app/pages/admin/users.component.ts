import { Component, inject } from "@angular/core";
import { NgFor, NgIf } from "@angular/common";
import { RouterLink } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import { firstValueFrom } from "rxjs";

interface UserView {
  id: number;
  name: string;
  email: string;
  role: string;
}

@Component({
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <div class="card" style="max-width:900px;margin:20px auto;">
      <h2>Gestión de usuarios</h2>
      <p *ngIf="!isAdmin" style="color:#ef4444">
        Acceso denegado. Solo administradores.
      </p>
      <div *ngIf="isAdmin">
        <p>Eres administrador. Puedes crear cuentas y gestionar el sistema.</p>
        <div style="margin:10px 0">
          <a routerLink="/register" class="btn">Crear cuenta</a>
        </div>
        <p *ngIf="loading">Cargando usuarios…</p>
        <p *ngIf="loadError" style="color:#ef4444">{{ loadError }}</p>
        <table style="width:100%;border-collapse:collapse">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of users">
              <td>{{ u.id }}</td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
              <td>
                <button class="btn" (click)="remove(u)">Eliminar</button>
              </td>
            </tr>
            <tr *ngIf="!loading && users.length === 0 && !loadError">
              <td colspan="5" style="text-align:center;padding:10px">
                No hay usuarios
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class AdminUsersComponent {
  private auth = inject(AuthService);
  isAdmin = this.auth.isAdmin();
  users: UserView[] = [];
  loading = false;
  loadError: string | null = null;

  constructor() {
    if (this.isAdmin) this.load();
  }

  async load() {
    this.loading = true;
    this.loadError = null;
    try {
      try {
        this.users = await firstValueFrom(this.auth.getUsers());
      } catch (err: any) {
        // if unauthorized, try debug endpoint
        const status = err && err.status ? err.status : null;
        if (status === 401 || status === 403) {
          console.warn(
            "Protected users endpoint unauthorized, trying debug endpoint"
          );
          this.users = await firstValueFrom(this.auth.getUsersDebug());
        } else {
          throw err;
        }
      }
    } catch (e: any) {
      console.error("failed loading users", e);
      const status = e && e.status ? e.status : "n/a";
      const msg = e && e.message ? e.message : JSON.stringify(e);
      if (status === 401 || status === 403) {
        this.loadError = `No autorizado (${status}). Por favor inicia sesión como administrador.`;
      } else {
        this.loadError = `Error al cargar usuarios (${status}): ${msg}`;
      }
    } finally {
      this.loading = false;
    }
  }

  async remove(u: UserView) {
    if (!confirm(`Eliminar usuario ${u.email}?`)) return;
    try {
      await firstValueFrom(this.auth.deleteUser(u.id));
      this.users = this.users.filter((x) => x.id !== u.id);
    } catch (e) {
      console.error("delete failed", e);
      alert("No se pudo eliminar el usuario");
    }
  }
}

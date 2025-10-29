import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService, UserPayload } from '../../../core/users.service';
import { AuthService } from '../../../core/auth.service';
import { Role, UserView } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-users-admin',
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    .header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      margin-bottom: 16px;
      flex-wrap: wrap;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }
    th {
      background: #f3f4f6;
      text-transform: uppercase;
      font-size: 12px;
      letter-spacing: 0.05em;
      color: #374151;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(17, 24, 39, 0.55);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      z-index: 1000;
    }
    .modal {
      background: #fff;
      border-radius: 10px;
      max-width: 520px;
      width: 100%;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
      padding: 24px;
    }
    .modal h3 {
      margin: 0 0 12px;
    }
    .modal form {
      display: grid;
      gap: 12px;
    }
    .row {
      display: grid;
      gap: 12px;
    }
    .input, select, textarea {
      width: 100%;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 10px 12px;
      font-size: 15px;
    }
    .btn {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 6px;
      padding: 10px 16px;
      font-weight: 600;
      cursor: pointer;
    }
    .btn.secondary {
      background: #e5e7eb;
      color: #111827;
    }
    .btn.danger {
      background: #dc2626;
    }
    .alert {
      padding: 10px 14px;
      border-radius: 6px;
      margin-bottom: 14px;
    }
    .alert.error { background: #fee2e2; color: #991b1b; }
    .alert.info { background: #dbeafe; color: #1d4ed8; }
    .badge {
      display: inline-block;
      background: #111827;
      color: #fff;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    @media (max-width: 640px) {
      .actions { width: 100%; }
      .btn { flex: 1 1 auto; text-align: center; }
    }
  `],
  template: `
    <div class="card">
      <div class="header">
        <div>
          <h2 style="margin:0;">Administracion de usuarios</h2>
          <p style="margin:4px 0 0;color:#6b7280;">Gestiona roles de Administrador, Operador y Conductor.</p>
        </div>
      </div>

      <p *ngIf="error()" class="alert error">{{ error() }}</p>
      <p *ngIf="notice()" class="alert info">{{ notice() }}</p>

      <div *ngIf="loading()" style="padding:20px 0;color:#6b7280;">Cargando usuarios...</div>

      <ng-container *ngIf="!loading() && users.length; else emptyState">
        <div style="overflow-x:auto;">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th style="width:160px;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td><span class="badge">{{ user.role }}</span></td>
                <td>
                  <div class="actions">
                    <button class="btn secondary" (click)="openEdit(user)">Editar</button>
                    <button class="btn danger" [disabled]="isCurrent(user)" (click)="remove(user)">Eliminar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </ng-container>

      <ng-template #emptyState>
        <div style="padding:24px;text-align:center;color:#6b7280;border:1px dashed #d1d5db;border-radius:10px;">
          No hay usuarios registrados todavia.
        </div>
      </ng-template>
    </div>

    <div class="overlay" *ngIf="showModal()">
      <div class="modal">
        <h3>{{ editing() ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="row">
            <label>
              <div style="margin-bottom:6px;">Nombre</div>
              <input class="input" formControlName="name" placeholder="Nombre completo">
            </label>
            <label>
              <div style="margin-bottom:6px;">Email</div>
              <input class="input" formControlName="email" placeholder="correo@dominio.com">
            </label>
            <label>
              <div style="margin-bottom:6px;">Rol</div>
              <select formControlName="role">
                <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
              </select>
            </label>
            <label *ngIf="!editing()">
              <div style="margin-bottom:6px;">Contrasena</div>
              <input class="input" type="password" formControlName="password" placeholder="Minimo 6 caracteres">
            </label>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:12px;margin-top:16px;">
            <button type="button" class="btn secondary" (click)="close()">Cancelar</button>
            <button type="submit" class="btn" [disabled]="form.invalid || saving()">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
        <p *ngIf="formInvalid()" style="color:#dc2626;margin-top:12px;">
          Completa todos los campos obligatorios. La contrasena debe tener al menos 6 caracteres.
        </p>
      </div>
    </div>
  `
})
export class UsersAdminComponent implements OnInit {
  private api = inject(UsersService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  roles: Role[] = ['ADMIN', 'OPERADOR', 'CONDUCTOR'];
  users: UserView[] = [];

  private _loading = signal(false);
  private _saving = signal(false);
  private _showModal = signal(false);
  private _editing = signal<UserView | null>(null);
  private _error = signal<string | null>(null);
  private _notice = signal<string | null>(null);
  private _formInvalid = signal(false);

  loading = this._loading.asReadonly();
  saving = this._saving.asReadonly();
  showModal = this._showModal.asReadonly();
  editing = this._editing.asReadonly();
  error = this._error.asReadonly();
  notice = this._notice.asReadonly();
  formInvalid = this._formInvalid.asReadonly();

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['OPERADOR' as Role, Validators.required],
    password: ['']
  });

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this._loading.set(true);
    this._error.set(null);
    this.api.list().subscribe({
      next: data => {
        this.users = data;
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
        this._error.set('No fue posible obtener la lista de usuarios.');
      }
    });
  }

  openCreate() {
    this._editing.set(null);
    this.form.reset({ name: '', email: '', role: 'OPERADOR', password: '' });
    this._formInvalid.set(false);
    this._showModal.set(true);
  }

  openEdit(user: UserView) {
    this._editing.set(user);
    this.form.reset({ name: user.name, email: user.email, role: user.role, password: '' });
    this._formInvalid.set(false);
    this._showModal.set(true);
  }

  close() {
    this._showModal.set(false);
    this._saving.set(false);
    this._formInvalid.set(false);
  }

  submit() {
    const editing = this._editing();
    if (this.form.invalid) {
      if (!editing) {
        const pass = this.form.get('password')?.value || '';
        if (!pass || pass.length < 6) {
          this._formInvalid.set(true);
          return;
        }
      }
      this._formInvalid.set(true);
      return;
    }

    const value = this.form.getRawValue();
    const payload: UserPayload = {
      name: value.name.trim(),
      email: value.email.trim(),
      role: value.role
    };

    if (!payload.name || !payload.email) {
      this._formInvalid.set(true);
      return;
    }

    this._saving.set(true);
    this._notice.set(null);
    this._error.set(null);

    if (!editing) {
      const password = value.password?.trim() || '';
      if (password.length < 6) {
        this._formInvalid.set(true);
        this._saving.set(false);
        return;
      }
      this.api.create({ ...payload, password }).subscribe({
        next: user => {
          this.users = [...this.users, user];
          this._saving.set(false);
          this._showModal.set(false);
          this.form.reset({ name: '', email: '', role: 'OPERADOR', password: '' });
          this._notice.set('Usuario creado correctamente.');
        },
        error: () => {
          this._saving.set(false);
          this._error.set('No fue posible crear el usuario.');
        }
      });
      return;
    }

    this.api.update(editing.id, payload).subscribe({
      next: user => {
        this.users = this.users.map(u => u.id === user.id ? user : u);
        this._saving.set(false);
        this._showModal.set(false);
        this._notice.set('Usuario actualizado correctamente.');
      },
      error: () => {
        this._saving.set(false);
        this._error.set('No fue posible actualizar el usuario.');
      }
    });
  }

  remove(user: UserView) {
    if (this.isCurrent(user)) {
      this._notice.set('No puedes eliminar la cuenta con la que estas autenticado.');
      return;
    }
    const confirmed = window.confirm(`Eliminar al usuario ${user.name}?`);
    if (!confirmed) return;

    this._error.set(null);
    this.api.remove(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this._notice.set('Usuario eliminado correctamente.');
      },
      error: () => {
        this._error.set('No fue posible eliminar el usuario.');
      }
    });
  }

  isCurrent(user: UserView): boolean {
    const current = this.auth.user();
    return !!current && current.id === user.id;
  }
}

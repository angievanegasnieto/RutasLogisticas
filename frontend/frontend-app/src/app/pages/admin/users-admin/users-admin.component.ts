import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UsersService, UserPayload } from '../../../core/users.service';
import { AuthService } from '../../../core/auth.service';
import { Role, UserView } from '../../../core/models';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

interface Conductor {
  id: number;
  userId: number;
  nombreCompleto: string;
  licencia: string;
  telefono: string | null;
}

@Component({
  standalone: true,
  selector: 'app-users-admin',
  imports: [CommonModule, ReactiveFormsModule],
  styles: [`
    :host {
      --primary: #667eea;
      --success: #10b981;
      --warning: #f59e0b;
      --danger: #ef4444;
      --card-bg: #1e1e1e;
      --border: rgba(148,163,184,0.15);
      --text: #e2e8f0;
      --text-muted: #94a3b8;
    }
    .container { max-width: 1400px; margin: 0 auto; padding: 24px; }
    .header-card { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 20px; padding: 32px; margin-bottom: 24px; box-shadow: 0 10px 40px rgba(102,126,234,0.3); }
    .header-content { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; }
    .header-text h2 { margin: 0 0 8px; font-size: 32px; font-weight: 800; color: white; display: flex; align-items: center; gap: 12px; }
    .header-text p { margin: 0; color: rgba(255,255,255,0.9); font-size: 16px; }
    .header-badge { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.2); padding: 12px 24px; border-radius: 12px; color: white; font-size: 18px; font-weight: 600; }
    .btn-create { padding: 14px 28px; background: white; color: #667eea; border: none; border-radius: 12px; font-size: 15px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.3s; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
    .btn-create:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(0,0,0,0.25); }
    .table-card { background: var(--card-bg); border-radius: 20px; padding: 0; border: 1px solid var(--border); overflow: hidden; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 16px 20px; text-align: left; }
    th { background: rgba(102,126,234,0.1); text-transform: uppercase; font-size: 12px; letter-spacing: 0.5px; color: var(--primary); font-weight: 700; border-bottom: 1px solid var(--border); }
    td { color: var(--text); border-bottom: 1px solid var(--border); }
    tbody tr { transition: all 0.3s; }
    tbody tr:hover { background: rgba(102,126,234,0.05); }
    .user-name { font-weight: 600; color: var(--text); }
    .user-email { color: var(--text-muted); font-size: 14px; }
    .role-badge { display: inline-flex; align-items: center; gap: 6px; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }
    .role-admin { background: rgba(239,68,68,0.2); color: #f87171; }
    .role-operador { background: rgba(59,130,246,0.2); color: #60a5fa; }
    .role-conductor { background: rgba(16,185,129,0.2); color: #34d399; }
    .status-active { display: inline-flex; align-items: center; gap: 6px; color: var(--success); font-weight: 600; }
    .status-inactive { display: inline-flex; align-items: center; gap: 6px; color: var(--danger); font-weight: 600; }
    .actions { display: flex; gap: 8px; }
    .btn { padding: 10px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.3s; display: flex; align-items: center; gap: 6px; }
    .btn-edit { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; }
    .btn-edit:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(245,158,11,0.4); }
    .btn-delete { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; }
    .btn-delete:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(239,68,68,0.4); }
    .btn-delete:disabled { opacity: 0.4; cursor: not-allowed; }
    .btn-activate { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; }
    .btn-activate:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16,185,129,0.4); }
    .btn-activate:disabled { opacity: 0.4; cursor: not-allowed; }
    .empty-state { text-align: center; padding: 60px 20px; color: var(--text-muted); }
    .empty-state i { font-size: 48px; margin-bottom: 16px; opacity: 0.5; }
    .loading-state { text-align: center; padding: 40px; color: var(--text-muted); }
    .overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center; padding: 16px; z-index: 1000; backdrop-filter: blur(4px); }
    .modal { background: var(--card-bg); border-radius: 20px; max-width: 600px; width: 100%; box-shadow: 0 20px 60px rgba(0,0,0,0.5); padding: 32px; border: 1px solid var(--border); max-height: 90vh; overflow-y: auto; }
    .modal h3 { margin: 0 0 24px; color: var(--text); font-size: 24px; font-weight: 700; display: flex; align-items: center; gap: 12px; }
    .modal form { display: flex; flex-direction: column; gap: 20px; }
    .form-group { display: flex; flex-direction: column; gap: 8px; }
    .form-label { display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 600; color: var(--text); }
    .form-label i { color: var(--primary); font-size: 14px; }
    .form-input, .form-select { width: 100%; padding: 12px 14px; background: rgba(15,23,42,0.6); border: 2px solid var(--border); border-radius: 10px; color: var(--text); font-size: 14px; transition: all 0.3s; font-family: inherit; }
    .form-input:focus, .form-select:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(102,126,234,0.1); }
    .form-input::placeholder { color: var(--text-muted); }
    .section-divider { border-top: 1px solid var(--border); padding-top: 20px; margin-top: 16px; }
    .section-title { margin: 0 0 16px; font-size: 16px; font-weight: 700; color: var(--text); display: flex; align-items: center; gap: 8px; }
    .checkbox-group { display: flex; align-items: center; gap: 10px; cursor: pointer; padding: 12px; background: rgba(102,126,234,0.05); border-radius: 10px; border: 1px solid var(--border); transition: all 0.3s; }
    .checkbox-group:hover { background: rgba(102,126,234,0.1); }
    .checkbox-group input[type="checkbox"] { width: 18px; height: 18px; cursor: pointer; }
    .checkbox-group label { cursor: pointer; font-weight: 600; color: var(--text); }
    .helper-text { font-size: 12px; color: var(--text-muted); margin-top: 4px; }
    .error-text { font-size: 12px; color: var(--danger); margin-top: 4px; }
    .modal-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border); }
    .btn-primary { padding: 14px 28px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; border-radius: 12px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .btn-primary:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.4); }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-secondary { padding: 14px 24px; background: rgba(148,163,184,0.1); border: 1px solid var(--border); border-radius: 12px; color: var(--text-muted); font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; }
    .btn-secondary:hover { background: rgba(148,163,184,0.2); color: var(--text); }
    @media (max-width: 768px) { .header-content { flex-direction: column; align-items: stretch; } .actions { flex-direction: column; } table { font-size: 14px; } th, td { padding: 12px; } }
  `],
  template: `
    <div class="container">
      <div class="header-card">
        <div class="header-content">
          <div class="header-text">
            <h2><i class="fas fa-users-cog"></i> Gestión de Usuarios</h2>
            <p>Administra roles de Administrador, Operador y Conductor</p>
          </div>
          <div style="display: flex; align-items: center; gap: 16px;">
            <div class="header-badge">
              <i class="fas fa-user"></i>
              <span>{{users.length}} usuarios</span>
            </div>
            <button class="btn-create" (click)="openCreate()">
              <i class="fas fa-plus-circle"></i>
              <span>Crear Usuario</span>
            </button>
          </div>
        </div>
      </div>

      <div *ngIf="loading()" class="loading-state">
        <i class="fas fa-spinner fa-spin" style="font-size: 32px; margin-bottom: 12px;"></i>
        <p>Cargando usuarios...</p>
      </div>

      <div *ngIf="!loading() && users.length" class="table-card">
        <table>
          <thead>
            <tr>
              <th><i class="fas fa-user"></i> Usuario</th>
              <th><i class="fas fa-shield-alt"></i> Rol</th>
              <th><i class="fas fa-toggle-on"></i> Estado</th>
              <th style="width:200px;"><i class="fas fa-cog"></i> Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>
                <div class="user-name">{{ user.name }}</div>
                <div class="user-email">{{ user.email }}</div>
              </td>
              <td>
                <span class="role-badge" 
                      [ngClass]="{
                        'role-admin': user.role === 'ADMIN',
                        'role-operador': user.role === 'OPERADOR',
                        'role-conductor': user.role === 'CONDUCTOR'
                      }">
                  <i class="fas" [ngClass]="{
                    'fa-user-shield': user.role === 'ADMIN',
                    'fa-user-tie': user.role === 'OPERADOR',
                    'fa-id-card': user.role === 'CONDUCTOR'
                  }"></i>
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span [ngClass]="user.enabled !== false ? 'status-active' : 'status-inactive'">
                  <i class="fas" [ngClass]="user.enabled !== false ? 'fa-check-circle' : 'fa-times-circle'"></i>
                  {{ user.enabled !== false ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <div class="actions">
                  <button class="btn btn-edit" (click)="openEdit(user)">
                    <i class="fas fa-edit"></i> Editar
                  </button>
                  <button class="btn" 
                          [ngClass]="user.enabled !== false ? 'btn-delete' : 'btn-activate'"
                          [disabled]="isCurrent(user)" 
                          (click)="toggleUsuarioEstado(user)">
                    <i class="fas" [ngClass]="user.enabled !== false ? 'fa-ban' : 'fa-check-circle'"></i> 
                    {{ user.enabled !== false ? 'Desactivar' : 'Activar' }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div *ngIf="!loading() && !users.length" class="empty-state">
        <i class="fas fa-users"></i>
        <p>No hay usuarios registrados todavía</p>
      </div>
    </div>

    <div class="overlay" *ngIf="showModal()" (click)="close()">
      <div class="modal" (click)="$event.stopPropagation()">
        <h3>
          <i class="fas" [ngClass]="editing() ? 'fa-user-edit' : 'fa-user-plus'"></i>
          {{ editing() ? 'Editar usuario' : 'Nuevo usuario' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="submit()">
          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-user"></i>
              <span>Nombre completo</span>
            </label>
            <input class="form-input" formControlName="name" placeholder="Ingrese el nombre completo">
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-envelope"></i>
              <span>Email</span>
            </label>
            <input class="form-input" formControlName="email" type="email" placeholder="correo@dominio.com">
          </div>

          <div class="form-group">
            <label class="form-label">
              <i class="fas fa-shield-alt"></i>
              <span>Rol</span>
            </label>
            <select class="form-select" formControlName="role">
              <option *ngFor="let role of roles" [value]="role">{{ role }}</option>
            </select>
          </div>

          <div class="form-group" *ngIf="!editing()">
            <label class="form-label">
              <i class="fas fa-toggle-on"></i>
              <span>Estado</span>
            </label>
            <select class="form-select" formControlName="enabled">
              <option [value]="true">Activo</option>
              <option [value]="false">Inactivo</option>
            </select>
          </div>

          <div class="form-group" *ngIf="!editing()">
            <label class="form-label">
              <i class="fas fa-lock"></i>
              <span>Contraseña</span>
            </label>
            <input class="form-input" type="password" formControlName="password" placeholder="Mínimo 8 caracteres">
            <p class="helper-text">Debe incluir: mayúsculas, minúsculas, números y caracteres especiales (!#$%^&*...)</p>
          </div>

          <div *ngIf="form.get('role')?.value === 'CONDUCTOR'" class="section-divider">
            <h4 class="section-title">
              <i class="fas fa-id-card"></i>
              Información del Conductor
            </h4>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-id-card-alt"></i>
                <span>Licencia de conducir</span>
              </label>
              <input class="form-input" formControlName="licencia" placeholder="Número de licencia">
            </div>
            <div class="form-group">
              <label class="form-label">
                <i class="fas fa-phone"></i>
                <span>Teléfono (10 dígitos)</span>
              </label>
              <input class="form-input" formControlName="telefono" placeholder="Ej: 3001234567" maxlength="10" (input)="validarTelefono($event)">
              <p *ngIf="telefonoError" class="error-text">{{ telefonoError }}</p>
            </div>
          </div>

          <div *ngIf="editing()" class="section-divider">
            <div class="checkbox-group">
              <input type="checkbox" formControlName="resetPassword" id="resetPwd">
              <label for="resetPwd">Restablecer contraseña</label>
            </div>
            <div class="form-group" *ngIf="form.get('resetPassword')?.value">
              <label class="form-label">
                <i class="fas fa-key"></i>
                <span>Nueva contraseña</span>
              </label>
              <input class="form-input" type="password" formControlName="password" placeholder="Mínimo 8 caracteres">
              <p class="helper-text">Debe incluir: mayúsculas, minúsculas, números y caracteres especiales</p>
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn-secondary" (click)="close()">
              <i class="fas fa-times"></i> Cancelar
            </button>
            <button type="submit" class="btn-primary" [disabled]="form.invalid || saving()">
              <i class="fas" [ngClass]="saving() ? 'fa-spinner fa-spin' : 'fa-save'"></i>
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class UsersAdminComponent implements OnInit {
  private api = inject(UsersService);
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private http = inject(HttpClient);

  roles: Role[] = ['ADMIN', 'OPERADOR', 'CONDUCTOR'];
  users: UserView[] = [];
  telefonoError = '';

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
    enabled: [true],
    password: [''],
    resetPassword: [false],
    licencia: [''],
    telefono: ['']
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
    this.form.reset({ 
      name: '', 
      email: '', 
      role: 'OPERADOR', 
      enabled: true, 
      password: '', 
      resetPassword: false,
      licencia: '',
      telefono: ''
    });
    this._formInvalid.set(false);
    this._showModal.set(true);
  }

  openEdit(user: UserView) {
    this._editing.set(user);
    
    // Cargar datos del conductor si el usuario es conductor
    if (user.role === 'CONDUCTOR') {
      this.http.get<Conductor[]>('/api/conductores').subscribe({
        next: conductores => {
          const conductor = conductores.find(c => c.userId === user.id);
          this.form.reset({ 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            enabled: user.enabled !== false,
            password: '', 
            resetPassword: false,
            licencia: conductor?.licencia || '',
            telefono: conductor?.telefono || ''
          });
        },
        error: () => {
          this.form.reset({ 
            name: user.name, 
            email: user.email, 
            role: user.role, 
            enabled: user.enabled !== false,
            password: '', 
            resetPassword: false,
            licencia: '',
            telefono: ''
          });
        }
      });
    } else {
      this.form.reset({ 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        enabled: user.enabled !== false,
        password: '', 
        resetPassword: false,
        licencia: '',
        telefono: ''
      });
    }
    
    this._formInvalid.set(false);
    this._showModal.set(true);
  }

  close() {
    this._showModal.set(false);
    this._saving.set(false);
    this._formInvalid.set(false);
    this.telefonoError = '';
  }

  validarTelefono(event: any) {
    const valor = event.target.value;
    
    // Solo permitir números
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    this.form.patchValue({ telefono: soloNumeros });
    event.target.value = soloNumeros;
    
    // Validar longitud si hay algo escrito
    if (soloNumeros.length > 0 && soloNumeros.length < 10) {
      this.telefonoError = 'El teléfono debe tener exactamente 10 dígitos';
    } else if (soloNumeros.length > 10) {
      this.telefonoError = 'El teléfono no puede tener más de 10 dígitos';
    } else {
      this.telefonoError = '';
    }
  }

  submit() {
    const editing = this._editing();
    const value = this.form.getRawValue();
    
    // Validar campos de conductor si el rol es CONDUCTOR
    if (value.role === 'CONDUCTOR') {
      if (!value.licencia.trim()) {
        this._formInvalid.set(true);
        this._error.set('La licencia es obligatoria para conductores.');
        return;
      }
      
      // Validar teléfono si se proporcionó
      if (value.telefono.trim() && value.telefono.length !== 10) {
        this._formInvalid.set(true);
        this._error.set('El teléfono debe tener exactamente 10 dígitos.');
        return;
      }
      
      if (this.telefonoError) {
        this._formInvalid.set(true);
        this._error.set(this.telefonoError);
        return;
      }
    }
    
    // Validar contraseña solo si es creación o si se marcó resetPassword
    const needsPassword = !editing || value.resetPassword;
    const password = value.password?.trim() || '';
    
    if (needsPassword && !this.isPasswordValid(password)) {
      this._formInvalid.set(true);
      this._error.set('La contraseña debe tener mínimo 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.');
      return;
    }

    if (this.form.invalid) {
      this._formInvalid.set(true);
      return;
    }

    const payload: UserPayload = {
      name: value.name.trim(),
      email: value.email.trim(),
      role: value.role,
      enabled: value.enabled
    };

    if (!payload.name || !payload.email) {
      this._formInvalid.set(true);
      return;
    }

    this._saving.set(true);
    this._notice.set(null);
    this._error.set(null);

    if (!editing) {
      // Crear nuevo usuario - usar endpoint de admin en lugar de auth.register
      console.log('🔵 Creando usuario desde ADMIN - NO debe iniciar sesión');
      const createPayload: any = {
        ...payload,
        password
      };
      
      // Si es CONDUCTOR, crear el usuario primero y luego el conductor
      if (value.role === 'CONDUCTOR') {
        console.log('🔵 Creando usuario CONDUCTOR con endpoint /admin/users');
        this.api.create(createPayload).subscribe({
          next: (newUser) => {
            console.log('✅ Usuario creado:', newUser);
            // Ahora crear el conductor vinculado
            const conductorPayload = {
              userId: newUser.id,
              nombreCompleto: value.name.trim(),
              licencia: value.licencia.trim(),
              telefono: value.telefono.trim() || null
            };
            
            console.log('🔵 Vinculando conductor...');
            this.http.post('/api/conductores/vincular-usuario', conductorPayload).subscribe({
              next: () => {
                console.log('✅ Conductor vinculado exitosamente');
                this._saving.set(false);
                this._showModal.set(false);
                this.form.reset({ 
                  name: '', 
                  email: '', 
                  role: 'OPERADOR', 
                  enabled: true, 
                  password: '', 
                  resetPassword: false,
                  licencia: '',
                  telefono: ''
                });
                console.log('🟢 Mostrando SweetAlert de éxito - sesión NO modificada');
                Swal.fire({
                  icon: 'success',
                  title: 'Usuario creado',
                  text: 'El usuario conductor ha sido creado exitosamente',
                  confirmButtonColor: '#2563eb'
                });
                this.load(); // Recargar la lista
              },
              error: (err) => {
                this._saving.set(false);
                const errorMsg = err.error?.error || err.error?.message || 'Error al crear el conductor';
                Swal.fire({
                  icon: 'error',
                  title: 'Error',
                  text: errorMsg,
                  confirmButtonColor: '#dc2626'
                });
              }
            });
          },
          error: (err) => {
            this._saving.set(false);
            const errorMsg = err.error?.error || err.error?.message || 'No fue posible crear el usuario.';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMsg,
              confirmButtonColor: '#dc2626'
            });
          }
        });
      } else {
        // Para otros roles, crear usuario normalmente
        this.api.create(createPayload).subscribe({
          next: (newUser) => {
            this.users = [...this.users, newUser];
            this._saving.set(false);
            this._showModal.set(false);
            this.form.reset({ 
              name: '', 
              email: '', 
              role: 'OPERADOR', 
              enabled: true, 
              password: '', 
              resetPassword: false,
              licencia: '',
              telefono: ''
            });
            Swal.fire({
              icon: 'success',
              title: 'Usuario creado',
              text: 'El usuario ha sido creado exitosamente',
              confirmButtonColor: '#2563eb'
            });
            this.load(); // Recargar la lista
          },
          error: (err) => {
            this._saving.set(false);
            const errorMsg = err.error?.error || err.error?.message || 'No fue posible crear el usuario.';
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMsg,
              confirmButtonColor: '#dc2626'
            });
          }
        });
      }
      return;
    }

    // Editar usuario existente
    this.api.update(editing.id, payload).subscribe({
      next: user => {
        this.users = this.users.map(u => u.id === user.id ? user : u);
        
        // Si es conductor, actualizar licencia y teléfono
        if (value.role === 'CONDUCTOR') {
          this.http.get<Conductor[]>('/api/conductores').subscribe({
            next: conductores => {
              const conductor = conductores.find(c => c.userId === user.id);
              if (conductor) {
                const conductorUpdate = {
                  nombreCompleto: value.name.trim(),
                  licencia: value.licencia.trim(),
                  telefono: value.telefono.trim() || null
                };
                
                this.http.put(`/api/conductores/${conductor.id}`, conductorUpdate).subscribe({
                  next: () => {
                    this.finalizarEdicion(value, editing, password);
                  },
                  error: (err) => {
                    this._saving.set(false);
                    const errorMsg = err.error?.error || 'Error al actualizar la información del conductor';
                    Swal.fire({
                      icon: 'error',
                      title: 'Error',
                      text: errorMsg,
                      confirmButtonColor: '#dc2626'
                    });
                    // NO cerrar el modal para que el usuario pueda corregir
                  }
                });
              } else {
                this.finalizarEdicion(value, editing, password);
              }
            },
            error: () => {
              this.finalizarEdicion(value, editing, password);
            }
          });
        } else {
          this.finalizarEdicion(value, editing, password);
        }
      },
      error: (err) => {
        this._saving.set(false);
        const errorMsg = err.error?.error || err.error?.message || 'No fue posible actualizar el usuario.';
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: errorMsg,
          confirmButtonColor: '#dc2626'
        });
        // NO cerrar el modal
      }
    });
  }
  
  private finalizarEdicion(value: any, editing: UserView, password: string) {
    // Si se marcó resetPassword, hacer la petición adicional
    if (value.resetPassword && password) {
      this.api.resetPassword(editing.id, password).subscribe({
        next: () => {
          this._saving.set(false);
          this._showModal.set(false);
          Swal.fire({
            icon: 'success',
            title: 'Actualizado',
            text: 'Usuario actualizado y contraseña restablecida correctamente',
            confirmButtonColor: '#2563eb'
          });
        },
        error: (err) => {
          this._saving.set(false);
          
          let errorMsg = 'Usuario actualizado pero no se pudo restablecer la contraseña.';
          if (err.status === 403) {
            errorMsg += ' No tienes permisos para realizar esta acción.';
          } else if (err.status === 400) {
            errorMsg += ' La contraseña no cumple con los requisitos.';
          } else if (err.error?.message) {
            errorMsg += ' ' + err.error.message;
          }
          
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: errorMsg,
            confirmButtonColor: '#dc2626'
          });
          // NO cerrar el modal
        }
      });
    } else {
      this._saving.set(false);
      this._showModal.set(false);
      Swal.fire({
        icon: 'success',
        title: 'Actualizado',
        text: 'Usuario actualizado correctamente',
        confirmButtonColor: '#2563eb'
      });
    }
  }

  private isPasswordValid(password: string): boolean {
    if (password.length < 8) return false;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar;
  }

  toggleUsuarioEstado(user: UserView) {
    if (this.isCurrent(user)) {
      Swal.fire({
        icon: 'warning',
        title: 'No permitido',
        text: 'No puedes cambiar el estado de la cuenta con la que estás autenticado.',
        confirmButtonColor: '#2563eb'
      });
      return;
    }
    
    const estaActivo = user.enabled !== false;
    const accion = estaActivo ? 'desactivar' : 'activar';
    const accionMayus = estaActivo ? 'Desactivar' : 'Activar';
    const nuevoEstado = !estaActivo;
    
    Swal.fire({
      title: `¿${accionMayus} usuario?`,
      text: estaActivo 
        ? `¿Estás seguro de desactivar a ${user.name}? El usuario no podrá iniciar sesión.`
        : `¿Estás seguro de activar a ${user.name}? El usuario podrá iniciar sesión nuevamente.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: estaActivo ? '#f59e0b' : '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Actualizar usuario cambiando su estado
        const payload: UserPayload = {
          name: user.name,
          email: user.email,
          role: user.role,
          enabled: nuevoEstado
        };
        
        this.api.update(user.id, payload).subscribe({
          next: (updatedUser) => {
            // Si es conductor, actualizar también el estado del conductor
            if (user.role === 'CONDUCTOR') {
              this.http.get<Conductor[]>('/api/conductores').subscribe({
                next: conductores => {
                  const conductor = conductores.find(c => c.userId === user.id);
                  if (conductor) {
                    // Actualizar estado del conductor
                    const estadoConductor = nuevoEstado ? 'ACTIVO' : 'INACTIVO';
                    this.http.patch(`/api/conductores/${conductor.id}/estado`, { estado: estadoConductor }).subscribe({
                      next: () => {
                        this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
                        Swal.fire({
                          icon: 'success',
                          title: estaActivo ? 'Desactivado' : 'Activado',
                          text: estaActivo 
                            ? 'Usuario desactivado correctamente. El conductor asociado también fue desactivado.'
                            : 'Usuario activado correctamente. El conductor asociado también fue activado.',
                          confirmButtonColor: '#2563eb'
                        });
                      },
                      error: (err) => {
                        console.error('Error al actualizar conductor:', err);
                        // Aún así mostrar éxito porque el usuario se actualizó
                        this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
                        Swal.fire({
                          icon: 'warning',
                          title: 'Parcialmente actualizado',
                          text: `Usuario ${accion}do pero hubo un problema al actualizar el conductor.`,
                          confirmButtonColor: '#f59e0b'
                        });
                      }
                    });
                  } else {
                    // No hay conductor asociado
                    this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
                    Swal.fire({
                      icon: 'success',
                      title: estaActivo ? 'Desactivado' : 'Activado',
                      text: `Usuario ${accion}do correctamente.`,
                      confirmButtonColor: '#2563eb'
                    });
                  }
                },
                error: () => {
                  // Error al obtener conductores
                  this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
                  Swal.fire({
                    icon: 'success',
                    title: estaActivo ? 'Desactivado' : 'Activado',
                    text: `Usuario ${accion}do correctamente.`,
                    confirmButtonColor: '#2563eb'
                  });
                }
              });
            } else {
              // No es conductor, solo actualizar la lista
              this.users = this.users.map(u => u.id === updatedUser.id ? updatedUser : u);
              Swal.fire({
                icon: 'success',
                title: estaActivo ? 'Desactivado' : 'Activado',
                text: `Usuario ${accion}do correctamente.`,
                confirmButtonColor: '#2563eb'
              });
            }
          },
          error: (err) => {
            const errorMsg = err.error?.error || err.error?.message || `No fue posible ${accion} el usuario`;
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: errorMsg,
              confirmButtonColor: '#dc2626'
            });
          }
        });
      }
    });
  }

  isCurrent(user: UserView): boolean {
    const current = this.auth.user();
    return !!current && current.id === user.id;
  }
}

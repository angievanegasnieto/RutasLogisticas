
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [FormsModule, CommonModule],
  styles: [`
    .error-text {
      color: #dc2626;
      font-size: 13px;
      margin-top: 4px;
      margin-bottom: 8px;
    }
    .input.error {
      border-color: #dc2626;
    }
  `],
  template: `
  <div class="card" style="max-width:520px;margin:40px auto;">
    <h2 style="margin:0 0 10px;">Crear cuenta</h2>
    
    <div class="row">
      <div class="col">
        <input class="input" [class.error]="errors.name" placeholder="Nombre" [(ngModel)]="name">
        @if (errors.name) {
          <div class="error-text">{{ errors.name }}</div>
        }
      </div>
    </div>
    
    <div class="row">
      <div class="col">
        <input class="input" [class.error]="errors.email" placeholder="Email" [(ngModel)]="email">
        @if (errors.email) {
          <div class="error-text">{{ errors.email }}</div>
        }
      </div>
    </div>
    
    <div class="row">
      <div class="col">
        <input class="input" [class.error]="errors.password" type="password" placeholder="Contrasena" [(ngModel)]="password">
        @if (errors.password) {
          <div class="error-text">{{ errors.password }}</div>
        }
      </div>
    </div>
    
    <div class="row">
      <div class="col">
        <select class="input" [(ngModel)]="role" (ngModelChange)="clearErrors()">
          <option value="ADMIN">Administrador</option>
          <option value="OPERADOR">Operador</option>
          <option value="CONDUCTOR">Conductor</option>
        </select>
      </div>
    </div>
    
    @if (role === 'CONDUCTOR') {
      <div class="row">
        <div class="col">
          <input class="input" [class.error]="errors.licencia" placeholder="Licencia de conducir *" [(ngModel)]="licencia">
          @if (errors.licencia) {
            <div class="error-text">{{ errors.licencia }}</div>
          }
        </div>
      </div>
      <div class="row">
        <div class="col">
          <input class="input" [class.error]="errors.telefono" 
                 placeholder="Teléfono (10 dígitos)" 
                 [(ngModel)]="telefono"
                 maxlength="10"
                 (input)="validarTelefono($event)">
          @if (errors.telefono) {
            <div class="error-text">{{ errors.telefono }}</div>
          }
        </div>
      </div>
    }
    
    <div class="row"><div class="col"><button class="btn" (click)="doRegister()">Crear</button></div></div>
    
    @if (errorMessage) {
      <div style="color: #dc2626; margin-top: 10px; text-align: center;">{{ errorMessage }}</div>
    }
  </div>
  `
})
export class RegisterComponent{
  private auth = inject(AuthService);
  private router = inject(Router);
  name=''; email=''; password='';
  role: 'ADMIN' | 'OPERADOR' | 'CONDUCTOR' = 'OPERADOR';
  licencia = '';
  telefono = '';
  errorMessage = '';
  errors: {
    name?: string;
    email?: string;
    password?: string;
    licencia?: string;
    telefono?: string;
  } = {};

  clearErrors() {
    this.errors = {};
    this.errorMessage = '';
  }

  validarTelefono(event: any) {
    const valor = event.target.value;
    
    // Solo permitir números
    const soloNumeros = valor.replace(/[^0-9]/g, '');
    this.telefono = soloNumeros;
    event.target.value = soloNumeros;
    
    // Validar longitud si hay algo escrito
    if (soloNumeros.length > 0 && soloNumeros.length < 10) {
      this.errors.telefono = 'El teléfono debe tener exactamente 10 dígitos';
    } else if (soloNumeros.length > 10) {
      this.errors.telefono = 'El teléfono no puede tener más de 10 dígitos';
    } else {
      this.errors.telefono = '';
    }
  }

  doRegister(){
    this.clearErrors();

    // Validar campos básicos
    if (!this.name.trim()) {
      this.errors.name = 'El nombre es obligatorio';
      return;
    }
    
    if (!this.email.trim()) {
      this.errors.email = 'El email es obligatorio';
      return;
    }
    
    if (!this.password.trim()) {
      this.errors.password = 'La contraseña es obligatoria';
      return;
    }

    // Validar campos obligatorios para CONDUCTOR
    if (this.role === 'CONDUCTOR') {
      if (!this.licencia.trim()) {
        this.errors.licencia = 'La licencia de conducir es obligatoria para conductores';
        return;
      }
      
      // Validar teléfono si se proporcionó
      if (this.telefono.trim() && this.telefono.length !== 10) {
        this.errors.telefono = 'El teléfono debe tener exactamente 10 dígitos';
        return;
      }
    }

    this.auth.register(this.name, this.email, this.password, this.role, this.licencia, this.telefono).subscribe({
      next: res => { 
        this.auth.saveSession(res); 
        this.router.navigateByUrl('/dashboard'); 
      },
      error: err => {
        console.log('Error completo:', err);
        const errorMsg = err.error?.error || err.error?.message || err.error || '';
        
        // Detectar errores específicos y asignarlos al campo correcto
        if (typeof errorMsg === 'string') {
          const msgLower = errorMsg.toLowerCase();
          
          if (msgLower.includes('email') && msgLower.includes('registrado')) {
            this.errors.email = 'Este email ya está registrado';
          } else if (msgLower.includes('licencia') && msgLower.includes('registrad')) {
            this.errors.licencia = 'Esta licencia ya está registrada';
          } else if (msgLower.includes('teléfono') || msgLower.includes('telefono')) {
            if (msgLower.includes('registrad')) {
              this.errors.telefono = 'Este teléfono ya está registrado';
            } else {
              this.errors.telefono = errorMsg;
            }
          } else {
            this.errorMessage = errorMsg || 'Error al crear la cuenta';
          }
        } else {
          this.errorMessage = 'Error al crear la cuenta';
        }
      }
    });
  }
}

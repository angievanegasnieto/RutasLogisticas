import { Component, inject } from "@angular/core";
import { RouterLink } from "@angular/router";
import { AuthService } from '../../core/auth.service';
import { NgIf, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { VehiculosComponent } from "../vehiculos/vehiculos.component";
import { ConductoresComponent } from "../conductores/conductores.component";
import { PedidosComponent } from "../pedidos/pedidos.component";
import { RutasComponent } from "../rutas/rutas.component";

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    VehiculosComponent,
    ConductoresComponent,
    PedidosComponent,
    RutasComponent,
    RouterLink,
    NgIf,
  ],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px;">Dashboard</h2>
      <p class="badge">Auth OK · UI lista para conectar módulos.</p>
    </div>

    <ng-container *ngIf="isAdmin(); else conductorView">
      <div
        style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-top:12px;"
      >
        <app-vehiculos></app-vehiculos>
        <app-conductores></app-conductores>
        <app-pedidos></app-pedidos>
        <app-rutas></app-rutas>
        <div class="card small" style="display:flex;flex-direction:column;gap:8px;justify-content:space-between;">
          <h3 style="margin:0 0 6px;">Asignaciones</h3>
          <p>Vincula conductores con vehículos.</p>
          <a routerLink="/asignaciones" class="btn" style="text-align:center">Ir a Asignaciones</a>
        </div>
      </div>
    </ng-container>

    <ng-template #conductorView>
      <div class="card" style="margin-top:12px;">
        <h3 style="margin:0 0 6px;">Mi asignación</h3>
        <ng-container *ngIf="vm() as v; else noasig">
          <p><b>Vehículo:</b> {{v.vehicle?.plate}} {{v.vehicle?.model? '('+v.vehicle?.model+')' : ''}}</p>
          <p><b>Tipo:</b> {{v.vehicle?.type==='MOTO'? 'Moto':'Carro'}}</p>
          <p><b>Inicio:</b> {{v.assignedAt | date:'short'}}</p>
          <div style="display:flex;gap:8px;">
            <button class="btn" (click)="confirmarAsignacion()">Confirmar recepción</button>
            <button class="btn secondary" (click)="rechazarAsignacion()">Rechazar</button>
          </div>
        </ng-container>
        <ng-template #noasig><p>No tienes una asignación activa.</p></ng-template>
      </div>
      <div class="card" style="margin-top:12px;" *ngIf="upcoming.length>0">
        <h3 style="margin:0 0 6px;">Próximas asignaciones</h3>
        <ul style="margin:0;padding-left:18px;">
          <li *ngFor="let u of upcoming">{{u.vehicle?.plate}} · {{u.plannedStart | date:'short'}} → {{u.plannedEnd ? (u.plannedEnd | date:'short') : 'abierta'}}</li>
        </ul>
      </div>
      <div class="card small" style="margin-top:12px;display:flex;gap:8px;align-items:end;">
        <div class="col" style="flex:1;">
          <label>Solicitud de cambio</label>
          <textarea class="input" rows="3" [(ngModel)]="reqMsg" placeholder="Escribe tu motivo o preferencia"></textarea>
        </div>
        <div class="col"><button class="btn" (click)="solicitar()">Enviar solicitud</button></div>
        <p *ngIf="reqError" style="color:#ef4444;">{{reqError}}</p>
      </div>
    </ng-template>
  `,
})
export class DashboardComponent {
  private auth = inject(AuthService);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private pollHandle: any;
  constructor(){ }
  isAdmin(){ return this.auth.user()?.role === 'ADMIN'; }

  // Conductor view
  reqMsg = '';
  reqError = '';
  private _vm: { vehicle?: { plate:string; model?:string|null; type?:'AUTO'|'MOTO'|undefined }; assignedAt: string } | null = null;
  upcoming: any[] = [];
  vm(){
    const email = this.auth.user()?.email;
    if (!email) { this._vm = null; return this._vm; }
    // Cargar una sola vez por ciclo si aún no está
    if (this._vm === null){
      this.api.getMyActiveAssignment(email).subscribe({
        next: (a:any) => {
          this._vm = a ? { vehicle: a.vehicle, assignedAt: a.assignedAt } : null;
        },
        error: _ => { this._vm = null; }
      });
      // Iniciar polling suave para notificaciones
      this.startPolling(email);
      // Cargar programadas
      this.api.getMyScheduledAssignments(email).subscribe(list => this.upcoming = list || []);
    }
    return this._vm;
  }
  private startPolling(email:string){
    if (this.pollHandle) return;
    let lastKey = '';
    this.pollHandle = setInterval(() => {
      this.api.getMyActiveAssignment(email).subscribe({
        next: (a:any) => {
          const key = a ? `${a.id}|${a.endedAt||''}` : 'none';
          if (lastKey && key !== lastKey){
            if (a && !a.endedAt) this.toast.show('Nueva asignación recibida','info');
            else this.toast.show('Tu asignación finalizó','info');
          }
          lastKey = key;
          this._vm = a ? { vehicle: a.vehicle, assignedAt: a.assignedAt } : null;
        }
      });
    }, 15000);
  }
  solicitar(){
    this.reqError = '';
    const email = this.auth.user()?.email;
    if (!email){ this.reqError = 'No hay sesión'; return; }
    const msg = this.reqMsg.trim();
    if (!msg){ this.reqError = 'Escribe un motivo para la solicitud'; return; }
    this.api.createRequest(msg, undefined, email).subscribe({
      next: _ => { this.reqMsg = ''; this.toast.show('Solicitud enviada', 'success'); },
      error: err => { this.reqError = (err?.error?.error || 'No se pudo enviar la solicitud'); }
    });
  }

  // Acciones rápidas del conductor
  confirmarAsignacion(){
    const email = this.auth.user()?.email; if (!email) return;
    this.api.getMyActiveAssignment(email).subscribe(a => {
      if (!a) { this.toast.show('No tienes asignación activa','info'); return; }
      this.api.acceptAssignment(a.id).subscribe({
        next: _ => this.toast.show('Asignación aceptada','success'),
        error: _ => this.toast.show('No se pudo aceptar la asignación','error')
      });
    });
  }
  rechazarAsignacion(){
    const email = this.auth.user()?.email; if (!email) return;
    const motivo = prompt('Motivo de rechazo de la asignación:') || 'Sin detalle';
    this.api.getMyActiveAssignment(email).subscribe(a => {
      if (!a) { this.toast.show('No tienes asignación activa','info'); return; }
      this.api.rejectAssignment(a.id, motivo).subscribe({
        next: _ => this.toast.show('Rechazo enviado','info'),
        error: _ => this.toast.show('No se pudo rechazar la asignación','error')
      });
    });
  }
}

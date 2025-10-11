import { Component } from "@angular/core";
import { NgIf } from "@angular/common";
import { VehiculosComponent } from "../vehiculos/vehiculos.component";
import { ConductoresComponent } from "../conductores/conductores.component";
import { PedidosComponent } from "../pedidos/pedidos.component";
import { RutasComponent } from "../rutas/rutas.component";

@Component({
  standalone: true,
  imports: [
    VehiculosComponent,
    ConductoresComponent,
    PedidosComponent,
    RutasComponent,
  ],
  template: `
    <div class="card">
      <h2 style="margin:0 0 8px;">Dashboard</h2>
      <p class="badge">Auth OK · UI lista para conectar módulos.</p>
    </div>

    <div
      style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:12px; margin-top:12px;"
    >
      <app-vehiculos></app-vehiculos>
      <app-conductores></app-conductores>
      <app-pedidos></app-pedidos>
      <app-rutas></app-rutas>
    </div>
  `,
})
export class DashboardComponent {}

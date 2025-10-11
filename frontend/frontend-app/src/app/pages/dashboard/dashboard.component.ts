
import { Component } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  standalone:true,
  imports:[NgIf],
  template:`
    <div class="card">
      <h2 style="margin:0 0 8px;">Dashboard</h2>
      <p class="badge">Auth OK · UI lista para conectar módulos (vehículos, conductores, pedidos, rutas).</p>
    </div>
  `
})
export class DashboardComponent {}

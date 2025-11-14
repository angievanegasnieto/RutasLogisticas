import { Component } from '@angular/core';
import { PedidosSimpleComponent } from '../pedidos-simple/pedidos-simple.component';

@Component({
  standalone: true,
  imports: [PedidosSimpleComponent],
  template: `<app-pedidos-simple></app-pedidos-simple>`
})
export class PedidosOperadorComponent {
}

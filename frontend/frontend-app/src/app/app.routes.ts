import { Routes } from '@angular/router';
import { PedidosComponent } from './pedidos/pedidos.component';

export const routes: Routes = [
  { path: 'pedidos', component: PedidosComponent },
  { path: '', redirectTo: '/pedidos', pathMatch: 'full' }
];

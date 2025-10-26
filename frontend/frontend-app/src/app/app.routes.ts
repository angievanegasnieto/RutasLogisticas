import { Routes } from '@angular/router';
import { ClientesListComponent } from './clientes/clientes-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/clientes', pathMatch: 'full' },
  { path: 'clientes', component: ClientesListComponent }
];

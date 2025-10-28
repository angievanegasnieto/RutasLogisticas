
import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent) },
  // Registro deshabilitado para usuarios; solo admin puede crear cuentas

  { path: '', canActivate: [authGuard], children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent) },
      { path: 'asignaciones', loadComponent: () => import('./pages/asignaciones/asignaciones.component')
          .then(m => m.AsignacionesComponent), canActivate: [roleGuard(['ADMIN','OPERATOR'])] },
      { path: 'vehiculos', loadComponent: () => import('./pages/vehiculos/vehiculos.component')
          .then(m => m.VehiculosComponent), canActivate: [roleGuard(['ADMIN','OPERATOR'])] },
      { path: 'conductores', loadComponent: () => import('./pages/conductores/conductores.component')
          .then(m => m.ConductoresComponent), canActivate: [roleGuard(['ADMIN','OPERATOR'])] },
      { path: 'solicitudes', loadComponent: () => import('./pages/requests/requests.component')
          .then(m => m.RequestsComponent), canActivate: [roleGuard(['ADMIN'])] },
      { path: 'solicitudes', loadComponent: () => import('./pages/requests/requests.component')
          .then(m => m.RequestsComponent) },
      { path: 'rutas', loadComponent: () => import('./pages/rutas/rutas.component')
          .then(m => m.RutasComponent) },
      { path: 'pedidos', loadComponent: () => import('./pages/pedidos/pedidos.component')
          .then(m => m.PedidosComponent) },
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component')
          .then(m => m.ProfileComponent) }
  ]},

  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent) }
];

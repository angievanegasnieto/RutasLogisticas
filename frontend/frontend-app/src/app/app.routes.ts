
import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { roleGuard } from './core/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

  { path: 'login', loadComponent: () => import('./pages/login/login.component')
      .then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./pages/register/register.component')
      .then(m => m.RegisterComponent) },

  { path: '', canActivate: [authGuard], children: [
      { path: 'dashboard', loadComponent: () => import('./pages/dashboard/dashboard.component')
          .then(m => m.DashboardComponent) },
      
      // ========== MÓDULOS OPERADOR ==========
      { path: 'clientes', loadComponent: () => import('./pages/clientes/clientes.component')
          .then(m => m.ClientesComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'vehiculos', loadComponent: () => import('./pages/vehiculos-nuevo/vehiculos-nuevo.component')
          .then(m => m.VehiculosNuevoComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'asignaciones', loadComponent: () => import('./pages/asignaciones-vehiculo/asignaciones-vehiculo.component')
          .then(m => m.AsignacionesVehiculoComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'asignaciones-vehiculo', loadComponent: () => import('./pages/asignaciones-vehiculo/asignaciones-vehiculo.component')
          .then(m => m.AsignacionesVehiculoComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'asignaciones-ruta', loadComponent: () => import('./pages/asignaciones-ruta/asignaciones-ruta.component')
          .then(m => m.AsignacionesRutaComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'rutas-conductores', loadComponent: () => import('./pages/rutas-conductores/rutas-conductores.component')
          .then(m => m.RutasConductoresComponent), canActivate: [roleGuard(['OPERADOR'])] },
      
      // ========== MÓDULOS ADMIN ==========
      { path: 'conductores', loadComponent: () => import('./pages/conductores-nuevo/conductores-nuevo.component')
          .then(m => m.ConductoresComponent), canActivate: [roleGuard(['ADMIN'])] },
      { path: 'pedidos-operador', loadComponent: () => import('./pages/pedidos-operador/pedidos-operador.component')
          .then(m => m.PedidosOperadorComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'mapa-pedidos', loadComponent: () => import('./pages/mapa-pedidos/mapa-pedidos.component')
          .then(m => m.MapaPedidosComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'reportes', loadComponent: () => import('./pages/reportes/reportes.component')
          .then(m => m.ReportesComponent), canActivate: [roleGuard(['OPERADOR'])] },
      { path: 'reportes-pedidos', loadComponent: () => import('./pages/reportes-pedidos/reportes-pedidos.component')
          .then(m => m.ReportesPedidosComponent), canActivate: [roleGuard(['OPERADOR'])] },
      
      // ========== MÓDULOS CONDUCTOR ==========
      { path: 'rutas', loadComponent: () => import('./pages/rutas/rutas.component')
          .then(m => m.RutasComponent), canActivate: [roleGuard(['CONDUCTOR'])] },
      { path: 'pedidos', loadComponent: () => import('./pages/pedidos/pedidos.component')
          .then(m => m.PedidosComponent), canActivate: [roleGuard(['CONDUCTOR'])] },
      
      // ========== PERFIL ==========
      { path: 'profile', loadComponent: () => import('./pages/profile/profile.component')
          .then(m => m.ProfileComponent) }
  ]},

  { path: '**', loadComponent: () => import('./pages/not-found/not-found.component')
      .then(m => m.NotFoundComponent) }
];

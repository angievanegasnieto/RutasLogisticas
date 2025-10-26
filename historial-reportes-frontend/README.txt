Historial y Reporte de Pedidos Entregados (Frontend Angular - Standalone)

Archivos incluidos (copiar respetando rutas desde /src):
- src/app/models/pedido-view.ts
- src/app/models/pedidos-filtro.ts
- src/app/services/reportes-entregas.service.ts
- src/app/pages/reportes-entregas/reportes-entregas.component.ts
- src/app/pages/reportes-entregas/reportes-entregas.component.html
- src/app/pages/reportes-entregas/reportes-entregas.component.scss

Rutas:
1) Agrega la ruta en tu app.routes.ts (o archivo equivalente de rutas):
   ---------------------------------------------------------------
   import { Routes } from '@angular/router';
   import { ReportesEntregasComponent } from './pages/reportes-entregas/reportes-entregas.component';

   export const routes: Routes = [
     // ...otras rutas
     { path: 'admin/reportes-entregas', component: ReportesEntregasComponent },
   ];
   ---------------------------------------------------------------

2) Ajusta el apiBase si usas un archivo de configuración global.
   Por defecto, el servicio usa '/api'. Si tu gateway expone backend en otro prefijo,
   cambia la constante API_BASE dentro del servicio.

3) Si tienes Auth Interceptor para JWT, no necesitas hacer nada adicional.
   Las peticiones descargarán CSV/PDF como Blob.

4) Ejecuta el front y navega a:
   http://localhost:4200/admin/reportes-entregas

Requisitos:
- Angular 17+ (standalone components)
- HttpClientModule importado en main.ts o app.config.ts
- ReactiveFormsModule disponible (importado en el componente standalone)

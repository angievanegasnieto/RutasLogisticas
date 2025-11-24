import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { 
  Pedido, 
  EstadoPedido, 
  NotificacionPedido, 
  PedidoResponse, 
  NotificacionResponse,
  EstadisticasDTO
} from './models';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBase + 'api/pedidos';
  private notificacionesUrl = environment.apiBase + 'api/notificaciones';
  
  // Subject para notificaciones en tiempo real
  private notificacionesSubject = new BehaviorSubject<NotificacionPedido[]>([]);
  public notificaciones$ = this.notificacionesSubject.asObservable();

  // Obtener todos los pedidos (sin paginación, coincide con backend)
  obtenerPedidos(page: number = 0, size: number = 10, estado?: EstadoPedido): Observable<Pedido[]> {
    let params = new HttpParams();
    
    if (estado) {
      params = params.set('estado', estado);
    }
    
    return this.http.get<Pedido[]>(this.baseUrl, { params });
  }

  // Obtener pedido por ID
  obtenerPedido(id: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.baseUrl}/${id}`);
  }

  // Actualizar estado de pedido
  actualizarEstadoPedido(id: number, nuevoEstado: EstadoPedido): Observable<any> {
    const url = `${this.baseUrl}/${id}/estado?estado=${nuevoEstado}`;
    return this.http.patch(url, {});
  }

  // Obtener estadísticas
  obtenerEstadisticas(): Observable<EstadisticasDTO> {
    return this.http.get<EstadisticasDTO>(`${this.baseUrl}/estadisticas`);
  }

  // Obtener notificaciones
  obtenerNotificaciones(): Observable<NotificacionPedido[]> {
    return this.http.get<NotificacionPedido[]>(this.notificacionesUrl);
  }

  // Obtener notificaciones no vistas
  obtenerNotificacionesNoVistas(): Observable<NotificacionPedido[]> {
    return this.http.get<NotificacionPedido[]>(`${this.notificacionesUrl}/no-vistas`);
  }

  // Marcar notificación como vista
  marcarNotificacionVista(id: number): Observable<any> {
    return this.http.put(`${this.notificacionesUrl}/${id}/marcar-vista`, {});
  }

  // Marcar todas las notificaciones como vistas
  marcarTodasVistas(): Observable<any> {
    return this.http.put(`${this.notificacionesUrl}/marcar-todas-vistas`, {});
  }

  // Métodos para manejar estados con colores
  getEstadoColor(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE': return '#94a3b8'; // gris
      case 'ASIGNADO': return '#3b82f6'; // azul
      case 'EN_RUTA': return '#f59e0b'; // amarillo
      case 'ENTREGADO': return '#22c55e'; // verde
      case 'FALLIDO': return '#ef4444'; // rojo
      case 'REINTENTO': return '#8b5cf6'; // morado
      default: return '#94a3b8';
    }
  }

  getEstadoTexto(estado: EstadoPedido): string {
    switch (estado) {
      case 'PENDIENTE': return 'Pendiente';
      case 'ASIGNADO': return 'Asignado';
      case 'EN_RUTA': return 'En Ruta';
      case 'ENTREGADO': return 'Entregado';
      case 'FALLIDO': return 'Fallido';
      case 'REINTENTO': return 'Reintento';
      default: return estado;
    }
  }

  // Actualizar notificaciones localmente (para WebSocket)
  actualizarNotificaciones(notificaciones: NotificacionPedido[]) {
    this.notificacionesSubject.next(notificaciones);
  }

  // Agregar nueva notificación (para WebSocket)
  agregarNotificacion(notificacion: NotificacionPedido) {
    const notificacionesActuales = this.notificacionesSubject.value;
    this.notificacionesSubject.next([notificacion, ...notificacionesActuales]);
  }

  // Obtener estadísticas del dashboard
  getEstadisticas(): Observable<EstadisticasDTO> {
    return this.http.get<EstadisticasDTO>(`${this.baseUrl}/estadisticas`);
  }
}

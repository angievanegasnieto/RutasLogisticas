import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pedido {
  id?: number;
  clienteId?: number;
  clienteNombre?: string;
  direccionId?: number;
  direccionCompleta?: string;
  ciudad?: string;
  latitud?: number;
  longitud?: number;
  cliente?: string;  // Para compatibilidad con formulario simple
  direccion?: string; // Para compatibilidad con formulario simple
  producto?: string;
  cantidad?: number;
  fechaProgramada: string;
  ventanaInicio?: string;
  ventanaFin?: string;
  volumen?: number;
  peso?: number;
  conductorId?: number;
  estado: string;
  creadoEn?: string;
}

@Injectable({ providedIn: 'root' })
export class PedidosSimpleService {
  private apiUrl = 'http://localhost:8080/api/pedidos'; // Puerto del backend

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  create(pedido: Partial<Pedido>): Observable<Pedido> {
    // Asegurarse de enviar los IDs requeridos por el backend
    const payload = {
      clienteId: pedido.clienteId,
      direccionId: pedido.direccionId,
      fechaProgramada: pedido.fechaProgramada,
      ventanaInicio: pedido.ventanaInicio || '08:00:00',
      ventanaFin: pedido.ventanaFin || '12:00:00',
      producto: pedido.producto || '',
      cantidad: pedido.cantidad || 1,
      volumen: pedido.volumen || 0,
      peso: pedido.peso || 0,
      latitud: pedido.latitud,
      longitud: pedido.longitud,
      conductorId: (pedido as any).conductorId
    };
    return this.http.post<Pedido>(this.apiUrl, payload);
  }

  update(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    const payload = {
      clienteId: pedido.clienteId,
      direccionId: pedido.direccionId,
      fechaProgramada: pedido.fechaProgramada,
      ventanaInicio: pedido.ventanaInicio ? pedido.ventanaInicio + ':00' : '08:00:00',
      ventanaFin: pedido.ventanaFin ? pedido.ventanaFin + ':00' : '12:00:00',
      producto: pedido.producto,
      cantidad: pedido.cantidad,
      volumen: pedido.volumen,
      peso: pedido.peso,
      estado: pedido.estado,
      latitud: pedido.latitud,
      longitud: pedido.longitud,
      conductorId: (pedido as any).conductorId
    };
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, payload);
  }

  // Asignar conductor a un pedido
  assignConductor(id: number, conductorId: number): Observable<Pedido> {
    return this.http.patch<Pedido>(`${this.apiUrl}/${id}/asignar-conductor?conductorId=${conductorId}`, {});
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

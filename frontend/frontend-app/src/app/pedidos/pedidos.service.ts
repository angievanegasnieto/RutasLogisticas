import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pedido {
  id?: number;
  cliente: string;
  direccion: string;
  producto: string;
  cantidad: number;
  fechaProgramada: string;
  ventanaInicio?: string;   // ✅ agrega estas dos
  ventanaFin?: string;
  estado: string;
}


@Injectable({ providedIn: 'root' })
export class PedidosService {
  private apiUrl = 'http://localhost:8081/api/pedidos'; // 🔹 Ajusta si tu backend usa otro puerto

  constructor(private http: HttpClient) {}

  getAll(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(this.apiUrl);
  }

  create(pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.post<Pedido>(this.apiUrl, pedido);
  }

  update(id: number, pedido: Partial<Pedido>): Observable<Pedido> {
    return this.http.put<Pedido>(`${this.apiUrl}/${id}`, pedido);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PedidoView } from '../models/pedido-view';
import { PedidosFiltro } from '../models/pedidos-filtro';

// Ajusta esta constante si tu gateway usa otro prefijo, p.ej. '/backend' o similar
const API_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class ReportesEntregasService {
  private http = inject(HttpClient);

  listar(f: PedidosFiltro): Observable<PedidoView[]> {
    let params = new HttpParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get<PedidoView[]>(`${API_BASE}/reportes/entregas`, { params });
  }

  exportCsv(f: PedidosFiltro): Observable<Blob> {
    let params = new HttpParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get(`${API_BASE}/reportes/entregas/csv`, { params, responseType: 'blob' });
  }

  exportPdf(f: PedidosFiltro): Observable<Blob> {
    let params = new HttpParams();
    Object.entries(f).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        params = params.set(k, String(v));
      }
    });
    return this.http.get(`${API_BASE}/reportes/entregas/pdf`, { params, responseType: 'blob' });
  }
}

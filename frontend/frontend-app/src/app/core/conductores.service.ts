import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Conductor } from './models';

@Injectable({ providedIn: 'root' })
export class ConductoresService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}api/conductores`;

  // Listar todos los conductores
  listar(): Observable<Conductor[]> {
    return this.http.get<Conductor[]>(this.baseUrl);
  }

  // Listar solo conductores activos
  listarActivos(): Observable<Conductor[]> {
    return this.http.get<Conductor[]>(`${this.baseUrl}/activos`);
  }

  // Obtener conductor por ID
  obtenerPorId(id: number): Observable<Conductor> {
    return this.http.get<Conductor>(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo conductor
  crear(conductor: Partial<Conductor>): Observable<Conductor> {
    return this.http.post<Conductor>(this.baseUrl, conductor);
  }

  // Actualizar conductor
  actualizar(id: number, conductor: Partial<Conductor>): Observable<Conductor> {
    return this.http.put<Conductor>(`${this.baseUrl}/${id}`, conductor);
  }

  // Cambiar estado de conductor (ACTIVO/INACTIVO)
  cambiarEstado(id: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<Conductor> {
    return this.http.patch<Conductor>(
      `${this.baseUrl}/${id}/estado?estado=${estado}`,
      {}
    );
  }

  // Eliminar conductor
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

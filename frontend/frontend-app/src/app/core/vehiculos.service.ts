import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vehiculo } from './models';

@Injectable({ providedIn: 'root' })
export class VehiculosService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}api/vehiculos`;

  // Listar todos los vehículos
  listar(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(this.baseUrl);
  }

  // Listar solo vehículos activos
  listarActivos(): Observable<Vehiculo[]> {
    return this.http.get<Vehiculo[]>(`${this.baseUrl}/activos`);
  }

  // Obtener vehículo por ID
  obtenerPorId(id: number): Observable<Vehiculo> {
    return this.http.get<Vehiculo>(`${this.baseUrl}/${id}`);
  }

  // Crear nuevo vehículo
  crear(vehiculo: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.http.post<Vehiculo>(this.baseUrl, vehiculo);
  }

  // Actualizar vehículo
  actualizar(id: number, vehiculo: Partial<Vehiculo>): Observable<Vehiculo> {
    return this.http.put<Vehiculo>(`${this.baseUrl}/${id}`, vehiculo);
  }

  // Cambiar estado de vehículo (ACTIVO/INACTIVO)
  cambiarEstado(id: number, estado: 'ACTIVO' | 'INACTIVO'): Observable<Vehiculo> {
    return this.http.patch<Vehiculo>(
      `${this.baseUrl}/${id}/estado?estado=${estado}`,
      {}
    );
  }

  // Eliminar vehículo
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}

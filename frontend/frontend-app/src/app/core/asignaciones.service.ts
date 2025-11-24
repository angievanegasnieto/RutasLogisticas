import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AsignacionVehiculo } from './models';

@Injectable({ providedIn: 'root' })
export class AsignacionesService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}api/asignaciones-vehiculo`;

  // Listar todas las asignaciones
  listar(): Observable<AsignacionVehiculo[]> {
    return this.http.get<AsignacionVehiculo[]>(this.baseUrl);
  }

  // Listar solo asignaciones activas
  listarActivas(): Observable<AsignacionVehiculo[]> {
    return this.http.get<AsignacionVehiculo[]>(`${this.baseUrl}/activas`);
  }

  // Obtener asignación por ID
  obtenerPorId(id: number): Observable<AsignacionVehiculo> {
    return this.http.get<AsignacionVehiculo>(`${this.baseUrl}/${id}`);
  }

  // Crear nueva asignación
  crear(asignacion: {
    conductorId: number;
    vehiculoId: number;
    observaciones?: string;
  }): Observable<AsignacionVehiculo> {
    return this.http.post<AsignacionVehiculo>(this.baseUrl, asignacion);
  }

  // Finalizar asignación
  finalizar(id: number, observaciones?: string): Observable<AsignacionVehiculo> {
    const body = observaciones ? { observacionesFinalizacion: observaciones } : {};
    return this.http.patch<AsignacionVehiculo>(`${this.baseUrl}/${id}/finalizar`, body);
  }

  // Actualizar observaciones
  actualizarObservaciones(id: number, observaciones: string): Observable<AsignacionVehiculo> {
    return this.http.put<AsignacionVehiculo>(`${this.baseUrl}/${id}/observaciones`, { 
      observaciones 
    });
  }

  // Obtener asignación activa de un conductor
  obtenerAsignacionActivaConductor(conductorId: number): Observable<AsignacionVehiculo> {
    return this.http.get<AsignacionVehiculo>(`${this.baseUrl}/conductor/${conductorId}/activa`);
  }

  // Obtener asignación activa de un vehículo
  obtenerAsignacionActivaVehiculo(vehiculoId: number): Observable<AsignacionVehiculo> {
    return this.http.get<AsignacionVehiculo>(`${this.baseUrl}/vehiculo/${vehiculoId}/activa`);
  }

  // Listar asignaciones por conductor
  listarPorConductor(conductorId: number): Observable<AsignacionVehiculo[]> {
    return this.http.get<AsignacionVehiculo[]>(`${this.baseUrl}/conductor/${conductorId}`);
  }

  // Listar asignaciones por vehículo
  listarPorVehiculo(vehiculoId: number): Observable<AsignacionVehiculo[]> {
    return this.http.get<AsignacionVehiculo[]>(`${this.baseUrl}/vehiculo/${vehiculoId}`);
  }

  // Eliminar asignación
  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
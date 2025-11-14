import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Ruta, ParadaRuta, EstadoParada } from './models';

@Injectable({
  providedIn: 'root'
})
export class RutasService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/rutas';

  /**
   * Obtener todas las rutas
   */
  obtenerRutas(): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(this.apiUrl);
  }

  /**
   * Obtener ruta por ID
   */
  obtenerRutaPorId(id: number): Observable<Ruta> {
    return this.http.get<Ruta>(`${this.apiUrl}/${id}`);
  }

  /**
   * Obtener rutas de un conductor
   */
  obtenerRutasPorConductor(conductorId: number): Observable<Ruta[]> {
    return this.http.get<Ruta[]>(`${this.apiUrl}/conductor/${conductorId}`);
  }

  /**
   * Obtener paradas de una ruta
   */
  obtenerParadasDeRuta(rutaId: number): Observable<ParadaRuta[]> {
    return this.http.get<ParadaRuta[]>(`${this.apiUrl}/${rutaId}/paradas`);
  }

  /**
   * INICIAR RUTA - Cambia estado a EN_PROGRESO
   */
  iniciarRuta(rutaId: number): Observable<Ruta> {
    return this.http.post<Ruta>(`${this.apiUrl}/${rutaId}/iniciar`, {});
  }

  /**
   * FINALIZAR RUTA - Cambia estado a COMPLETADA
   */
  finalizarRuta(rutaId: number): Observable<Ruta> {
    return this.http.post<Ruta>(`${this.apiUrl}/${rutaId}/finalizar`, {});
  }

  /**
   * ACTUALIZAR ESTADO DE PARADA (pedido individual)
   */
  actualizarEstadoParada(paradaId: number, estado: EstadoParada, nota?: string): Observable<ParadaRuta> {
    return this.http.patch<ParadaRuta>(`${this.apiUrl}/paradas/${paradaId}/estado`, {
      estado: estado,
      nota: nota || ''
    });
  }

  /**
   * Obtener color del estado de ruta
   */
  getEstadoRutaColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PLANIFICADA': '#94A3B8',    // Gris
      'ASIGNADA': '#4169E1',       // Azul
      'EN_PROGRESO': '#FFA500',    // Naranja
      'PAUSADA': '#FFD700',        // Amarillo
      'COMPLETADA': '#32CD32'      // Verde
    };
    return colores[estado] || '#6B7280';
  }

  /**
   * Obtener texto del estado de ruta
   */
  getEstadoRutaTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'PLANIFICADA': 'Planificada',
      'ASIGNADA': 'Asignada',
      'EN_PROGRESO': 'En Progreso',
      'PAUSADA': 'Pausada',
      'COMPLETADA': 'Completada'
    };
    return textos[estado] || estado;
  }

  /**
   * Obtener color del estado de parada
   */
  getEstadoParadaColor(estado: string): string {
    const colores: { [key: string]: string } = {
      'PENDIENTE': '#94A3B8',   // Gris
      'ENTREGADO': '#32CD32',   // Verde
      'FALLIDO': '#FF6347',     // Rojo
      'REINTENTO': '#FFD700'    // Amarillo
    };
    return colores[estado] || '#6B7280';
  }

  /**
   * Obtener texto del estado de parada
   */
  getEstadoParadaTexto(estado: string): string {
    const textos: { [key: string]: string } = {
      'PENDIENTE': 'Pendiente',
      'ENTREGADO': 'Entregado',
      'FALLIDO': 'Fallido',
      'REINTENTO': 'Reintento'
    };
    return textos[estado] || estado;
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Coordinates {
  latitude: string;
  longitude: string;
  displayName?: string;
}

export interface Route {
  distance: number; // km
  duration: number; // segundos
  waypoints: Coordinates[];
  geometry: string;
}

@Injectable({ providedIn: 'root' })
export class LocationService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiBase}api/location`;

  /**
   * Geocodificar una dirección (convertir dirección en coordenadas)
   */
  geocode(address: string): Observable<Coordinates> {
    return this.http.get<Coordinates>(`${this.baseUrl}/geocode`, {
      params: { address }
    });
  }

  /**
   * Geocodificación inversa (convertir coordenadas en dirección)
   */
  reverseGeocode(lat: string, lon: string): Observable<{ address: string }> {
    return this.http.get<{ address: string }>(`${this.baseUrl}/reverse`, {
      params: { lat, lon }
    });
  }

  /**
   * Calcular ruta óptima entre múltiples puntos
   */
  calculateRoute(waypoints: Coordinates[]): Observable<Route> {
    return this.http.post<Route>(`${this.baseUrl}/route`, waypoints);
  }

  /**
   * Autocompletar direcciones
   */
  autocomplete(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/autocomplete`, {
      params: { q: query }
    });
  }

  /**
   * Convertir duración de segundos a formato legible
   */
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    }
    return `${minutes} min`;
  }

  /**
   * Formatear distancia
   */
  formatDistance(km: number): string {
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(2)} km`;
  }
}

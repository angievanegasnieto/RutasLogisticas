import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Cliente {
  id: number;
  nombre: string;
  telefono?: string;
  email?: string;
}

export interface Direccion {
  id: number;
  clienteId?: number;
  direccion: string;
  ciudad: string;
  latitud?: number;  // Mapeado desde 'lat' del backend
  longitud?: number; // Mapeado desde 'lng' del backend
  lat?: number;      // Campo original del backend
  lng?: number;      // Campo original del backend
  etiqueta?: string;
  departamento?: string;
  pais?: string;
  codigoPostal?: string;
  verificada?: boolean;
  precisionGeocodificacion?: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private apiUrl = 'http://localhost:8080/api/clientes';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }
}

@Injectable({ providedIn: 'root' })
export class DireccionService {
  private apiUrl = 'http://localhost:8080/api/direcciones';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(this.apiUrl);
  }

  getByClienteId(clienteId: number): Observable<Direccion[]> {
    return this.http.get<Direccion[]>(`${this.apiUrl}/cliente/${clienteId}`);
  }
}

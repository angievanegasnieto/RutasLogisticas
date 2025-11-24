import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiBase;

  // Los métodos antiguos de Driver/Vehicle/Assignment fueron removidos
  // Ahora usamos Conductor/Vehiculo/Ruta desde RutasService
}

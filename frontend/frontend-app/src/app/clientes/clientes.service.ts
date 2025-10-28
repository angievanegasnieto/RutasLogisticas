import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientesService {
  private baseUrl = `${environment.apiBase}/logistics/api/logistics/clientes`;

  constructor(private http: HttpClient) {}

  getClientes(): Observable<any[]> {
    return this.http.get<any[]>(this.baseUrl);
  }

  createCliente(cliente: any): Observable<any> {
    return this.http.post<any>(this.baseUrl, cliente);
  }

  deleteCliente(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/${id}`);
  }
}

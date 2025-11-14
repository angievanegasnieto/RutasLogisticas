import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { UserView, Role } from './models';
import { Observable } from 'rxjs';

export interface UserPayload {
  name: string;
  email: string;
  role: Role;
  enabled?: boolean;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = `/admin/users`;
  constructor(private http: HttpClient) {}

  list(): Observable<UserView[]> {
    return this.http.get<UserView[]>(this.base);
  }

  create(data: UserPayload & { password: string }): Observable<UserView> {
    console.log('🔵 UsersService.create() llamado con:', data);
    console.log('🔵 Endpoint: POST', `${this.base}`);
    return this.http.post<UserView>(this.base, data);
  }

  update(id: number, data: UserPayload): Observable<UserView> {
    return this.http.put<UserView>(`${this.base}/${id}`, data);
  }

  resetPassword(id: number, newPassword: string): Observable<void> {
    return this.http.patch<void>(`${this.base}/${id}/password`, { password: newPassword });
  }

  toggleEnabled(id: number, enabled: boolean): Observable<UserView> {
    return this.http.patch<UserView>(`${this.base}/${id}/enabled`, { enabled });
  }

  remove(id: number): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }
}

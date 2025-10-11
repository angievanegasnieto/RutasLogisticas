
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, UserView } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBase; // ej: http://localhost:8082
  private _user  = signal<UserView | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('token'));

  constructor(private http: HttpClient, private router: Router) {}

  // señales readonly para quien quiera suscribirse
  user  = this._user.asReadonly();
  token = this._token.asReadonly();

  // getter cómodo para el interceptor
  get tokenValue(): string | null { return this._token(); }

  isLoggedIn(): boolean { return !!this._token(); }

  login(email: string, password: string) {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, { email, password });
  }

  // role opcional por si lo necesitas
  register(name: string, email: string, password: string, role?: string) {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, { name, email, password, role });
  }

  me() {
    return this.http.get<UserView>(`${this.base}/auth/me`);
  }

  saveSession(res: AuthResponse) {
    this._user.set(res.user);
    this._token.set(res.token);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }

  logout() {
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // opcional: redirigir
    // this.router.navigateByUrl('/login');
  }

  private loadUser(): UserView | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }
}

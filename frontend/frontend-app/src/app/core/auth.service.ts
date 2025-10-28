
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, UserView, Role } from './models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private base = environment.apiBase; // ej: http://localhost:8082
  private _user  = signal<UserView | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('token'));
  private logoutTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private http: HttpClient, private router: Router) {
    const token = this._token();
    if (token) {
      this.applyTokenLifecycle(token);
    }
  }

  // señales readonly para quien quiera suscribirse
  user  = this._user.asReadonly();
  token = this._token.asReadonly();

  // getter cómodo para el interceptor
  get tokenValue(): string | null { return this._token(); }

  isLoggedIn(): boolean {
    const token = this._token();
    return !!token && !this.isTokenExpired(token);
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  hasRole(role: Role): boolean {
    const current = this._user();
    return !!current && current.role === role;
  }

  isOperator(): boolean {
    return this.hasRole('OPERADOR');
  }

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
    this.applyTokenLifecycle(res.token);
  }

  logout(reason?: 'expired') {
    this._user.set(null);
    this._token.set(null);
    this.clearAutoLogout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    if (reason === 'expired') {
      sessionStorage.setItem('sessionExpired', '1');
    } else {
      sessionStorage.removeItem('sessionExpired');
    }
    this.router.navigateByUrl('/login');
  }

  private loadUser(): UserView | null {
    try { return JSON.parse(localStorage.getItem('user') || 'null'); }
    catch { return null; }
  }

  private isTokenExpired(token: string): boolean {
    const expiresAt = this.getTokenExpiration(token);
    return expiresAt !== null && expiresAt <= Date.now();
  }

  private applyTokenLifecycle(token: string) {
    const expiresAt = this.getTokenExpiration(token);
    if (expiresAt === null) return;
    const remaining = expiresAt - Date.now();
    if (remaining <= 0) {
      this.handleSessionExpiry();
      return;
    }
    this.scheduleAutoLogout(remaining);
  }

  private handleSessionExpiry() {
    this.logout('expired');
  }

  private scheduleAutoLogout(ms: number) {
    this.clearAutoLogout();
    this.logoutTimer = setTimeout(() => this.handleSessionExpiry(), ms);
  }

  private clearAutoLogout() {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
      this.logoutTimer = null;
    }
  }

  private getTokenExpiration(token: string): number | null {
    const payload = this.decodeTokenPayload(token);
    if (!payload || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  }

  private decodeTokenPayload(token: string): Record<string, unknown> | null {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4 !== 0) base64 += '=';
    try {
      const decoded = globalThis.atob(base64);
      return JSON.parse(decoded);
    } catch {
      return null;
    }
  }
}

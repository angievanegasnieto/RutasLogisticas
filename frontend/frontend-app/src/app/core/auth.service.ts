
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, UserView } from './models';

@Injectable({providedIn: 'root'})
export class AuthService {
  private base = environment.apiBase;
  private _user = signal<UserView | null>(this.loadUser());
  private _token = signal<string | null>(localStorage.getItem('token'));

  constructor(private http:HttpClient, private router:Router){}

  user = this._user.asReadonly();
  token = this._token.asReadonly();

  isLoggedIn(){ return !!this._token(); }

  login(email:string, password:string){
    return this.http.post<AuthResponse>(`${this.base}auth/login`, { email, password });
  }
  register(name:string, email:string, password:string){
    return this.http.post<AuthResponse>(`${this.base}auth/register`, { name, email, password });
  }
  me(){
    return this.http.get<UserView>(`${this.base}auth/me`);
  }

  saveSession(res:AuthResponse){
    this._user.set(res.user);
    this._token.set(res.token);
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
  }
  logout(){
    this._user.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
  private loadUser():UserView | null {
    try{ return JSON.parse(localStorage.getItem('user')||'null'); }catch{ return null; }
  }
}

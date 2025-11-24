import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.tokenValue;              // string | null
  
  // Agregar token a todas las peticiones de API (excepto login/register)
  const isAuthEndpoint = req.url.includes('/auth/login') || req.url.includes('/auth/register');
  
  if (token && !isAuthEndpoint && !req.headers.has('Authorization')) {
    req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
  }
  return next(req);
};



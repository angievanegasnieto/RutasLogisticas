import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';

export function roleGuard(allowed: Array<'ADMIN'|'OPERATOR'|'USER'|'CONDUCTOR'>): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const role = auth.user()?.role;
    if (role && allowed.includes(role as any)) return true;
    router.navigateByUrl('/dashboard');
    return false;
  };
}


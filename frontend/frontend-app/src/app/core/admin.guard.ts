import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  if (!auth.isLoggedIn()) {
    auth.logout();
    return false;
  }
  if (auth.isAdmin()) return true;
  const router = inject(Router);
  router.navigateByUrl('/dashboard');
  return false;
};

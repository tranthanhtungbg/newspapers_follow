import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const token = localStorage.getItem('cms_token');
  if (token && token !== 'undefined' && token !== 'null') return true;
  router.navigate(['/login']);
  return false;
};

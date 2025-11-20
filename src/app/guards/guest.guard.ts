import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthHttpService } from '../auth-http.service';

export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthHttpService);
  const router = inject(Router);
  const token = auth.getToken();
  const isAuthed = !!token && !auth.isTokenExpired();
  if (isAuthed) {
    const tree: UrlTree = router.createUrlTree(['/dashboard']);
    return tree;
  }
  return true;
};
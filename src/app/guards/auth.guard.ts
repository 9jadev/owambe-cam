import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { inject } from '@angular/core';
import { AuthHttpService } from '../services/auth-http.service';

export const authGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthHttpService);
  const router = inject(Router);
  const token = auth.getToken();
  const isAuthed = !!token && !auth.isTokenExpired();
  if (isAuthed) return true;
  const tree: UrlTree = router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return tree;
};
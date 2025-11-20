import { HttpInterceptorFn, HttpErrorResponse, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthHttpService } from '../auth-http.service';
import { ToastService } from '../toast.service';

const isRefreshUrl = (url: string) => url.includes('/refresh');

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthHttpService);
  const toast = inject(ToastService);

  const token = auth.getToken();
  let authReq: HttpRequest<any> = req;

  if (token) {
    authReq = req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) });
  }

  return next(authReq).pipe(
    catchError((error: any) => {
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 && token && !isRefreshUrl(req.url)) {
          // Attempt refresh then retry
          return auth.refreshToken().pipe(
            switchMap(() => {
              const newToken = auth.getToken();
              const retriedReq = authReq.clone({
                headers: authReq.headers.set('Authorization', `Bearer ${newToken}`)
              });
              return next(retriedReq);
            }),
            catchError((refreshErr) => {
              auth.clearToken();
              toast.error('Session expired. Please log in again.');
              return throwError(() => refreshErr);
            })
          );
        }

        const msg = error.error?.message || error.message || `HTTP error ${error.status}`;
        toast.error(msg);
      }
      return throwError(() => error);
    })
  );
};
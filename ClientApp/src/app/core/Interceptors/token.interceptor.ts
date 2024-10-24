import { HttpEvent, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError} from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const addAuthToken = (request: HttpRequest<any>): HttpRequest<any> => {
    const token = authService.getToken();
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  };

  const handle401Error = (request: HttpRequest<any>): Observable<HttpEvent<any>> => {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshTokenSubject.next(null);

      return authService.refreshToken().pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          refreshTokenSubject.next(response);
          return next(addAuthToken(request));
        }),
        catchError((error) => {
          isRefreshing = false;
          refreshTokenSubject.error(error);
          return throwError(error);
        })
      );
    } else {
      return refreshTokenSubject.asObservable().pipe(
        filter(result => result !== null),
        take(1),
        switchMap(() => next(addAuthToken(request)))
      );
    }
  };

  const authReq = addAuthToken(req);
  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error(req);
      } else {
        return throwError(error);
      }
    })
  );
};

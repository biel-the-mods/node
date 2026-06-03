import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      const message =
        (typeof err.error === 'object' && err.error?.message) ||
        err.message ||
        'Erro de comunicação com o servidor.';

      toast.show({
        type: 'error',
        title: `Erro ${err.status || 'de rede'}`,
        message,
      });

      return throwError(() => err);
    })
  );
};

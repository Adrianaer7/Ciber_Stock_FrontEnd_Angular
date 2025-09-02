import { HttpErrorResponse } from '@angular/common/http';
import { catchError, OperatorFunction, throwError } from 'rxjs';

export function manejarHttpError<T>(msg: string = 'Error inesperado'): OperatorFunction<T, T> {
  return catchError((error: HttpErrorResponse) => {
    const mensaje = error.error?.msg || msg;
    return throwError(() => mensaje); //devuelve mensaje de error del back, y si no lo hay devuelve 'Error inesperado'
  });
}
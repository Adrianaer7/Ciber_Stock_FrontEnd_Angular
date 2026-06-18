import { HttpErrorResponse } from '@angular/common/http';

export function getHttpResourceErrorMessage(error: HttpErrorResponse | Error): string {
  if (error instanceof HttpErrorResponse) {
    return error.error?.msg ?? 'No se pudo conectar con el servidor';
  }
  return error.message || 'No se pudo conectar con el servidor';
}

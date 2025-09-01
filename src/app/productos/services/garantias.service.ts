import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Garantia } from '../interfaces/productos.interface';
import { environment } from 'environments/environment.development';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

@Injectable({
    providedIn: 'root'
})
export class GarantiasService {
    private http = inject(HttpClient)
    garantias = signal<Garantia[]>([])

    crearGarantia(codigo: number, garantia: string, proveedor: string): Observable<Garantia | string> {
        return this.http.post<Garantia>(`${environment.backendURL}/garantias`, {codigo, garantia, proveedor})
            .pipe(
                map(res => res),
                manejarHttpError()
            );
    }

    traerGarantias(): Observable<Garantia[] | string> {
        return this.http.get<{ garantias: Garantia[] }>(`${environment.backendURL}/garantias`)
            .pipe(
                tap(res => this.garantias.set(res.garantias)),
                map(res => res.garantias)
                //catchError((error: ErrorResponse) => of(error.error.statusCode))
            )
            
    }
}
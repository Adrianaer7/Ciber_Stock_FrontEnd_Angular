import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';
import { environment } from 'environments/environment.development';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FaltantesService {

    private http = inject(HttpClient)
    faltantes = signal<Producto[]>([])

    crearFaltante(faltante: Producto): Observable<Producto | string> {
        return this.http.post<{ faltante: Producto }>(`${environment.backendURL}/faltantes`, faltante)
            .pipe(
                tap(res => this.faltantes.update(faltantes => [...faltantes, res.faltante])),
                map((res) => res.faltante),
                catchError((error: ErrorResponse) => of(error.error.msg))
            );
    }


    traerFaltantes(): Observable<Producto[] | string> {
        return this.http.get<{ faltantes: Producto[] }>(`${environment.backendURL}/faltantes`)
            .pipe(
                tap(res => this.faltantes.set(res.faltantes)),
                map((res) => res.faltantes),
                catchError((error: ErrorResponse) => error.error.msg)
            )
    }


    eliminarUnFaltante(id: string): Observable<Producto | string> {
        return this.http.put<{ producto: Producto }>(`${environment.backendURL}/faltantes/${id}`, {})
            .pipe(
                tap(() => this.faltantes.update(faltantes => faltantes.filter(faltante => faltante._id !== id))),
                map((res) => res.producto),
                catchError((error: ErrorResponse) => error.error.msg)
            )
    }
}
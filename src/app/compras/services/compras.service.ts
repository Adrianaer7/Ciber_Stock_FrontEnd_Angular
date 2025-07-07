import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';
import { environment } from 'environments/environment.development';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Compra } from '../interfaces/compras.interfaces';

@Injectable({
    providedIn: 'root'
})

export class ComprasService {

    private http = inject(HttpClient)
    compras = signal<Compra[]>([])

    crearFaltante(compra: Compra): Observable<Compra | string> {
        return this.http.post<{ compra: Compra }>(`${environment.backendURL}/compras`, compra)
            .pipe(
                tap(res => this.compras.update(compras => [...compras, res.compra])),
                map((res) => res.compra),
                catchError((error: ErrorResponse) => of(error.error.msg))
            );
    }


    traerFaltantes(): Observable<Compra[] | string> {
        return this.http.get<{ todas: Compra[] }>(`${environment.backendURL}/compras`)
            .pipe(
                tap(res => this.compras.set(res.todas)),
                map((res) => res.todas),
                catchError((error: ErrorResponse) => error.error.msg)
            )
    }


    eliminarUnFaltante(id: string): Observable<Compra | string> {
        return this.http.put<{ producto: Compra }>(`${environment.backendURL}/compras/${id}`, {})
            .pipe(
                tap(() => this.compras.update(compras => compras.filter(compra => compra._id !== id))),
                map((res) => res.producto),
                catchError((error: ErrorResponse) => error.error.msg)
            )
    }

}
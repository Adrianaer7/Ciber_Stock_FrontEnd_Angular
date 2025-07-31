import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';
import { environment } from 'environments/environment.development';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Compra } from '../interfaces/compras.interfaces';
import { Producto } from 'app/productos/interfaces/productos.interface';

@Injectable({
    providedIn: 'root'
})

export class ComprasService {

    private http = inject(HttpClient)
    compras = signal<Compra[]>([])

    crearCompra(producto: Producto, cantidad: number, desdeForm: boolean): Observable<Compra | string> {
        return this.http.post<{ compra: Compra }>(`${environment.backendURL}/compras`, {producto, cantidad, desdeForm})
            .pipe(
                map(res => res.compra),
                catchError((error: ErrorResponse) => of(error.error.msg))
            );
    }


    traerCompras(): Observable<Compra[] | string> {
        return this.http.get<{ todas: Compra[] }>(`${environment.backendURL}/compras`)
            .pipe(
                tap(res => this.compras.set(res.todas)),
                map(res => res.todas),
                catchError((error: ErrorResponse) => error.error.msg)
            )
    }

}
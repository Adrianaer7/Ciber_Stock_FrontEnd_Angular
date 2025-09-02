import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from 'environments/environment.development';
import { map, Observable, tap } from 'rxjs';
import { Compra } from '../interfaces/compras.interfaces';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

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
                manejarHttpError()
            );
    }


    traerCompras(): Observable<Compra[] | string> {
        return this.http.get<{ todas: Compra[] }>(`${environment.backendURL}/compras`)
            .pipe(
                tap(res => this.compras.set(res.todas)),
                map(res => res.todas),
                manejarHttpError()
            )
    }

}
import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { ProductosService } from 'app/productos/services/productos.service';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';
import { environment } from 'environments/environment.development';
import { catchError, map, Observable, of, tap } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FaltantesService {

    private http = inject(HttpClient)
    productosService = inject(ProductosService)
    faltantes = signal<Producto[]>([])

    editarFaltante(id: string): Observable<Producto | string> {
        return this.http.put<{ producto: Producto }>(`${environment.backendURL}/faltantes/${id}`, {} )
            .pipe(
                tap(res => this.faltantes.update(faltantes => faltantes.filter(faltante => faltante._id !== res.producto._id))),
                tap(res => this.productosService.productos.update(productos => productos.map(producto => producto._id === res.producto._id ? res.producto : producto))),
                map(res => res.producto),
                catchError((error: ErrorResponse) => of(error.error.msg))
            );
    }


    traerFaltantes(): Observable<Producto[] | string> {
        return this.http.get<{ faltantes: Producto[] }>(`${environment.backendURL}/faltantes`)
            .pipe(
                tap(res => this.faltantes.set(res.faltantes)),
                map(res => res.faltantes),
                catchError((error: ErrorResponse) => error.error.msg)
            )
    }
}
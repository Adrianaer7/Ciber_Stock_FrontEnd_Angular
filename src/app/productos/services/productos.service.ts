import { HttpClient } from '@angular/common/http';
import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Producto } from '../interfaces/productos.interface';
import { environment } from '../../../environments/environment.development';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private http = inject(HttpClient)
  productos = signal<Producto[]>([])


  traerProductos(): Observable<Producto[] | string> {
    return this.http.get<{ productos: Producto[] }>(`${environment.backendURL}/productos`)
      .pipe(
        tap(res => this.productos.set(res.productos)),
        map(res => res.productos),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }

  editarProducto(producto: Producto, desdeForm?: false, formData?: false): Observable<Producto | string> {
    return this.http.put<Producto>(`${environment.backendURL}/productos/${producto._id}`, {producto, desdeForm})
      .pipe(
        tap(res => this.productos.update(productos => productos.map(producto => producto._id == res._id ? res : producto))),
        map(res => res),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }
}

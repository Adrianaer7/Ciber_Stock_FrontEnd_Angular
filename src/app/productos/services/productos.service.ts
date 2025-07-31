import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Producto } from '../interfaces/productos.interface';
import { environment } from '../../../environments/environment.development';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';
import { ComprasService } from 'app/compras/services/compras.service';
import { GarantiasService } from './garantias.service';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private http = inject(HttpClient)
  comprasService = inject(ComprasService)
  garantiasService = inject(GarantiasService)
  productos = signal<Producto[]>([])
  codigos = signal<number[]>([]);

  agregarProducto(producto: Producto, cantidad: number, desdeForm: boolean = true, formData?: FormData): Observable<Producto | string> {
    return this.http.post<{ producto: Producto }>(`${environment.backendURL}/productos`, producto )
      .pipe(
        tap(res => this.productos.update(productos => [...productos, res.producto])),
       /*  tap(() => {
          if (formData) this.subirImagen(formData)
        }),
        tap(() => {
          if (desdeForm && cantidad > 0) this.comprasService.crearCompra(producto, cantidad, desdeForm)
        }),
        tap(() => () => {
          if (cantidad > 0 && producto.proveedor && producto.garantia) this.garantiasService.crearGarantia(producto.codigo, producto.garantia, producto.proveedor)
        }), */
        map(res => res.producto),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }


  traerProductos(): Observable<Producto[] | string> {
    return this.http.get<{ productos: Producto[] }>(`${environment.backendURL}/productos`)
      .pipe(
        tap(res => this.productos.set(res.productos)),
        map(res => res.productos),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }

  editarProducto(producto: Producto, cantidad: number, desdeForm: boolean = false, formData?: FormData): Observable<Producto | string> {
    return this.http.put<Producto>(`${environment.backendURL}/productos/${producto._id}`, { producto, desdeForm })
      .pipe(
        tap(res => this.productos.update(productos => productos.map(producto => producto._id == res._id ? res : producto))),
        tap(() => {
          if (formData) this.subirImagen(formData)
        }),
        tap(() => {
          if (desdeForm && producto.disponibles > 0) this.comprasService.crearCompra(producto, cantidad, desdeForm)
        }),
        tap(() => {
          if (cantidad > 0 && producto.proveedor && producto.garantia && desdeForm) this.garantiasService.crearGarantia(producto.codigo, producto.garantia, producto.proveedor)
        }),
        map(res => res),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }

  traerProducto(id: string): Observable<Producto | string> {
    return this.http.get<{ producto: Producto }>(`${environment.backendURL}/productos/${id}`)
      .pipe(
        map(res => res.producto),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }

  eliminarProducto(id: string): Observable<string | boolean> {
    return this.http.delete<{ msg: string }>(`${environment.backendURL}/productos/${id}`)
      .pipe(
        tap(() => this.productos.update(productos => productos.filter(producto => producto._id !== id))),
        map(() => true),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }

  traerCodigos(): Observable<number[] | string> {
    return this.http.get<{ codigosDisponibles: number[] }>(`${environment.backendURL}/codigos`)
      .pipe(
        tap(res => this.codigos.set(res.codigosDisponibles)),
        map(res => res.codigosDisponibles),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }

  subirImagen(formData: FormData): Observable<string> {
    return this.http.post<string>(`${environment.backendURL}/imagenes`, formData)
      .pipe(
        map(res => res),
        catchError((error: ErrorResponse) => of(error.error.msg))
      )
  }
}

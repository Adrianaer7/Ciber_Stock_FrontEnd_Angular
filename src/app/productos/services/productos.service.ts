import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Producto, Productos, ResponseDolar } from '../interfaces/productos.interface';
import { environment } from '../../../environments/environment.development';
import { ErrorResponse } from '../../shared/interfaces/error-response.interface';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private http = inject(HttpClient)

  private _precio = signal<number>(0)
  private products = signal<Producto[]>([])
  elDolarAutomatico = signal<boolean>(true)

  dolarDB = computed(() => this._precio())
  precio = computed(() => this._precio())
  productos = computed(() => this.products())

  traerDolarDB(): Observable<ResponseDolar> {
    return this.http.get<ResponseDolar>(`${environment.backendURL}/dolares`)
      .pipe(
        tap(dolar => this.guardarDolar(dolar)),
        //catchError((error: ErrorResponse) => of(error.error.statusCode))
      )
  }

  traerProductos() : Observable<Productos> {
    return this.http.get<Productos>(`${environment.backendURL}/productos`)
      .pipe(
        tap(({ productos }) => this.products.set(productos)),
        //catchError((error: ErrorResponse) => of(error.error.statusCode))
      )
  }



  editarDolarDB(precio: string = '0', automatico = false): Observable<ResponseDolar> {
    let param;
    if (!automatico) {
      param = {
        automatico: false,
        dolarManual: {
          precio
        }
      }
    } else {
      param = {
        automatico: true,
      }
    }

    return this.http.put<ResponseDolar>(`${environment.backendURL}/dolares`, param)
      .pipe(
        tap(dolar => this.guardarDolar(dolar)),
        //catchError((error: ErrorResponse) => of(error.error.statusCode))
      )
  }

  guardarDolar(dolar: ResponseDolar) {
    this.elDolarAutomatico.set(dolar.automatico)
    this._precio.set(dolar.precio)
  }
}

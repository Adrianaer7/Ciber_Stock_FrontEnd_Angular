import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venta } from '../interfaces/ventas.interface';
import { VENTA_VACIA } from '../constants/ventas.constants';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from 'environments/environment.development';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private http = inject(HttpClient)
  ventas = signal<Venta[]>([])
  ventaSeleccionada = signal<Venta>(VENTA_VACIA)

  crearVenta(venta: Venta): Observable<Venta | string> {
    return this.http.post<{ venta: Venta }>(`${environment.backendURL}/ventas`, venta)
      .pipe(
        tap(res => this.ventas.update(ventas => [...ventas, res.venta])),
        map((res) => res.venta),
        catchError((error: ErrorResponse) => of(error.error.msg))
      );
  }


  traerVentas(): Observable<Venta[] | string> {
    return this.http.get<{ ventas: Venta[] }>(`${environment.backendURL}/ventas`)
      .pipe(
        tap(res => this.ventas.set(res.ventas)),
        map((res) => res.ventas),
        catchError((error: ErrorResponse) => error.error.msg)
      )
  }


  editarVenta(venta: Venta): Observable<Venta | string> {
    return this.http.put<{ venta: Venta }>(`${environment.backendURL}/ventas/${venta._id}`, venta)
      .pipe(
        tap(res => this.ventas.update(ventas => ventas.map(venta => venta._id === res.venta._id ? res.venta : venta))),
        tap(() => this.limpiarSeleccionada()),
        map((res) => res.venta),
        catchError((error: ErrorResponse) => error.error.msg)
      )

  }


  eliminarUnaVenta(id: string): Observable<boolean | string> {
    return this.http.delete<{ msg: string }>(`${environment.backendURL}/ventas/${id}`)
      .pipe(
        tap(() => this.ventas.update(ventas => ventas.filter(venta => venta._id !== id))),
        map(() => true),
        catchError((error: ErrorResponse) => error.error.msg)
      );
  }


  ventaActual(venta: Venta) {
    this.ventaSeleccionada.set(venta);
  }


  async limpiarSeleccionada() {
    this.ventaSeleccionada.set(VENTA_VACIA);
  }

}

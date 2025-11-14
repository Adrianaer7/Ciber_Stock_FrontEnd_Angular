import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Venta } from '../interfaces/ventas.interface';
import { map, Observable, tap } from 'rxjs';
import { environment } from 'environments/environment.development';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private readonly http = inject(HttpClient)
  ventas = signal<Venta[]>([])

  crearVenta(venta: Venta): Observable<Venta | string> {
    return this.http.post<{ venta: Venta }>(`${environment.backendURL}/ventas`, venta)
      .pipe(
        tap(res => this.ventas.update(ventas => [...ventas, res.venta])),
        map(res => res.venta),
        manejarHttpError()
      );
  }


  traerVentas(): Observable<Venta[] | string> {
    return this.http.get<{ ventas: Venta[] }>(`${environment.backendURL}/ventas`)
      .pipe(
        tap(res => this.ventas.set(res.ventas)),
        map(res => res.ventas),
        manejarHttpError()
      )
  }


  editarVenta(id: string, cantidad: number): Observable<Venta | string> {
    return this.http.put<{ venta: Venta }>(`${environment.backendURL}/ventas/${id}`, {cantidad})
      .pipe(
        tap(res => this.ventas.update(ventas => ventas.map(venta => venta._id === res.venta._id ? res.venta : venta))),
        map(res => res.venta),
        manejarHttpError()
      )
  }


  eliminarUnaVenta(id: string): Observable<boolean | string> {
    return this.http.delete<{ msg: string }>(`${environment.backendURL}/ventas/${id}`)
      .pipe(
        tap(() => this.ventas.update(ventas => ventas.filter(venta => venta._id !== id))),
        map(() => true),
        manejarHttpError()
      );
  }
}

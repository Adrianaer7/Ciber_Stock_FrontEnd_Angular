import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { Proveedor } from '../interfaces/proveedores.interface';
import { environment } from '../../../environments/environment.development';
import { ErrorResponse } from '../../shared/interfaces/error-response.interface';
import { PROVEEDOR_VACIO } from '../constants/proveedor.constants';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  private http = inject(HttpClient);

  proveedores = signal<Proveedor[]>([]);
  proveedoresFiltrados = signal<Proveedor[]>([])
  proveedorSeleccionado = signal<Proveedor>(PROVEEDOR_VACIO);

  crearProveedor(proveedor: Proveedor): Observable<Proveedor | string> {
    return this.http.post<{ proveedor: Proveedor }>(`${environment.backendURL}/proveedores`, proveedor)
      .pipe(
        tap(res => this.proveedores.update(proveedores => [...proveedores, res.proveedor])),
        map((res) => res.proveedor),
        catchError((error: ErrorResponse) => of(error.error.msg))
      );
  }


  traerProveedores(): Observable<Proveedor[] | string> {
    return this.http.get<{ proveedores: Proveedor[] }>(`${environment.backendURL}/proveedores`)
      .pipe(
        tap(res => this.proveedores.set(res.proveedores)),
        map((res) => res.proveedores),
        catchError((error: ErrorResponse) => error.error.msg)
      )
  }


  proveedorActual(proveedor: Proveedor) {
    this.proveedorSeleccionado.set(proveedor);
  }


  editarProveedor(proveedor: Proveedor): Observable<Proveedor | string> {
    return this.http.put<{ proveedor: Proveedor }>(`${environment.backendURL}/proveedores/${proveedor._id}`, proveedor)
      .pipe(
        tap(res => this.proveedores.update(proveedores => proveedores.map(proveedor => proveedor._id === res.proveedor._id ? res.proveedor : proveedor))),
        map((res) => res.proveedor),
        catchError((error: ErrorResponse) => error.error.msg)
      )

  }


  async limpiarSeleccionado() {
    this.proveedorSeleccionado.set(PROVEEDOR_VACIO);
  }



  eliminarUnProveedor(id: string): Observable<boolean | string> {
    return this.http.delete<{ msg: string }>(`${environment.backendURL}/proveedores/${id}`)
      .pipe(
        tap(() => this.proveedores.update(proveedores => proveedores.filter(proveedor => proveedor._id !== id))),
        map(() => true),
        catchError((error: ErrorResponse) => error.error.msg)
      );
  }
}

import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { Proveedor } from '../interfaces/proveedores.interface';
import { environment } from '../../../environments/environment.development';
import { PROVEEDOR_VACIO } from '../constants/proveedor.constants';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class ProveedoresService {

  private readonly http = inject(HttpClient);

  proveedores = signal<Proveedor[]>([]);
  proveedoresFiltrados = signal<Proveedor[]>([])
  proveedorSeleccionado = signal<Proveedor>(PROVEEDOR_VACIO);

  crearProveedor(proveedor: Proveedor): Observable<Proveedor | string> {
    return this.http.post<{ proveedor: Proveedor }>(`${environment.backendURL}/proveedores`, proveedor)
      .pipe(
        tap(res => this.proveedores.update(proveedores => [...proveedores, res.proveedor])),
        map(res => res.proveedor),
        manejarHttpError()
      );
  }


  traerProveedores(): Observable<Proveedor[] | string> {
    return this.http.get<{ proveedores: Proveedor[] }>(`${environment.backendURL}/proveedores`)
      .pipe(
        tap(res => this.proveedores.set(res.proveedores)),
        map(res => res.proveedores),
        manejarHttpError()
      )
  }


  editarProveedor(proveedor: Proveedor): Observable<Proveedor | string> {
    return this.http.put<{ proveedor: Proveedor }>(`${environment.backendURL}/proveedores/${proveedor._id}`, proveedor)
      .pipe(
        tap(res => this.proveedores.update(proveedores => proveedores.map(proveedor => proveedor._id === res.proveedor._id ? res.proveedor : proveedor))),
        tap(() => this.limpiarSeleccionado()),
        map(res => res.proveedor),
        manejarHttpError()
      )

  }


  eliminarUnProveedor(id: string): Observable<boolean | string> {
    return this.http.delete<{ msg: string }>(`${environment.backendURL}/proveedores/${id}`)
      .pipe(
        tap(() => this.proveedores.update(proveedores => proveedores.filter(proveedor => proveedor._id !== id))),
        map(() => true),
        manejarHttpError()
      );
  }


  proveedorActual(proveedor: Proveedor) {
    this.proveedorSeleccionado.set(proveedor);
  }


  async limpiarSeleccionado() {
    this.proveedorSeleccionado.set(PROVEEDOR_VACIO);
  }
}

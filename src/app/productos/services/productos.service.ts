import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';
import { Producto, ResponseImagen } from '../interfaces/productos.interface';
import { environment } from '../../../environments/environment.development';
import { ComprasService } from 'app/compras/services/compras.service';
import { GarantiasService } from './garantias.service';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {

  private readonly http = inject(HttpClient)
  comprasService = inject(ComprasService)
  garantiasService = inject(GarantiasService)
  productos = signal<Producto[]>([])
  codigos = signal<number[]>([]);


  agregarProducto(producto: Producto, cantidad: number, formData: FormData): Observable<Producto | string> {
    //subo la imagen
    const subirImagen = Array.from(formData.entries()).length // convierto el formData en un array y verifico si tiene propiedades
      ? this.subirImagen(formData).pipe(tap((fileName) => producto.imagen = fileName))
      : of('');
    //luego de subir la imagen
    return subirImagen.pipe(
      //creo el producto
      switchMap(() => this.http.post<{ producto: Producto }>(`${environment.backendURL}/productos`, producto)),
      //luego creo la compra y/o garantia si corresponde
      switchMap(res => {
        const nuevoProducto = res.producto;
        this.productos.update(productos => [...productos, nuevoProducto]);

        const acciones: Observable<any>[] = [];

        if (cantidad > 0) {
          acciones.push(this.comprasService.crearCompra(nuevoProducto, cantidad));
        }

        if (cantidad > 0 && nuevoProducto.proveedor && nuevoProducto.garantia) {
          acciones.push(this.garantiasService.crearGarantia(nuevoProducto.codigo, nuevoProducto.garantia, nuevoProducto.proveedor));
        }

        return acciones.length  //si tengo que crear una compra o garantia
          ? forkJoin(acciones).pipe(map(() => nuevoProducto)) //ejecuto las dos acciones y retorno el nuevo producto
          : of(nuevoProducto);
      }),
      manejarHttpError() //si hay algun error en la imagen, producto, compra o garantia no ejecuta lo demas
    );
  }



  editarProducto(producto: Producto, cantidad: number = 0, formData?: FormData): Observable<Producto> {
    //subo la imagen
    const subirImagen = formData && Array.from(formData.entries()).length // convierto el formData en un array y verifico si tiene propiedades
      ? this.subirImagen(formData).pipe(tap((fileName) => producto.imagen = fileName))
      : of('');
    //luego de subir la imagen
    return subirImagen.pipe(
      //actualizo el producto
      switchMap(() => this.http.put<{ producto: Producto }>(`${environment.backendURL}/productos/${producto._id}`, { producto })),
      //luego actualizo la compra y/o garantia si corresponde
      switchMap(res => {
        const productoEditado = res.producto;
        this.productos.update(productos => productos.map(producto => producto._id == res.producto._id ? productoEditado : producto))

        const acciones: Observable<any>[] = [];

        if (cantidad > 0) {  //si cantidad es mayor a 0 entonces compré
          acciones.push(this.comprasService.crearCompra(productoEditado, cantidad));
        }

        if (cantidad > 0 && productoEditado.proveedor && productoEditado.garantia) { //si cantidad es mayor a 0 entonces compré
          acciones.push(this.garantiasService.crearGarantia(productoEditado.codigo, productoEditado.garantia, productoEditado.proveedor));
        }
        //si tengo que crear una compra o garantia
        return acciones.length
          ? forkJoin(acciones).pipe(map(() => productoEditado))
          : of(productoEditado);
      }),
      manejarHttpError() //si hay algun error en la imagen, producto, compra o garantia no ejecuta lo demas
    );
  }



  traerProductos(): Observable<Producto[] | string> {
    return this.http.get<{ productos: Producto[] }>(`${environment.backendURL}/productos`)
      .pipe(
        tap(res => this.productos.set(res.productos)),
        map(res => res.productos),
        manejarHttpError()
      )
  }



  traerProducto(id: string): Observable<Producto | string> {
    return this.http.get<{ producto: Producto }>(`${environment.backendURL}/productos/${id}`)
      .pipe(
        map(res => res.producto),
        manejarHttpError()
      )
  }



  eliminarProducto(id: string): Observable<string | boolean> {
    return this.http.delete<{ msg: string }>(`${environment.backendURL}/productos/${id}`)
      .pipe(
        tap(() => this.productos.update(productos => productos.filter(producto => producto._id !== id))),
        map(() => true),
        manejarHttpError()
      )
  }



  traerCodigos(): Observable<number[] | string> {
    return this.http.get<{ codigosDisponibles: number[] }>(`${environment.backendURL}/codigos`)
      .pipe(
        tap(res => this.codigos.set(res.codigosDisponibles)),
        map(res => res.codigosDisponibles),
        manejarHttpError()
      )
  }



  subirImagen(formData: FormData): Observable<string> {
    return this.http.post<ResponseImagen>(`${environment.backendURL}/imagenes`, formData)
      .pipe(
        map((res: ResponseImagen) => res.fileName),
        manejarHttpError()
      )
  }
}

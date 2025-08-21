import { Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { ToastError } from '@constantes/general.constants';
import { PRODUCTO_VACIO } from 'app/productos/constants/productos.constants';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { ProductosService } from 'app/productos/services/productos.service';
import { FormularioComponent } from "app/productos/shared/formulario/formulario.component";

@Component({
  selector: 'editar-producto',
  imports: [FormularioComponent],
  templateUrl: './editar-producto.component.html',
})
export class EditarProductoComponent {

  productosService = inject(ProductosService)
  activatedRoute = inject(ActivatedRoute)

  url = this.activatedRoute.snapshot.params['id'];
  producto =  signal<Producto>(PRODUCTO_VACIO)

  productoResource = rxResource({
    stream: () => this.productosService.traerProducto(this.url)
  })

  productoEffect = effect(() => {
    if (this.productoResource.hasValue()) {
      const respuesta = this.productoResource.value();
      if (typeof respuesta === 'string') return ToastError(respuesta)
      this.producto.set(respuesta)
    }
  })

}

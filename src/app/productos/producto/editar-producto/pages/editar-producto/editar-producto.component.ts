import { Component, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ActivatedRoute } from '@angular/router';
import { ToastError } from '@constantes/general.constants';
import { PRODUCTO_VACIO } from 'app/productos/constants/productos.constants';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { FormularioComponent } from "app/productos/shared/formulario/formulario.component";
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';

@Component({
  selector: 'editar-producto',
  imports: [FormularioComponent],
  templateUrl: './editar-producto.component.html',
})
export class EditarProductoComponent {

  activatedRoute = inject(ActivatedRoute)

  url = this.activatedRoute.snapshot.params['id'];
  producto = signal<Producto>(PRODUCTO_VACIO)

  productoResource = httpResource<{ producto: Producto }>(
    () => `${environment.backendURL}/productos/${this.url}`,
  );

  productoEffect = effect(() => {
    if (this.productoResource.hasValue()) {
      this.producto.set(this.productoResource.value()!.producto);
    }
    const error = this.productoResource.error();
    if (error) {
      ToastError(getHttpResourceErrorMessage(error));
    }
  });
}

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { PRODUCTO_VACIO } from 'app/productos/constants/productos.constants';
import { Garantia, Producto } from 'app/productos/interfaces/productos.interface';
import { GarantiasService } from 'app/productos/services/garantias.service';
import { ProductosService } from 'app/productos/services/productos.service';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { firstValueFrom } from 'rxjs';
import { FormatImportPipe } from 'app/shared/pipes/formatImport.pipe';
import { FormatDatePipe } from 'app/shared/pipes/formatDate.pipe';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';

@Component({
  selector: 'ver-producto',
  imports: [CommonModule, FormatImportPipe, FormatDatePipe],
  templateUrl: './ver-producto.component.html',
})
export class VerProductoComponent {

  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  productosService = inject(ProductosService);
  garantiasService = inject(GarantiasService);
  proveedoresService = inject(ProveedoresService);
  producto = signal<Producto>(PRODUCTO_VACIO)
  url = this.activatedRoute.snapshot.params['id'];
  imagenModal = signal<string | null>(null);  //al hacer click en la imagen, se abre el modal con la imagen ampliada

  proveedores = this.proveedoresService.proveedores
  garantias = this.garantiasService.garantias


  urlImagen = computed(() => `${environment.backendURL}/static/productos/${this.producto().imagen}`)
  proveedoresIguales = computed(() => this.proveedores().filter(proveedor => this.producto().todos_proveedores.includes(proveedor._id!)))

  productoResource = httpResource<{ producto: Producto }>(
    () => `${environment.backendURL}/productos/${this.url}`,
  );
  garantiasResource = httpResource<{ garantias: Garantia[] }>(
    () => `${environment.backendURL}/garantias`,
  );
  proveedoresResource = httpResource<{ proveedores: Proveedor[] }>(
    () => `${environment.backendURL}/proveedores`,
  );

  productoLoadEffect = effect(() => {
    if (this.productoResource.hasValue()) {
      this.producto.set(this.productoResource.value()!.producto);
    }
    if (this.garantiasResource.hasValue()) {
      this.garantiasService.garantias.set(this.garantiasResource.value()!.garantias);
    }
    if (this.proveedoresResource.hasValue()) {
      this.proveedoresService.proveedores.set(this.proveedoresResource.value()!.proveedores);
    }
    for (const resource of [
      this.productoResource,
      this.garantiasResource,
      this.proveedoresResource,
    ]) {
      const error = resource.error();
      if (error) {
        ToastError(getHttpResourceErrorMessage(error));
      }
    }
  });

  todasGarantias = computed(() => {
    const garantias = this.garantias();
    const proveedores = this.proveedores();
    const productos = this.producto();

    if (!garantias || !proveedores || !productos) return [];

    const garantiaProducto = garantias.find(garantia => garantia.idProducto === productos._id); //garantia que coincide con el id de este producto
    if (!garantiaProducto) return [];

    return garantiaProducto.detalles.flatMap(detalle => //recorro el array de detalles
      proveedores.filter(prov => detalle.proveedor.includes(prov._id!)) //obtengo un nuevo array de proveedores que coinciden con los que hay en los detalles
        .map(prov => (  //recorro el array de proveedores recien creado y genero un nuevo array que contenga el nombre del proveedor y la garantia (que saco del detalle que estoy recorriendo)
          {
            proveedor: prov.empresa,
            garantia: detalle.caducidad
          }))
    );
  });



  async eliminarElProducto() {
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    try {
      await firstValueFrom(this.productosService.eliminarProducto(this.producto()._id!))
      ToastExito(ELIMINAR_EXITO)
    } catch (error) {
      ToastError(error as string)
      return
    }

    this.router.navigate(['/productos']);
  }

}

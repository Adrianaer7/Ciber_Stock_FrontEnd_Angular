import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { PRODUCTO_VACIO } from 'app/productos/constants/productos.constants';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { GarantiasService } from 'app/productos/services/garantias.service';
import { ProductosService } from 'app/productos/services/productos.service';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { forkJoin } from 'rxjs';
import { FormatImportPipe } from 'app/shared/pipes/formatImport.pipe';
import { FormatDatePipe } from 'app/shared/pipes/formatDate.pipe';

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

  proveedores = this.proveedoresService.proveedores
  garantias = this.garantiasService.garantias


  proveedoresIguales = computed(() => this.proveedores().filter(proveedor => this.producto().todos_proveedores.includes(proveedor._id!)))

  productoResource = rxResource({
    stream: () => forkJoin({
      producto: this.productosService.traerProducto(this.url),
      garantias: this.garantiasService.traerGarantias(),
      proveedores: this.proveedoresService.traerProveedores()
    })
  });

  productoEffect = effect(() => {
    if (this.productoResource.hasValue()) {
      const respuesta = this.productoResource.value();
      if (typeof respuesta.producto === 'string') return ToastError(respuesta.producto);
      if (typeof respuesta.garantias === 'string') return ToastError(respuesta.garantias);
      if (typeof respuesta.proveedores === 'string') return ToastError(respuesta.proveedores);
      this.producto.set(respuesta.producto);
    }
  })

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

    this.productosService.eliminarProducto(this.producto()._id!).subscribe(res => {
      typeof res === 'string'
        ? ToastError(res)
        : ToastExito(ELIMINAR_EXITO);
    });

    this.router.navigate(['/productos']);
  }

}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { form, FormField, required } from '@angular/forms/signals';
import { ProductosService } from '../../../services/productos.service';
import { Router } from '@angular/router';
import { Garantia, Producto, ResponseDolar } from '../../../interfaces/productos.interface';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '../../../../auth/services/auth.service';
import { ProductoComponent } from "../../components/producto/producto.component";
import { DolaresService } from 'app/productos/services/dolares.service';
import { GarantiasService } from 'app/productos/services/garantias.service';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { ToastError } from '@constantes/general.constants';
import { limpiarBusqueda } from 'app/shared/utils/general.utils';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';

type propiedades = 'codigo' | 'nombre' | 'marca' | 'modelo' | 'disponibles' | 'precio_venta_tarjeta';

@Component({
  selector: 'listado-productos',
  imports: [FormField, ProductoComponent],
  templateUrl: './listado-productos.component.html',
})
export class ListadoProductosComponent {

  router = inject(Router);
  productosService = inject(ProductosService)
  dolaresService = inject(DolaresService)
  garantiasService = inject(GarantiasService)
  proveedoresService = inject(ProveedoresService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  conStock = signal<boolean>(false)
  oculto = signal<boolean>(false)
  mostrarFormDolar = signal<boolean>(false);
  ordenAscendente = signal<boolean>(true);

  productos = this.productosService.productos
  proveedores = this.proveedoresService.proveedores
  dolarDB = this.dolaresService.precio
  garantias = this.garantiasService.garantias
  dolarAutomatico = this.dolaresService.elDolarAutomatico


  productosResource = httpResource<{ productos: Producto[] }>(
    () => `${environment.backendURL}/productos`,
  );
  dolarResource = httpResource<ResponseDolar>(
    () => `${environment.backendURL}/dolares`,
  );
  proveedoresResource = httpResource<{ proveedores: Proveedor[] }>(
    () => `${environment.backendURL}/proveedores`,
  );
  garantiasResource = httpResource<{ garantias: Garantia[] }>(
    () => `${environment.backendURL}/garantias`,
  );

  listadoLoadEffect = effect(() => {
    if (this.productosResource.hasValue()) {
      this.productosService.productos.set(this.productosResource.value()!.productos);
    }
    if (this.dolarResource.hasValue()) {
      this.dolaresService.guardarDolar(this.dolarResource.value()!);
    }
    if (this.proveedoresResource.hasValue()) {
      this.proveedoresService.proveedores.set(this.proveedoresResource.value()!.proveedores);
    }
    if (this.garantiasResource.hasValue()) {
      this.garantiasService.garantias.set(this.garantiasResource.value()!.garantias);
    }
    for (const resource of [
      this.productosResource,
      this.dolarResource,
      this.proveedoresResource,
      this.garantiasResource,
    ]) {
      const error = resource.error();
      if (error) {
        ToastError(getHttpResourceErrorMessage(error));
      }
    }
  });

  //cuando cambie filtrando()
  filtroProducto = computed(() => {
    const palabras = this.filtrando();
    const stock = this.conStock();
    const oculto = this.oculto();

    if (!palabras && !stock && !oculto) return [];

    const incluyeTodas = (descripcion: string, palabras: string): boolean => {
      if (!palabras) return true;
      return palabras.split(' ').every(p => descripcion.includes(p));
    };

    return this.productos().filter(producto => {
      const { descripcion, disponibles, visibilidad } = producto;

      if (!incluyeTodas(descripcion, palabras)) return false 
      const cumpleStock = stock ? disponibles > 0 : true  //siempre va a devolver true a menos que stock sea true y disponibles sea 0
      const cumpleVisibilidad = oculto ? !visibilidad : visibilidad
      
      return cumpleStock && cumpleVisibilidad
    });
  });



  filtro = computed(() => !!(this.filtrando() || this.conStock() || this.oculto()));
  filtradosOrdenados = signal<Producto[]>([]);
  filtrados = computed(() => {
    const ordenados = this.filtradosOrdenados();
    return ordenados.length ? ordenados : this.filtroProducto();
  });

  dolarModel = signal({ precio: '' });
  dolarForm = form(this.dolarModel, (schema) => {
    required(schema.precio, { message: 'El campo precio es requerido' });
  });

  busqueda(value: string) {
    this.filtrando.set(limpiarBusqueda(value));
    this.filtradosOrdenados.set([]);
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.filtrando.set('');
      this.filtradosOrdenados.set([]);
    }
  }

  setConStock() {
    this.conStock.set(!this.conStock());
    this.filtradosOrdenados.set([]);
  }

  setOculto() {
    this.oculto.set(!this.oculto());
    this.filtradosOrdenados.set([]);
  }

  async setDolarAutomatico() {
    try {
      await firstValueFrom(this.dolaresService.editarDolarDB("", true))
      this.dolarModel.set({ precio: '' })
      this.mostrarFormDolar.set(false);
    } catch (error) {
      ToastError(error as string)
    }
  }

  //dolar manual
  async onSubmitDolar() {
    const precio = this.dolarModel().precio
    if (!precio.trim()) return
    try {
      await firstValueFrom(this.dolaresService.editarDolarDB(precio, false))
      this.dolarModel.set({ precio: '' })
      this.mostrarFormDolar.set(false)
    } catch (error) {
      ToastError(error as string)
    }
  }

  ordenarPor(campo: propiedades) {
    let resultado: Producto[] = [];
    const comparar = (a: Producto, b: Producto) => {
      const valorA = (a[campo] || '');  //obtengo el valor del campo
      const valorB = (b[campo] || '');
      if (valorA > valorB) return 1;  //valorA tiene que ir despues de valorB
      if (valorA < valorB) return -1; //valorA tiene que ir antes de valorB
      return 0; //si valorA y valorB son iguales, dejo como están
    };

    if (this.filtro()) {
      resultado = [...this.filtrados()].sort((a: Producto, b: Producto) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
      );
      this.filtradosOrdenados.set(resultado);
    } else {
      resultado = [...this.productos()].sort((a: Producto, b: Producto) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
      );
      this.productos.set(resultado);
    }
    this.ordenAscendente.set(!this.ordenAscendente());
  }

}

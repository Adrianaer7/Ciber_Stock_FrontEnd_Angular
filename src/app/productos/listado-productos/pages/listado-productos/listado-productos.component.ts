import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Producto } from '../../../interfaces/productos.interface';
import { firstValueFrom, forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { ProductoComponent } from "../../components/producto/producto.component";
import { DolaresService } from 'app/productos/services/dolares.service';
import { GarantiasService } from 'app/productos/services/garantias.service';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { ToastError } from '@constantes/general.constants';
import { limpiarBusqueda } from 'app/shared/utils/general.utils';

type propiedades = 'codigo' | 'nombre' | 'marca' | 'modelo' | 'disponibles' | 'precio_venta_tarjeta';

@Component({
  selector: 'listado-productos',
  imports: [ReactiveFormsModule, CommonModule, ProductoComponent],
  templateUrl: './listado-productos.component.html',
})
export class ListadoProductosComponent {

  fb = inject(FormBuilder)
  router = inject(Router);
  productosService = inject(ProductosService)
  dolaresService = inject(DolaresService)
  garantiasService = inject(GarantiasService)
  proveedoresService = inject(ProveedoresService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  filtro = signal<boolean>(false);
  conStock = signal<boolean>(false)
  oculto = signal<boolean>(false)
  mostrarFormDolar = signal<boolean>(false);
  filtrados = signal<Producto[]>([]);
  ordenAscendente = signal<boolean>(true);

  productos = this.productosService.productos
  proveedores = this.proveedoresService.proveedores
  dolarDB = this.dolaresService.precio
  garantias = this.garantiasService.garantias
  dolarAutomatico = this.dolaresService.elDolarAutomatico


  listadoProductosResource = rxResource({
    stream: () => forkJoin({
      productos: this.productosService.traerProductos(),
      dolar: this.dolaresService.traerDolarDB(),
      proveedores: this.proveedoresService.traerProveedores(),
      garantias: this.garantiasService.traerGarantias()
    })
  });

  listadoEffect = effect(() => {
    if (this.listadoProductosResource.hasValue()) {
      const respuesta = this.listadoProductosResource.value();
      if (typeof respuesta.productos === 'string') return ToastError(respuesta.productos)
      if (typeof respuesta.dolar === 'string') return ToastError(respuesta.dolar)
      if (typeof respuesta.proveedores === 'string') return ToastError(respuesta.proveedores)
      if (typeof respuesta.garantias === 'string') return ToastError(respuesta.garantias)
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



  // cuando cambie el computed() filtroProducto
  filtradosEffect = effect(() => {
    if (this.filtrando() || this.conStock() || this.oculto()) {
      this.filtro.set(true);
    } else {
      this.filtro.set(false);
    }
    this.filtrados.set(this.filtroProducto());
  });


  formDolar = this.fb.group({
    precio: ['', Validators.required]
  })

  //cambio filtrando
  busqueda(value: string) {
    this.filtrando.set(limpiarBusqueda(value));  //limpio el input y guardo el filtro
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.filtrando.set('')
    }
  }

  setConStock() {
    this.conStock.set(!this.conStock())
  }

  setOculto() {
    this.oculto.set(!this.oculto())
  }

  async setDolarAutomatico() {
    try {
      await firstValueFrom(this.dolaresService.editarDolarDB("", true))
      this.formDolar.reset()
      this.mostrarFormDolar.set(false);
    } catch (error) {
      ToastError(error as string)
    }
  }

  //dolar manual
  async onSubmitDolar() {
    const precio = this.formDolar.value.precio
    if (typeof precio !== 'string' || !precio.trim()) return
    try {
      await firstValueFrom(this.dolaresService.editarDolarDB(precio, false))
      this.formDolar.reset()
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

    if (this.filtrados().length) {
      resultado = [...this.filtrados()].sort((a: Producto, b: Producto) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)  //seria como this.ordenAscendente() ? 1 : -1
      );
      this.filtrados.set(resultado);
    } else {
      resultado = [...this.productos()].sort((a: Producto, b: Producto) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
      );
      this.productos.set(resultado);
    }
    this.ordenAscendente.set(!this.ordenAscendente());
  }

}

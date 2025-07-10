import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Producto } from '../../../interfaces/productos.interface';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { ProductoComponent } from "../../components/producto/producto.component";
import { DolaresService } from 'app/productos/services/dolares.service';
import { GarantiasService } from 'app/productos/services/garantias.service';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { ToastError } from '@constantes/general.constants';

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
  conStock = signal<boolean>(false)
  oculto = signal<boolean>(false)
  mostrarFormDolar = signal<boolean>(false);
  filtrados = signal<Producto[]>([]);

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


  formDolar = this.fb.group({
    precio: ['', Validators.required]
  })

  busqueda(valor: string) {
    this.filtrando.set(valor)
  }

  limpiarFiltro() {
    this.filtrando.set('')
  }

  setConStock() {
    this.conStock.set(!this.conStock())
  }

  setOculto() {
    this.oculto.set(!this.oculto())
  }

  setDolarAutomatico() {
    this.dolaresService.editarDolarDB("", true).subscribe(() => {
      this.formDolar.reset()
      this.mostrarFormDolar.set(false);
    })
  }


  onSubmitDolar() {
    const precio = this.formDolar.value.precio
    if (typeof precio !== 'string' || !precio.trim()) return
    this.dolaresService.editarDolarDB(precio, false).subscribe(() => {
      this.formDolar.reset()
      this.mostrarFormDolar.set(false)
    })
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.limpiarFiltro()
    }
  }

}

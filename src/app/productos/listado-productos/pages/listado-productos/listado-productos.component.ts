import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductosService } from '../../../services/productos.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { Producto, Productos } from '../../../interfaces/productos.interface';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { ProductoComponent } from "../../components/producto/producto.component";

@Component({
  selector: 'app-listado-productos',
  imports: [ReactiveFormsModule, CommonModule, ProductoComponent],
  templateUrl: './listado-productos.component.html',
})
export class ListadoProductosComponent {
  fb = inject(FormBuilder)
  router = inject(Router);
  productosService = inject(ProductosService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  conStock = signal<boolean>(false)
  oculto = signal<boolean>(false)
  dolarAutomatico = signal<boolean>(true);
  productos = signal<Producto[]>([]);
  mostrarFormDolar = signal<boolean>(false);
  filtrados = signal<Producto[]>([]);
  
  dolarDB = computed(() => this.productosService.precio() )
  token = computed(() => this.authService.token())

  listadoProductosResource = rxResource({
    stream: () => forkJoin({
      productos: this.productosService.traerProductos(),
      dolar: this.productosService.traerDolarDB()
    })
  });

  listadoEffect = effect(() => {
    if (this.listadoProductosResource.hasValue()) {
      const { productos, dolar } = this.listadoProductosResource.value();
      this.productos.set(productos.productos);
      this.dolarAutomatico.set(dolar.automatico);
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
  this.productosService.editarDolarDB("", true ).subscribe(() => {
    this.formDolar.reset()
    this.mostrarFormDolar.set(false);
    this.dolarAutomatico.set(true);
  })
}

eliminarDolarManual() { }

onSubmitDolar() {
  const precio = this.formDolar.value.precio
  if( typeof precio !== 'string' || !precio.trim()) return
  this.productosService.editarDolarDB(precio, false ).subscribe((dolar) => {
    this.formDolar.reset()
    this.mostrarFormDolar.set(false)
    this.dolarAutomatico.set(false);
  })
    
}

  manejarFiltro() {
    if (this.filtrando()) {
      this.limpiarFiltro()
    }
  }

}

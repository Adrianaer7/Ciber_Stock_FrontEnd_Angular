import { Component, input, signal } from '@angular/core';
import { Garantia, Producto } from '../../../interfaces/productos.interface';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'producto',
  imports: [CommonModule, RouterLink],
  templateUrl: './producto.component.html',
})
export class ProductoComponent {

  producto = input.required<Producto>()
  colorFaltante = signal<boolean>(false);
  todasGarantias = signal<Garantia[]>([])


  copiarPrecioTarjeta() {}
  copiarPrecioEfectivo() {}
  copiarPrecioConocidos() {}
  copiarAhoraDoce() {}
  venderElProducto() {}
  cambiarFaltante() {}




  mostrarElModal() {}
}

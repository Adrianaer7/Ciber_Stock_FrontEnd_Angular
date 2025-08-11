import { Component, computed, input, signal } from '@angular/core';
import { Compra } from 'app/compras/interfaces/compras.interfaces';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { CommonModule } from '@angular/common';
import { FormatImportPipe } from 'app/shared/pipes/formatImport.pipe';
import { FormatDatePipe } from 'app/shared/pipes/formatDate.pipe';

@Component({
  selector: 'compra',
  imports: [CommonModule, FormatImportPipe, FormatDatePipe],
  templateUrl: './compra.component.html',
})
export class CompraComponent { 

  compra = input.required<Compra>()
  proveedores = input.required<Proveedor[]>()

  detalles = signal(false); //para ver detalles o no

  //obtengo el id de cada uno de los proveedores del historial de compra de este producto
  historialProveedores = computed(() =>
    this.compra().historial.map(h => h.proveedor)
  );

  //me quedo con los proveedores que estén en el historial de compra y utilizo nombre y empresa
  proveedoresIguales = computed(() =>
    this.proveedores().filter(p =>this.historialProveedores().includes(p._id!))
  );

  verDetalles() {
    this.detalles.set(!this.detalles());
  }

  mostrar(valor: any): string {
    return valor ? valor : '-';
  }

}

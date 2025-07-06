import { Component, computed, inject, input } from '@angular/core';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { FaltantesService } from 'app/faltantes/services/faltantes.service';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';

@Component({
  selector: 'faltante',
  imports: [],
  templateUrl: './faltante.component.html',
})
export class FaltanteComponent {

  faltantesService = inject(FaltantesService)
  faltante = input.required<Producto>()
  proveedores = input.required<Proveedor[]>()


  verFaltante() {

  }

  proveedoresIguales = computed(() => this.proveedores().filter(proveedor => this.faltante().todos_proveedores.includes(proveedor._id!)))

  async eliminarFaltante() {
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    this.faltantesService.eliminarUnFaltante(this.faltante()._id!).subscribe(res => { //si confirma
      typeof res === 'string'
        ? ToastError(res)
        : ToastExito(ELIMINAR_EXITO);
    });
  }

}

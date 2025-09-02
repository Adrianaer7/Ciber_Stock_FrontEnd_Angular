import { Component, computed, inject, input } from '@angular/core';
import { Router } from '@angular/router';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { FaltantesService } from 'app/faltantes/services/faltantes.service';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'faltante',
  imports: [],
  templateUrl: './faltante.component.html',
})
export class FaltanteComponent {

  faltantesService = inject(FaltantesService)
  faltante = input.required<Producto>()
  proveedores = input.required<Proveedor[]>()
  router = inject(Router);

  proveedoresIguales = computed(() => this.proveedores().filter(proveedor => this.faltante().todos_proveedores.includes(proveedor._id!)))

  verFaltante() {
    this.router.navigate([`/producto/${this.faltante()._id}`]);
  }


  async eliminarFaltante() {
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    try {
      await firstValueFrom(this.faltantesService.editarFaltante(this.faltante()._id))
      ToastExito(ELIMINAR_EXITO)
    } catch (error) {
      ToastError(error as string)
    }
  }

}

import { Component, inject, input } from '@angular/core';
import { Proveedor } from '../../../interfaces/proveedores.interface';
import { ProveedoresService } from '../../../services/proveedores.service';
import { CommonModule } from '@angular/common';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'proveedor',
  imports: [CommonModule],
  templateUrl: './proveedor.component.html'
})

export class ProveedorComponent {

  proveedorService = inject(ProveedoresService)
  proveedor = input.required<Proveedor>()
  crearNuevo = input<boolean>(false);


  editarProveedor() {
    this.proveedorService.proveedorActual(this.proveedor())
  }

  async eliminarProveedor() {
    await this.proveedorService.limpiarSeleccionado() //por si hay alguno seleccionado
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    try {
      await firstValueFrom(this.proveedorService.eliminarUnProveedor(this.proveedor()._id!))
      ToastExito(ELIMINAR_EXITO)
    } catch (error) {
      ToastError(error as string)
    }
  }
}

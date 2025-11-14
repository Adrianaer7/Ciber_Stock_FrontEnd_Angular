import { Component, inject, input } from '@angular/core';
import { ELIMINAR_EXITO, ModalCantidad, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { Venta } from 'app/ventas/interfaces/ventas.interface';
import { VentasService } from 'app/ventas/services/ventas.service';
import { ErrorCantidad, ErrorValor, ToastExitoEditar } from 'app/ventas/constants/ventas.constants';
import { FormatImportPipe } from 'app/shared/pipes/formatImport.pipe';
import { FormatDatePipe } from 'app/shared/pipes/formatDate.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'venta',
  imports: [FormatImportPipe, FormatDatePipe],
  templateUrl: './venta.component.html',
})
export class VentaComponent {
  ventaService = inject(VentasService)
  venta = input.required<Venta>()

  async editarVenta() {
    const valor = await ModalCantidad()
    if (valor.isConfirmed) {
      const cantidad = Number(valor.value[0])
      if (cantidad < 1 || !cantidad || Number.isNaN(cantidad) || !Number.isInteger(cantidad)) {
        await ErrorValor()
        this.editarVenta()
        return
      }
      if (cantidad > this.venta().unidades) {
        await ErrorCantidad()
        this.editarVenta()
        return
      }
      if (this.venta().unidades == cantidad) {
        this.eliminarVenta()
        return
      }
      //llamar al endpoint para editar la venta
      try {
        await firstValueFrom(this.ventaService.editarVenta(this.venta()._id, cantidad))
        ToastExitoEditar(cantidad, this.venta().nombre);
      } catch (error) {
        ToastError(error as string)
      }
    }
  }

  async eliminarVenta() {
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    try {
      await firstValueFrom(this.ventaService.eliminarUnaVenta(this.venta()._id))
      ToastExito(ELIMINAR_EXITO)
    } catch (error) {
      ToastError(error as string)
    }
  }

}

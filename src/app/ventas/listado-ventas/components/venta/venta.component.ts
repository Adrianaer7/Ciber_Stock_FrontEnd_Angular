import { Component, inject, input } from '@angular/core';
import { ELIMINAR_EXITO, ModalCantidad, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { Venta } from 'app/ventas/interfaces/ventas.interface';
import { VentasService } from 'app/ventas/services/ventas.service';
import { generarFecha } from 'app/utils/general.utils';
import { ErrorCantidad, ErrorValor, ToastExitoEditar } from 'app/ventas/constants/ventas.constants';

@Component({
  selector: 'venta',
  imports: [],
  templateUrl: './venta.component.html',
})
export class VentaComponent {

  ventaService = inject(VentasService)
  venta = input.required<Venta>()
  generarFecha = generarFecha //guardo la funcion aca asi puedo usarla en el html

  async editarVenta() {
    const valor = await ModalCantidad()
    if (valor.isConfirmed) {
      const cantidad = Number(valor.value[0])
      if (cantidad < 1 || !cantidad || isNaN(cantidad) || !Number.isInteger(cantidad)) {
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
      this.ventaService.editarVenta(this.venta()._id, cantidad).subscribe(res => {
        typeof res === 'string'
          ? ToastError(res)
          : ToastExitoEditar(cantidad, this.venta().nombre);
      })
    }
  }

  async eliminarVenta() {
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    this.ventaService.eliminarUnaVenta(this.venta()._id!).subscribe(res => { //si confirma
      typeof res === 'string'
        ? ToastError(res)
        : ToastExito(ELIMINAR_EXITO);
    });
  }

}

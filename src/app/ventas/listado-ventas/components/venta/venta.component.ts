import { Component, inject, input } from '@angular/core';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { Venta } from 'app/ventas/interfaces/ventas.interface';
import { VentasService } from 'app/ventas/services/ventas.service';
import { generarFecha } from 'app/utils/general.utils';

@Component({
  selector: 'venta',
  imports: [],
  templateUrl: './venta.component.html',
})
export class VentaComponent {

  ventaService = inject(VentasService)
  venta = input.required<Venta>()
  generarFecha = generarFecha //guardo la funcion aca asi puedo usarla en el html

  editarVenta() {
    this.ventaService.ventaActual(this.venta())
  }

  async eliminarVenta() {
    await this.ventaService.limpiarSeleccionada() //por si hay alguno seleccionado
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    this.ventaService.eliminarUnaVenta(this.venta()._id!).subscribe(res => { //si confirma
      typeof res === 'string'
        ? ToastError(res)
        : ToastExito(ELIMINAR_EXITO);
    });
  }

 }

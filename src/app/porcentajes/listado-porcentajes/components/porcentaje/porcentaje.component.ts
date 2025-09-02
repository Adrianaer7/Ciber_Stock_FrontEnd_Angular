import { Component, inject, input } from '@angular/core';
import { Porcentaje } from 'app/porcentajes/interfaces/porcentajes.intercaces';
import { PorcentajesService } from '../../../services/porcentajes.service';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { FormatPercentPipe } from 'app/shared/pipes/formatPercent.pipe';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'porcentaje',
  imports: [FormatPercentPipe],
  templateUrl: './porcentaje.component.html',
})
export class PorcentajeComponent {

  porcentajeService = inject(PorcentajesService)
  porcentaje = input.required<Porcentaje>()

  editarPorcentaje() {
    this.porcentajeService.porcentajeActual(this.porcentaje())
  }

  async eliminarPorcentaje() { 
    await this.porcentajeService.limpiarSeleccionado() //por si hay alguno seleccionado
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    try {
      await firstValueFrom(this.porcentajeService.eliminarUnPorcentaje(this.porcentaje()._id!))
      ToastExito(ELIMINAR_EXITO)
    } catch (error) {
      ToastError(error as string)
    }
  }
 }

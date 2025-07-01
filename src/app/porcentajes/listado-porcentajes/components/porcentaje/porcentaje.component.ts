import { Component, inject, input } from '@angular/core';
import { Porcentaje } from 'app/porcentajes/interfaces/porcentajes.intercaces';
import { PorcentajesService } from '../../../services/porcentajesService';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';

@Component({
  selector: 'porcentaje',
  imports: [],
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

    this.porcentajeService.eliminarUnPorcentaje(this.porcentaje()._id!).subscribe(res => { //si confirma
      typeof res === 'string'
        ? ToastError(res)
        : ToastExito(ELIMINAR_EXITO);
    });
  }
 }

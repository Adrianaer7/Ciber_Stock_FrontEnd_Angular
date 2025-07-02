import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { ELIMINAR_EXITO, ToastError, ToastExito, Warning } from '@constantes/general.constants';
import { Rubro } from 'app/rubros/interfaces/rubros.intefaces';
import { RubrosService } from 'app/rubros/services/rubros.service';

@Component({
  selector: 'rubro',
  imports: [CommonModule],
  templateUrl: './rubro.component.html',
})
export class RubroComponent {

  rubrosService = inject(RubrosService)
  rubro = input.required<Rubro>()
  crearNuevo = input<boolean>(false);


  editarRubro() {
    this.rubrosService.rubroActual(this.rubro())
  }

  async eliminarRubro() {
    await this.rubrosService.limpiarSeleccionado() //por si hay alguno seleccionado
    const { isConfirmed } = await Warning();  //muestro la la alerta para que confirme
    if (!isConfirmed) return; //si no confirma 

    this.rubrosService.eliminarUnRubro(this.rubro()._id!).subscribe(res => { //si confirma
      typeof res === 'string'
        ? ToastError(res)
        : ToastExito(ELIMINAR_EXITO);
    });
  }
}

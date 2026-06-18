import { Component, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { form, FormField, required, min } from '@angular/forms/signals';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { AlertErrorComision, AlertErrorNombre } from 'app/porcentajes/constants/porcentajes.contants';
import { Porcentaje } from 'app/porcentajes/interfaces/porcentajes.intercaces';
import { PorcentajesService } from 'app/porcentajes/services/porcentajes.service';
import { PorcentajeComponent } from '../../components/porcentaje/porcentaje.component';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';
import { getFirstSignalFormError, touchAllFields } from 'app/shared/utils/signal-forms.utils';

@Component({
  selector: 'listado-porcentajes',
  imports: [PorcentajeComponent, FormField],
  templateUrl: './listado-porcentajes.component.html',
})
export class ListadoPorcentajesComponent {

  porcentajesService = inject(PorcentajesService)
  authService = inject(AuthService)
  mostrarForm = signal<boolean>(false);

  porcentajes = this.porcentajesService.porcentajes;
  porcentajeSeleccionado = this.porcentajesService.porcentajeSeleccionado;
  usuario = this.authService.user

  porcentajeResource = httpResource<{ porcentajes: Porcentaje[] }>(
    () => `${environment.backendURL}/porcentajes`,
  );

  porcentajesLoadEffect = effect(() => {
    if (this.porcentajeResource.hasValue()) {
      this.porcentajesService.porcentajes.set(this.porcentajeResource.value()!.porcentajes);
    }
    const error = this.porcentajeResource.error();
    if (error) {
      ToastError(getHttpResourceErrorMessage(error));
    }
  });

  porcentajeModel = signal({ nombre: '', comision: 1 });
  porcentajeForm = form(this.porcentajeModel, (schema) => {
    required(schema.nombre, { message: 'El campo nombre es requerido' });
    required(schema.comision, { message: 'El campo comision es requerido' });
    min(schema.comision, 1, { message: 'El campo comision debe tener un valor mínimo de 1' });
  });

  porcentajeSeleccionadoEffect = effect(() => {
    const porcentaje: Porcentaje = this.porcentajeSeleccionado();
    if (porcentaje._id) {
      this.mostrarForm.set(true);
      this.porcentajeModel.set({
        nombre: porcentaje.nombre || '',
        comision: porcentaje.comision || 1,
      });
    }
  });


  switchMostrarForm() {
    if (this.mostrarForm()) {
      this.mostrarForm.set(false);
      this.porcentajesService.limpiarSeleccionado()
      this.porcentajeModel.set({ nombre: '', comision: 1 });
    } else {
      this.mostrarForm.set(true)
    }
  }


  async onSubmit() {
    touchAllFields([this.porcentajeForm.nombre, this.porcentajeForm.comision]);

    if (this.porcentajeForm().invalid()) {
      const primerError = getFirstSignalFormError(this.porcentajeForm, [
        { path: this.porcentajeForm.nombre, name: 'nombre' },
        { path: this.porcentajeForm.comision, name: 'comision' },
      ]);
      if (primerError?.includes('nombre')) AlertErrorNombre();
      else AlertErrorComision();
      return;
    }

    if (this.porcentajeSeleccionado()?._id) {
      const porcentajeEditado: Porcentaje = this.estructurarPorcentaje()

      try {
        await firstValueFrom(this.porcentajesService.editarPorcentaje(porcentajeEditado))
        this.porcentajeModel.set({ nombre: '', comision: 1 });
        this.mostrarForm.set(false);
        ToastExito(AGREGAR_EXITO)
      } catch (error) {
        ToastError(error as string)
      }
    }
  }

  estructurarPorcentaje() {
    const { nombre, comision } = this.porcentajeModel();
    return {
      _id: this.porcentajeSeleccionado()?._id || '',
      nombre: nombre.toUpperCase(),
      comision,
      tipo: this.porcentajeSeleccionado().tipo || '',
      creador: this.usuario()?._id || ''
    }
  }
}

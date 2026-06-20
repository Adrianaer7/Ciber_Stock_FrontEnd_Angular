import { Component, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { form, FormField, required, min } from '@angular/forms/signals';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { AlertErrorNombre, AlertErrorRentabilidad } from 'app/rubros/constants/rubros.constants';
import { Rubro } from 'app/rubros/interfaces/rubros.intefaces';
import { RubrosService } from 'app/rubros/services/rubros.service';
import { RubroComponent } from '../../components/rubro/rubro.component';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';
import { getFirstSignalFormError, touchAllFields } from 'app/shared/utils/signal-forms.utils';


@Component({
  selector: 'listado-rubros',
  imports: [RubroComponent, FormField],
  templateUrl: './listado-rubros.component.html',
})
export class ListadoRubrosComponent {

  rubrosService = inject(RubrosService)
  authService = inject(AuthService)
  mostrarForm = signal<boolean>(false);
  crearNuevo = signal<boolean>(false);
  ordenAscendente = signal<boolean>(true);

  rubros = this.rubrosService.rubros;
  rubroSeleccionado = this.rubrosService.rubroSeleccionado;
  usuario = this.authService.user

  rubrosResource = httpResource<{ rubros: Rubro[] }>(
    () => `${environment.backendURL}/rubros`,
  );

  rubrosLoadEffect = effect(() => {
    if (this.rubrosResource.hasValue()) {
      this.rubrosService.rubros.set(this.rubrosResource.value()!.rubros);
    }
    const error = this.rubrosResource.error();
    if (error) {
      ToastError(getHttpResourceErrorMessage(error));
    }
  });

  rubroModel = signal({ nombre: '', rentabilidad: 1 });
  rubroForm = form(this.rubroModel, (schema) => {
    required(schema.nombre, { message: 'El campo nombre es requerido' });
    required(schema.rentabilidad, { message: 'El campo rentabilidad es requerido' });
    min(schema.rentabilidad, 1, { message: 'El campo rentabilidad debe tener un valor mínimo de 1' });
  });

  rubroSeleccionadoEffect = effect(() => {
    const rubro = this.rubroSeleccionado();
    if (rubro._id) {
      this.mostrarForm.set(true);
      this.rubroModel.set({
        nombre: rubro.nombre || '',
        rentabilidad: rubro.rentabilidad || 1,
      });
    }
  });


  switchMostrarForm() {
    if (this.mostrarForm()) {
      this.mostrarForm.set(false);
      this.crearNuevo.set(false);
      this.rubrosService.limpiarSeleccionado()
      this.rubroModel.set({ nombre: '', rentabilidad: 1 });
    } else {
      this.mostrarForm.set(true)
      if (!this.crearNuevo()) {
        this.crearNuevo.set(true);
        this.rubrosService.limpiarSeleccionado()
        this.rubroModel.set({ nombre: '', rentabilidad: 1 });
      }
    }
  }


  async onSubmit() {
    touchAllFields([this.rubroForm.nombre, this.rubroForm.rentabilidad]);

    if (this.rubroForm().invalid()) {
      const primerError = getFirstSignalFormError(this.rubroForm, [
        { path: this.rubroForm.nombre, name: 'nombre' },
        { path: this.rubroForm.rentabilidad, name: 'rentabilidad' },
      ]);
      if (primerError?.includes('nombre')) AlertErrorNombre();
      else AlertErrorRentabilidad();
      return;
    }

    if (this.crearNuevo()) {
      const nuevoRubro = this.estructurarRubro()

      try {
        await firstValueFrom(this.rubrosService.crearRubro(nuevoRubro))
        ToastExito(AGREGAR_EXITO)
        this.rubroModel.set({ nombre: '', rentabilidad: 1 });
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        return
      } catch (error) {
        ToastError(error as string)
        return
      }
    }

    if (this.rubroSeleccionado()?._id) {
      const rubroEditado = this.estructurarRubro()

      try {
        await firstValueFrom(this.rubrosService.editarRubro(this.rubroSeleccionado()!._id, rubroEditado))
        ToastExito(AGREGAR_EXITO)
        this.rubroModel.set({ nombre: '', rentabilidad: 1 });
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
      } catch (error) {
        ToastError(error as string)
      }
    }
  }

  estructurarRubro() {
    const { nombre, rentabilidad } = this.rubroModel();
    return { nombre, rentabilidad }
  }


  ordenarPor() {
    const comparar = (a: Rubro, b: Rubro) => {
      const valorA = (a.rentabilidad || '');
      const valorB = (b.rentabilidad || '');
      if (valorA > valorB) return 1;
      if (valorA < valorB) return -1;
      return 0;
    };

    const resultado = [...this.rubros()].sort((a: Rubro, b: Rubro) =>
      this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
    );
    this.rubros.set(resultado);
    this.ordenAscendente.set(!this.ordenAscendente());
  }
}

import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { AlertErrorNombre, AlertErrorRentabilidad } from 'app/rubros/constants/rubros.constants';
import { Rubro } from 'app/rubros/interfaces/rubros.intefaces';
import { RubrosService } from 'app/rubros/services/rubros.service';
import { RubroComponent } from '../../components/rubro/rubro.component';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'listado-rubros',
  imports: [RubroComponent, ReactiveFormsModule],
  templateUrl: './listado-rubros.component.html',
})
export class ListadoRubrosComponent {

  fb = inject(FormBuilder)
  rubrosService = inject(RubrosService)
  authService = inject(AuthService)
  mostrarForm = signal<boolean>(false);
  crearNuevo = signal<boolean>(false);
  ordenAscendente = signal<boolean>(true);


  rubros = this.rubrosService.rubros;
  rubroSeleccionado = this.rubrosService.rubroSeleccionado;
  usuario = this.authService.user


  rubrosResource = rxResource({
    stream: () => this.rubrosService.traerRubros()
  })

  //traer rubros o mostrar error
  rubrosEffect = effect(() => {
    if (this.rubrosResource.hasValue()) {
      const respuesta = this.rubrosResource.value()
      if (typeof respuesta === 'string') return ToastError(respuesta)
    }
  })

  //cargar el form con datos del rubro a editar
  rubroSeleccionadoEffect = effect(() => {
    const rubro = this.rubroSeleccionado();
    if (rubro._id) {
      this.mostrarForm.set(true);
      this.formRubro.patchValue({
        nombre: rubro.nombre || '',
        rentabilidad: rubro.rentabilidad || 1

      });
    }

  })

  formRubro = this.fb.group({
    nombre: ['', Validators.required],
    rentabilidad: [1, [Validators.required, Validators.min(1)]],

  })


  switchMostrarForm() {
    if (this.mostrarForm()) {
      this.mostrarForm.set(false);
      this.crearNuevo.set(false);
      this.rubrosService.limpiarSeleccionado()
      this.formRubro.reset();
    } else {
      this.mostrarForm.set(true)
      if (!this.crearNuevo()) {
        this.crearNuevo.set(true);
        this.rubrosService.limpiarSeleccionado()
        this.formRubro.reset();
      }
    }
  }


  async onSubmit() {
    //CREAR NUEVO
    await this.validoCampos()
    if (!this.formRubro.valid) return;

    if (this.crearNuevo()) {
      let nuevoRubro: Rubro = this.estructurarRubro()

      //llamar al endpoint para crear un nuevo rubro
      try {
        await firstValueFrom(this.rubrosService.crearRubro(nuevoRubro))
        ToastExito(AGREGAR_EXITO)
        this.formRubro.reset();
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        return
      } catch (error) {
        ToastError(error as string)
        return
      }
    }
    //EDITAR 
    if (this.rubroSeleccionado()?._id) {
      let rubroEditado: Rubro = this.estructurarRubro()

      //llamar al endpoint para editar el rubro seleccionado
      try {
        await firstValueFrom(this.rubrosService.editarRubro(rubroEditado))
        ToastExito(AGREGAR_EXITO)
        this.formRubro.reset();
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
      } catch (error) {
        ToastError(error as string)
      }
    }
  }

  estructurarRubro() {
    return {
      _id: this.rubroSeleccionado()?._id || '',
      nombre: this.formRubro.get('nombre')?.value || '',
      rentabilidad: this.formRubro.get('rentabilidad')?.value || 1,
      creador: this.usuario()?._id || ''
    }
  }


  async validoCampos() {
    const nombre = this.formRubro.get('nombre')?.value;
    const rentabilidad = this.formRubro.get('rentabilidad')?.value;
    if (!nombre) {
      AlertErrorNombre()
      return
    }

    const rentabilidadCambiada = Number(rentabilidad)
    if (!rentabilidad || rentabilidad < 1 || isNaN(rentabilidad) || !Number(rentabilidadCambiada)) {
      AlertErrorRentabilidad()
      return
    }
  }

  ordenarPor() {
    let resultado: Rubro[] = [];
    const comparar = (a: Rubro, b: Rubro) => {
      const valorA = (a.rentabilidad || '');  //obtengo el valor del campo
      const valorB = (b.rentabilidad || '');
      if (valorA > valorB) return 1;  //valorA tiene que ir despues de valorB
      if (valorA < valorB) return -1; //valorA tiene que ir antes de valorB
      return 0; //si valorA y valorB son iguales, dejo como están
    };


    resultado = [...this.rubros()].sort((a: Rubro, b: Rubro) =>
      this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
    );
    this.rubros.set(resultado);
    this.ordenAscendente.set(!this.ordenAscendente());
  }
}

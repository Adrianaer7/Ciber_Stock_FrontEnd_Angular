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


  rubros = this.rubrosService.rubros;
  rubroSeleccionado = this.rubrosService.rubroSeleccionado ;
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
      this.rubrosService.crearRubro(nuevoRubro).subscribe((res) => { //mando al back
        if (typeof res === 'string') return ToastError(res) //si hay error
        this.formRubro.reset();
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        return
      })
    }
    //EDITAR 
    if (this.rubroSeleccionado()?._id) {
      let rubroEditado: Rubro = this.estructurarRubro()
      
      //llamar al endpoint para editar el rubro seleccionado
      this.rubrosService.editarRubro(rubroEditado).subscribe((res) => {
        if (typeof res === 'string') return ToastError(res) //si hay error
        this.formRubro.reset();
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        ToastExito(AGREGAR_EXITO)
      })
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

}

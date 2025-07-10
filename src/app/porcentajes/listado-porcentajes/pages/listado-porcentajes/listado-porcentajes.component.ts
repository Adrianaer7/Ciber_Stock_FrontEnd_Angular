import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { AlertErrorComision, AlertErrorNombre } from 'app/porcentajes/constants/porcentajes.contants';
import { Porcentaje } from 'app/porcentajes/interfaces/porcentajes.intercaces';
import { PorcentajesService } from 'app/porcentajes/services/porcentajes.service';
import { PorcentajeComponent } from '../../components/porcentaje/porcentaje.component';

@Component({
  selector: 'listado-porcentajes',
  imports: [PorcentajeComponent, ReactiveFormsModule],
  templateUrl: './listado-porcentajes.component.html',
})
export class ListadoPorcentajesComponent {

  fb = inject(FormBuilder)
  porcentajesService = inject(PorcentajesService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  mostrarForm = signal<boolean>(false);
  
  porcentajes = this.porcentajesService.porcentajes;
  porcentajeSeleccionado = this.porcentajesService.porcentajeSeleccionado;
  usuario = this.authService.user


  porcentajeResource = rxResource({
    stream: () => this.porcentajesService.traerPorcentajes()
  })

  //traer porcentajes o mostrar error
  porcentajesEffect = effect(() => {
    if (this.porcentajeResource.hasValue()) {
      const respuesta = this.porcentajeResource.value()
      if (typeof respuesta === 'string') return ToastError(respuesta)
    }
  })

  //cargar el form con datos del porcentaje a editar
  porcentajeSeleccionadoEffect = effect(() => {
    const porcentaje: Porcentaje = this.porcentajeSeleccionado();
    if (porcentaje._id) {
      this.mostrarForm.set(true);
      this.formPorcentaje.patchValue({
        nombre: porcentaje.nombre || '',
        comision: porcentaje.comision || 1,

      });
    }

  })

  formPorcentaje = this.fb.group({
    nombre: ['', Validators.required],
    comision: [1, [Validators.required, Validators.min(1)]],
  })


  switchMostrarForm() {
    if (this.mostrarForm()) {
      this.mostrarForm.set(false);
      this.porcentajesService.limpiarSeleccionado()
      this.formPorcentaje.reset();
    } else {
      this.mostrarForm.set(true)

    }
  }


  async onSubmit() {
    await this.validoCampos()
    if (!this.formPorcentaje.valid) return;

    //EDITAR 
    if (this.porcentajeSeleccionado()?._id) {
      let porcentajeEditado: Porcentaje = this.estructurarPorcentaje()

      //llamar al endpoint para editar el porcentaje seleccionado
      this.porcentajesService.editarPorcentaje(porcentajeEditado).subscribe(res => {
        if (typeof res === 'string') return ToastError(res) //si hay error
        this.formPorcentaje.reset();
        this.mostrarForm.set(false);
        ToastExito(AGREGAR_EXITO)
      })
    }

  }

  estructurarPorcentaje() {
    return {
      _id: this.porcentajeSeleccionado()?._id || '',
      nombre: this.formPorcentaje.get('nombre')?.value?.toUpperCase() || '',
      comision: this.formPorcentaje.get('comision')?.value || 1,
      tipo: this.porcentajeSeleccionado().tipo || '',
      creador: this.usuario()?._id || ''
    }
  }


  async validoCampos() {
    const nombre = this.formPorcentaje.get('nombre')?.value;
    if (!nombre) {
      AlertErrorNombre();
      return
    } 

    const comisionCambiada = Number(this.formPorcentaje.get('comision')?.value)
    if (!comisionCambiada || comisionCambiada < 1 || isNaN(comisionCambiada) || !Number(comisionCambiada))  {
      AlertErrorComision()
      return
    }
  }
}

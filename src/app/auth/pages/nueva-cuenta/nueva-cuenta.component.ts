import { Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { FormUtils } from '../../../shared/utils/forms.utils';
import { MensajeComponent } from '../../components/mensaje/mensaje.component';

@Component({
  selector: 'nueva-cuenta',
  imports: [MensajeComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-cuenta.component.html',
})
export class NuevaCuentaComponent {

  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  mensaje = this.authService.mensaje;  //msg back
  mensajeForm = signal<string>(''); //error de formulario

  nuevoUsuario = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', [Validators.required]]
  }, {
    validators: FormUtils.camposIguales('password', 'confirmar')
  });



  onSubmit() {
    if (this.nuevoUsuario.invalid) {

      const primerError = FormUtils.getFirstError(this.nuevoUsuario);
      this.mensajeForm.set(primerError ?? '');

      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);

      return;

    }

    //por si me llega vacio
    const { nombre = '', email = '', password = '' } = this.nuevoUsuario.value; 

    this.authService.registrarUsuario(nombre!, email!, password!).subscribe((msg) => {

      this.mensajeForm.set(msg)
  
      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);
    })
  }

}

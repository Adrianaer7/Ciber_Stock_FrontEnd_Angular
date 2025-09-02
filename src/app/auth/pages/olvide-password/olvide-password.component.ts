import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../../shared/utils/forms.utils';
import { MensajeComponent } from '../../components/mensaje/mensaje.component';
import { firstValueFrom } from 'rxjs';


@Component({
  selector: 'olvide-password',
  imports: [MensajeComponent, RouterLink, ReactiveFormsModule],
  templateUrl: './olvide-password.component.html',
})
export class OlvidePasswordComponent { 
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  mensajeForm = signal<string>(''); //error de formulario


  formOlvidePassword = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  
  async onSubmit() {   
    if (this.formOlvidePassword.invalid) {
      const primerError = FormUtils.getFirstError(this.formOlvidePassword);
      this.mensajeForm.set(primerError ?? '');

      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);
      return;
    }

    //por si me llega vacio
    const { email = '' } = this.formOlvidePassword.value;

    //envio el email para que me envie un mail de recuperacion
    try {
      const msg = await firstValueFrom(this.authService.olvideContraseña(email!))
      this.mensajeForm.set(msg);
    } catch (error) {
      this.mensajeForm.set(error as string)
      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);
    }
   }

}

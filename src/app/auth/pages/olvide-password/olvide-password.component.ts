import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../../utils/forms.utils';
import { MensajeComponent } from '../../components/mensaje/mensaje.component';


@Component({
  selector: 'app-olvide-password',
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

  
  onSubmit() {   
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
    this.authService.olvideContraseña(email!).subscribe((msg) => {
      this.mensajeForm.set(msg);

      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);
    });
   }

}

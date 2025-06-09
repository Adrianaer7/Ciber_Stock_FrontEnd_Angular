import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MensajeComponent } from '../../components/mensaje/mensaje.component';
import {AuthService} from '../../services/auth.service';
import { FormUtils } from '../../../utils/forms.utils';

@Component({
  selector: 'login',
  imports: [ MensajeComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  mensaje = this.authService.mensaje;  //msg back
  mensajeForm = signal<string>(''); //error de formulario

  login = this.fb.group({
    email: ['', [Validators.required, Validators.pattern(FormUtils.emailPattern)]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })
  

  onSubmit() {
    if(this.login.invalid) {
      const primerError = FormUtils.getFirstError(this.login);
      this.mensajeForm.set(primerError ?? '')
      
      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);
      return;
    }

    //por si me llega vacio
    const { email = '', password = '' } = this.login.value;

    //me logeo
    this.authService.login(email!, password!).subscribe((usuario) => {
      if(usuario) {
        //this.router.navigate(['/productos']);
        console.log('Usuario logueado:', usuario);
        return
      }

      this.mensajeForm.set(this.mensaje());
      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);
    })
  }


}

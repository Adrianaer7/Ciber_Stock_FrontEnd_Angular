import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, minLength, email } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { MensajeComponent } from '../../components/mensaje/mensaje.component';
import { AuthService } from '../../services/auth.service';
import { getFirstSignalFormError, touchAllFields } from '../../../shared/utils/signal-forms.utils';

@Component({
  selector: 'login',
  imports: [MensajeComponent, FormField, RouterLink],
  templateUrl: './login.component.html',
})
export class LoginComponent {

  router = inject(Router);
  authService = inject(AuthService);
  mensaje = this.authService.mensaje;
  mensajeForm = signal<string>('');

  loginModel = signal({ email: '', password: '' });
  loginForm = form(this.loginModel, (schema) => {
    required(schema.email, { message: 'El campo email es requerido' });
    email(schema.email, { message: 'El campo email no es un correo electrónico válido' });
    required(schema.password, { message: 'El campo password es requerido' });
    minLength(schema.password, 6, { message: 'El campo password debe tener al menos 6 caracteres.' });
  });


  async onSubmit() {
    touchAllFields([this.loginForm.email, this.loginForm.password]);

    if (this.loginForm().invalid()) {
      const primerError = getFirstSignalFormError(this.loginForm, [
        { path: this.loginForm.email, name: 'email' },
        { path: this.loginForm.password, name: 'password' },
      ]);
      this.mensajeForm.set(primerError ?? '');
      setTimeout(() => this.mensajeForm.set(''), 3000);
      return;
    }

    const { email, password } = this.loginModel();

    const usuario = await firstValueFrom(this.authService.login(email, password));
    if (usuario) {
      this.router.navigate(['/productos']);
    } else {
      this.mensajeForm.set(this.mensaje());
      setTimeout(() => this.mensajeForm.set(''), 3000);
    }
  }
}

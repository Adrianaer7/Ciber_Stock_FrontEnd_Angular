import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, email } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MensajeComponent } from '../../components/mensaje/mensaje.component';
import { getFirstSignalFormError, touchAllFields } from '../../../shared/utils/signal-forms.utils';

@Component({
  selector: 'olvide-password',
  imports: [MensajeComponent, RouterLink, FormField],
  templateUrl: './olvide-password.component.html',
})
export class OlvidePasswordComponent {
  router = inject(Router);
  authService = inject(AuthService);
  mensajeForm = signal<string>('');

  olvidePasswordModel = signal({ email: '' });
  olvidePasswordForm = form(this.olvidePasswordModel, (schema) => {
    required(schema.email, { message: 'El campo email es requerido' });
    email(schema.email, { message: 'El campo email no es un correo electrónico válido' });
  });


  async onSubmit() {
    touchAllFields([this.olvidePasswordForm.email]);

    if (this.olvidePasswordForm().invalid()) {
      const primerError = getFirstSignalFormError(this.olvidePasswordForm, [
        { path: this.olvidePasswordForm.email, name: 'email' },
      ]);
      this.mensajeForm.set(primerError ?? '');
      setTimeout(() => this.mensajeForm.set(''), 3000);
      return;
    }

    const { email } = this.olvidePasswordModel();

    try {
      const msg = await firstValueFrom(this.authService.olvideContraseña(email));
      this.mensajeForm.set(msg);
    } catch (error) {
      this.mensajeForm.set(error as string);
      setTimeout(() => this.mensajeForm.set(''), 3000);
    }
  }
}

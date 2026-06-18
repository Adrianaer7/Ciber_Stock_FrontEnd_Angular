import { Component, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { MensajeComponent } from '../components/mensaje/mensaje.component';
import { form, FormField, required, minLength, validate } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from 'environments/environment.development';
import { getFirstSignalFormError, touchAllFields } from '../../shared/utils/signal-forms.utils';

@Component({
  selector: 'nueva-contraseña',
  imports: [MensajeComponent, FormField, RouterLink],
  templateUrl: './nueva-password.component.html',
})
export class NuevaPasswordComponent {

  router = inject(Router);
  authService = inject(AuthService);
  activatedRoute = inject(ActivatedRoute);
  mensajeForm = signal<string>('');
  cambioCorrecto = signal<string>('');

  token = this.activatedRoute.snapshot.params['token'];

  tokenResource = httpResource<boolean>(
    () => `${environment.backendURL}/usuarios/olvide-password/${this.token}`,
  );

  redirectEffect = effect(() => {
    if (this.tokenResource.error()) {
      this.router.navigate(['404']);
    }
  });

  nuevaPasswordModel = signal({ password: '', confirmar: '' });
  nuevaPasswordForm = form(this.nuevaPasswordModel, (schema) => {
    required(schema.password, { message: 'El campo password es requerido' });
    minLength(schema.password, 6, { message: 'El campo password debe tener al menos 6 caracteres.' });
    required(schema.confirmar, { message: 'El campo confirmar es requerido' });
    validate(schema.confirmar, () => {
      const { password, confirmar } = this.nuevaPasswordModel();
      if (confirmar && password !== confirmar) {
        return { kind: 'passwordsNotEqual', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });
  });

  async onSubmit() {
    touchAllFields([this.nuevaPasswordForm.password, this.nuevaPasswordForm.confirmar]);

    if (this.nuevaPasswordForm().invalid()) {
      const primerError = getFirstSignalFormError(this.nuevaPasswordForm, [
        { path: this.nuevaPasswordForm.password, name: 'password' },
        { path: this.nuevaPasswordForm.confirmar, name: 'confirmar' },
      ]);
      this.mensajeForm.set(primerError ?? '');
      setTimeout(() => this.mensajeForm.set(''), 3000);
      return;
    }

    const { password } = this.nuevaPasswordModel();

    try {
      await firstValueFrom(this.authService.nuevaPassword(password, this.token));
      this.cambioCorrecto.set('Contraseña cambiada correctamente');
      setTimeout(() => this.mensajeForm.set(''), 10000);
    } catch {
      this.router.navigate(['/']);
    }
  }
}

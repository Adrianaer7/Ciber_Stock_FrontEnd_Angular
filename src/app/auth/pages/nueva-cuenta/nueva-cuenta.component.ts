import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { form, FormField, required, minLength, email, validate } from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../../services/auth.service';
import { MensajeComponent } from '../../components/mensaje/mensaje.component';
import { getFirstSignalFormError, touchAllFields } from '../../../shared/utils/signal-forms.utils';

@Component({
  selector: 'nueva-cuenta',
  imports: [MensajeComponent, FormField, RouterLink],
  templateUrl: './nueva-cuenta.component.html',
})
export class NuevaCuentaComponent {

  router = inject(Router);
  authService = inject(AuthService);
  mensajeForm = signal<string>('');

  nuevoUsuarioModel = signal({
    nombre: '',
    email: '',
    password: '',
    confirmar: '',
  });

  nuevoUsuarioForm = form(this.nuevoUsuarioModel, (schema) => {
    required(schema.nombre, { message: 'El campo nombre es requerido' });
    minLength(schema.nombre, 3, { message: 'El campo nombre debe tener al menos 3 caracteres.' });
    required(schema.email, { message: 'El campo email es requerido' });
    email(schema.email, { message: 'El campo email no es un correo electrónico válido' });
    required(schema.password, { message: 'El campo password es requerido' });
    minLength(schema.password, 6, { message: 'El campo password debe tener al menos 6 caracteres.' });
    required(schema.confirmar, { message: 'El campo confirmar es requerido' });
    validate(schema.confirmar, () => {
      const { password, confirmar } = this.nuevoUsuarioModel();
      if (confirmar && password !== confirmar) {
        return { kind: 'passwordsNotEqual', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });
  });


  async onSubmit() {
    touchAllFields([
      this.nuevoUsuarioForm.nombre,
      this.nuevoUsuarioForm.email,
      this.nuevoUsuarioForm.password,
      this.nuevoUsuarioForm.confirmar,
    ]);

    if (this.nuevoUsuarioForm().invalid()) {
      const primerError = getFirstSignalFormError(this.nuevoUsuarioForm, [
        { path: this.nuevoUsuarioForm.nombre, name: 'nombre' },
        { path: this.nuevoUsuarioForm.email, name: 'email' },
        { path: this.nuevoUsuarioForm.password, name: 'password' },
        { path: this.nuevoUsuarioForm.confirmar, name: 'confirmar' },
      ]);
      this.mensajeForm.set(primerError ?? '');
      setTimeout(() => this.mensajeForm.set(''), 3000);
      return;
    }

    const { nombre, email, password } = this.nuevoUsuarioModel();

    try {
      const msg = await firstValueFrom(this.authService.registrarUsuario(nombre, email, password));
      this.mensajeForm.set(msg);
    } catch (error) {
      this.mensajeForm.set(error as string);
    }
    setTimeout(() => this.mensajeForm.set(''), 3000);
  }
}

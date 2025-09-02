import { Component, effect, inject, signal } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { MensajeComponent } from '../components/mensaje/mensaje.component';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormUtils } from '../../shared/utils/forms.utils';
import { rxResource } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'nueva-contraseña',
  imports: [MensajeComponent, ReactiveFormsModule, RouterLink],
  templateUrl: './nueva-contraseña.component.html',
})
export class NuevaContraseñaComponent {

  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);
  activatedRoute = inject(ActivatedRoute);
  mensaje = this.authService.mensaje;  //msg back
  mensajeForm = signal<string>(''); //error de formulario
  cambioCorrecto = signal<string>('')

  token = this.activatedRoute.snapshot.params['token'];


  //ni bien se inicializa el componente
  tokenResource = rxResource({
    params: () => ({ token: this.token }),
    stream: ({ params }) => {
      return this.authService.comprobarToken(params.token);
    },
  });

  redirectEffect = effect(() => {
    if (this.tokenResource.hasValue()) {
      if (!this.tokenResource.value()) this.router.navigate(['404'])
    }
  });


  formNuevaPassword = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmar: ['', [Validators.required]]
  }, {
    validators: FormUtils.camposIguales('password', 'confirmar')
  });

  async onSubmit() {
    if (this.formNuevaPassword.invalid) {
      const primerError = FormUtils.getFirstError(this.formNuevaPassword);
      this.mensajeForm.set(primerError ?? '');

      setTimeout(() => {
        this.mensajeForm.set('');
      }, 3000);
      return;
    }

    //por si me llega vacio
    const { password = '' } = this.formNuevaPassword.value;

    //envio el nuevo password
    try {
      await firstValueFrom(this.authService.nuevaPassword(password!, this.token))
      this.cambioCorrecto.set("Contraseña cambiada correctamente")
      setTimeout(() => {
        this.mensajeForm.set("")

      }, 10000);
    } catch (error) {
      this.router.navigate(["/"]);
    }

  }
}
import { Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-confirmar-cuenta',
  imports: [RouterLink],
  templateUrl: './confirmar-cuenta.component.html',
})
export class ConfirmarCuentaComponent {
  router = inject(Router);
  authService = inject(AuthService);
  activatedRoute = inject(ActivatedRoute);
  mensajeForm = signal<string>(''); //error de formulario

  token = this.activatedRoute.snapshot.params['token'];


  //ni bien se inicializa el componente
  tokenResource = rxResource({
    params: () => ({ token: this.token }),
    stream: ({ params }) => {
      return this.authService.confirmarCuenta(params.token);
    },
  });

  redirectEffect = effect(() => {
    if (this.tokenResource.hasValue()) {
      this.mensajeForm.set(this.tokenResource.value())
    }
  });
}
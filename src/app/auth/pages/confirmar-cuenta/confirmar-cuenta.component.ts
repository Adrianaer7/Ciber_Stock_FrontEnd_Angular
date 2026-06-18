import { Component, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { environment } from 'environments/environment.development';

@Component({
  selector: 'confirmar-cuenta',
  imports: [RouterLink],
  templateUrl: './confirmar-cuenta.component.html',
})
export class ConfirmarCuentaComponent {
  router = inject(Router);
  activatedRoute = inject(ActivatedRoute);
  mensajeForm = signal<string>('');

  token = this.activatedRoute.snapshot.params['token'];

  tokenResource = httpResource<{ msg: string }>(
    () => `${environment.backendURL}/usuarios/confirmar/${this.token}`,
  );

  confirmarEffect = effect(() => {
    if (this.tokenResource.hasValue()) {
      this.mensajeForm.set(this.tokenResource.value()!.msg);
    }
    if (this.tokenResource.error()) {
      this.router.navigate(['404']);
    }
  });
}

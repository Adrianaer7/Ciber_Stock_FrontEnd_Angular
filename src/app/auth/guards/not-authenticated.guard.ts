import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

export const NotAuthenticatedGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) {
    router.navigateByUrl('/productos');
    return false;
  }

  const autenticado = await firstValueFrom(authService.usuarioAutenticado());

  if (autenticado) {
    router.navigateByUrl('/productos');
    return false;
  }

  return true;
};

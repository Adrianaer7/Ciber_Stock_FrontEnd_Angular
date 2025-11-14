import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

//se ejecuta cuando el usuario ingresa a una ruta que no se necesita estar autenticado
export const NotAuthenticatedGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const autenticado = await firstValueFrom(authService.usuarioAutenticado());

  if (autenticado) {
    router.navigateByUrl('/productos');
    return false;
  }

  return true;
};

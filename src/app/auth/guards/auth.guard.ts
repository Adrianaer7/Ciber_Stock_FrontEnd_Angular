import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

export const AuthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) return true;

  const autenticado = await firstValueFrom(authService.usuarioAutenticado());

  if (!autenticado) {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};

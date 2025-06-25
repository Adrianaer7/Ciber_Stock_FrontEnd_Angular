import { CanActivateFn, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";
import { inject } from "@angular/core";
import { firstValueFrom } from "rxjs";

export const AuthGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.estaAutenticado()) return true; //una vez que hace el login se guarda aca. De esta manera no hay que hacer un auth por cada llamada al back

  const autenticado = await firstValueFrom(authService.usuarioAutenticado()); //valida que el token del ls sea valido

  if (!autenticado) {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};

import { HttpInterceptorFn, HttpResponse } from "@angular/common/http";
import { inject } from "@angular/core";
import { tap } from "rxjs";
import { AuthService } from "../services/auth.service";

//este interceptor solo se ejecuta cuando voy a hacer una peticion http get a api/auth
export const authResponseInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService)
  return next(req).pipe(
    tap(event => {
      if (event instanceof HttpResponse && req.url.endsWith('/auth') && req.method === 'GET') {
        const headers = event.headers;
        const usuario = {
          _id: headers.get('x-usuario-id') || '',
          email: headers.get('x-usuario-email') || '',
          nombre: decodeURIComponent(headers.get('x-usuario-nombre') || '') //para que me "escape" los caracteres raros que pueda tener el nombre
        };
        authService.exitoAlAutenticar(usuario);
      }
    })
  );
};

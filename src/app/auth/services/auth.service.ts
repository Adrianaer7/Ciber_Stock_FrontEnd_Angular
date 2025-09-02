import { computed, inject, Injectable, signal } from '@angular/core';
import { RegistroUsuarioResponse, Usuario } from '../interfaces/auth.interface';
import { ErrorResponse } from '../../shared/interfaces/error-response.interface';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  private http = inject(HttpClient)
  private _usuario = signal<Usuario | null>(null)
  private _token = signal<string | null | undefined>(localStorage.getItem('token') ?? '');
  private _cargando = signal<boolean>(false);
  private _mensaje = signal<string>('');
  private autenticado = signal<boolean>(false);

  //guardo en mis signals de solo lectura para que nadie pueda modificar
  user = computed(() => this._usuario());
  token = computed(this._token);
  cargando = computed(() => this._cargando());
  mensaje = computed(() => this._mensaje());
  estaAutenticado = computed(() => this.autenticado()); // solo lectura

  //envio el token al backend
  usuarioAutenticado(): Observable<boolean> {
    if (this.autenticado()) return of(true)
    if (!this._token()) {
      this.logout();
      return of(false);
    } else {
      return this.http.get(`${environment.backendURL}/auth`) //mando el token en el interceptor
        .pipe(
          map(() => true),  //en el interceptor -> exitoAlAutenticar()
          catchError((error: HttpErrorResponse) => this.errorAlAutenticar(error))
        );
    }
  }


  //la uso al loguearme o autenticarme con el token cargado en el ls
  exitoAlAutenticar(usuario: Usuario): boolean {
    this._usuario.set(usuario);
    if (!this.token()) { // si me estoy logeando por primera vez
      this._token.set(usuario.token);
    }
    if (!localStorage.getItem('token')) {  // si me estoy logeando por primera vez
      localStorage.setItem('token', usuario.token!);
    }
    this.autenticado.set(true);

    return true;
  }

  errorAlAutenticar(error: HttpErrorResponse): Observable<boolean> {
    this.logout()
    if(error.status == 0) { //si no hay respuesta del servidor
      this._mensaje.set('No se pudo conectar con el servidor');
    } else {
      this._mensaje.set(error.error?.msg);
    }
    return of(false);
  }


  logout() {
    this._usuario.set(null);
    this.autenticado.set(false)
    this._token.set(null);
    localStorage.removeItem('token');
  }

  login(email: string, password: string): Observable<boolean> {
    return this.http.post<Usuario>(`${environment.backendURL}/auth`, { email, password })
      .pipe(
        map((usuario) => this.exitoAlAutenticar(usuario)),
        catchError((error: HttpErrorResponse) => this.errorAlAutenticar(error))
      );
  }

  registrarUsuario(nombre: string, email: string, password: string): Observable<string> {
    return this.http.post<RegistroUsuarioResponse>(`${environment.backendURL}/usuarios`, { nombre, email, password })
      .pipe(
        map(resp => resp.msg),
        manejarHttpError()
      );
  }

  olvideContraseña(email: string): Observable<string> {
    return this.http.post<{ msg: string }>(`${environment.backendURL}/usuarios/olvide-password`, { email })
      .pipe(
        map(resp => resp.msg),
        manejarHttpError()
      );
  }

  comprobarToken(token: string): Observable<boolean> {
    return this.http.get<boolean>(`${environment.backendURL}/usuarios/olvide-password/${token}`)
      .pipe(
        map(() => true),
        catchError(() => of(false))
      );
  }

  nuevaPassword(contraseña: string, token: string): Observable<string> {
    return this.http.post<{ msg: string }>(`${environment.backendURL}/usuarios/olvide-password/${token}`, { contraseña })
      .pipe(
        map(resp => resp.msg),
        manejarHttpError()
      );
  }
  confirmarCuenta(token: string): Observable<string> {
    return this.http.get<{ msg: string }>(`${environment.backendURL}/usuarios/confirmar/${token}`)
      .pipe(
        map(resp => resp.msg),
        manejarHttpError()
      );
  }

}

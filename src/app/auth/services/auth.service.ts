import { computed, inject, Injectable, signal } from '@angular/core';
import { AuthError, ErrorResponse, RegistroUsuarioResponse, Usuario } from '../interfaces/auth.interface';
import { HttpClient } from '@angular/common/http';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient)

  private _usuario = signal<Usuario | null>(null)
  private _token = signal<string | null | undefined>(localStorage.getItem('token'));
  private _cargando = signal<boolean>(false);
  private _mensaje = signal<string>('');

  //ni bien carga la pagina intento autenticar al usuario
  estadoLoginResource = rxResource({
    stream: () => this.usuarioAutenticado(),
  });

  //guardo en mis signals de solo lectura para que nadie pueda modificar
  user = computed(() => this._usuario());
  token = computed(this._token);
  cargando = computed(() => this._cargando());
  mensaje = computed(() => this._mensaje());

  //envio el token al backend para autenticar al usuario
  usuarioAutenticado(): Observable<boolean> {
    const token = localStorage.getItem('token');
    if (!token) {
      this.logout();
      return of(false);
    }

    return this.http.get<Usuario>(`${environment.backendURL}/auth`) //mando el token en el interceptor
      .pipe(
        map((usuario) => this.exitoAlAutenticar(usuario)),
        catchError((error: ErrorResponse) => this.errorAlAutenticar(error))
      );
  }

  logout() {
    this._usuario.set(null);
    this._token.set(null);
    localStorage.removeItem('token');
  }

  //la uso al loguearme o autenticarme con el token cargado en el ls
  exitoAlAutenticar(usuario: Usuario): boolean {

    this._usuario.set(usuario);
    this._token.set(usuario?.token);
    if (usuario.token) {
      localStorage.setItem('token', usuario.token);
    }
    return true;
  }

  errorAlAutenticar(error: ErrorResponse): Observable<boolean> {
    this.logout()
    this._mensaje.set(error.error.msg);
    return of(false);
  }


  login(email: string, password: string): Observable<boolean> {
    return this.http.post<Usuario>(`${environment.backendURL}/auth`, { email, password })
      .pipe(
        map((usuario) => this.exitoAlAutenticar(usuario)),
        catchError((error: ErrorResponse) => this.errorAlAutenticar(error))
      );
  }

  registrarUsuario(nombre: string, email: string, password: string): Observable<string> {
    return this.http.post<RegistroUsuarioResponse>(`${environment.backendURL}/usuarios`, { nombre, email, password })
      .pipe(
        map((resp) => resp.msg),
        catchError((error: ErrorResponse) => of(error.error.msg))
      );
  }

  olvideContraseña(email: string): Observable<string> {
    return this.http.post<{ msg: string }>(`${environment.backendURL}/usuarios/olvide-password`, { email })
      .pipe(
        map((resp) => resp.msg),
        catchError((error: ErrorResponse) => of(error.error.msg))
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
        map((resp) => resp.msg),
        catchError((error: ErrorResponse) => of(error.error.msg))
      );
  }
  confirmarCuenta(token: string): Observable<string> {
    return this.http.get<{ msg: string }>(`${environment.backendURL}/usuarios/confirmar/${token}`)
      .pipe(
        map((resp) => resp.msg),
        catchError((error: ErrorResponse) => of(error.error.msg))
      );
  }

}

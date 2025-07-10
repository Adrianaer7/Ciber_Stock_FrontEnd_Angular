import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { ResponseDolar } from '../interfaces/productos.interface';
import { environment } from 'environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class DolaresService {
    private http = inject(HttpClient)

    private _precio = signal<number>(0)
    elDolarAutomatico = signal<boolean>(true)

    dolarDB = computed(() => this._precio())
    precio = computed(() => this._precio())

    traerDolarDB(): Observable<ResponseDolar> {
        return this.http.get<ResponseDolar>(`${environment.backendURL}/dolares`)
            .pipe(
                tap(dolar => this.guardarDolar(dolar)),
                //catchError((error: ErrorResponse) => of(error.error.statusCode))
            )
    }

    editarDolarDB(precio: string = '0', automatico = false): Observable<ResponseDolar> {
        let param;
        if (!automatico) {
            param = {
                automatico: false,
                dolarManual: {
                    precio
                }
            }
        } else {
            param = {
                automatico: true,
            }
        }

        return this.http.put<ResponseDolar>(`${environment.backendURL}/dolares`, param)
            .pipe(
                tap(dolar => this.guardarDolar(dolar)),
                //catchError((error: ErrorResponse) => of(error.error.statusCode))
            )
    }

    guardarDolar(dolar: ResponseDolar) {
        this.elDolarAutomatico.set(dolar.automatico)
        this._precio.set(dolar.precio)
    }
}
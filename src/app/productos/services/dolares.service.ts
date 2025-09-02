import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {  Observable, tap } from 'rxjs';
import { ResponseDolar } from '../interfaces/productos.interface';
import { environment } from 'environments/environment.development';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

@Injectable({
    providedIn: 'root'
})
export class DolaresService {
    private http = inject(HttpClient)

    private _precio = signal<number>(0)
    elDolarAutomatico = signal<boolean>(true)

    dolarDB = computed(() => this._precio())
    precio = computed(() => this._precio())

    traerDolarDB(): Observable<ResponseDolar | number> {
        return this.http.get<ResponseDolar>(`${environment.backendURL}/dolares`)
            .pipe(
                tap(dolar => this.guardarDolar(dolar)),
                manejarHttpError()
            )
    }

    editarDolarDB(precio: string = '0', automatico = false): Observable<ResponseDolar | string> {
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
                manejarHttpError()
            )
    }

    guardarDolar(dolar: ResponseDolar) {
        this.elDolarAutomatico.set(dolar.automatico)
        this._precio.set(dolar.precio)
    }
}
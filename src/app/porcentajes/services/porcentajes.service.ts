import { inject, Injectable, signal } from '@angular/core';
import { Porcentaje } from '../interfaces/porcentajes.intercaces';
import { environment } from 'environments/environment.development';
import { catchError, map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ErrorResponse } from 'app/shared/interfaces/error-response.interface';
import { PORCENTAJE_VACIO } from '../constants/porcentajes.contants';

@Injectable({
    providedIn: 'root'
})
export class PorcentajesService {

    private http = inject(HttpClient)
    porcentajes = signal<Porcentaje[]>([])
    porcentajeSeleccionado = signal<Porcentaje>(PORCENTAJE_VACIO)

    traerPorcentajes(): Observable<Porcentaje[] | string> {
        return this.http.get<{ porcentajes: Porcentaje[] }>(`${environment.backendURL}/porcentajes`)
            .pipe(
                tap(res => this.porcentajes.set(res.porcentajes)),
                map((res) => res.porcentajes),
                catchError((error: ErrorResponse) => error.error.msg)
            )
    }



    editarPorcentaje(porcentaje: Porcentaje): Observable<Porcentaje | string> {
        return this.http.put<{ porcentaje: Porcentaje }>(`${environment.backendURL}/porcentajes/${porcentaje._id}`, porcentaje)
            .pipe(
                tap(res => this.porcentajes.update(porcentajes => porcentajes.map(porcentaje => porcentaje._id === res.porcentaje._id ? res.porcentaje : porcentaje))),
                tap(() => this.limpiarSeleccionado()),
                map((res) => res.porcentaje),
                catchError((error: ErrorResponse) => error.error.msg)
            )

    }

    eliminarUnPorcentaje(id: string): Observable<boolean | string> {
        return this.http.delete<{ msg: string }>(`${environment.backendURL}/porcentajes/${id}`)
            .pipe(
                tap(() => this.porcentajes.update(porcentajes => porcentajes.filter(porcentaje => porcentaje._id !== id))),
                map(() => true),
                catchError((error: ErrorResponse) => error.error.msg)
            );
    }

    porcentajeActual(porcentaje: Porcentaje) {
        this.porcentajeSeleccionado.set(porcentaje)
    }

    async limpiarSeleccionado() {
        this.porcentajeSeleccionado.set(PORCENTAJE_VACIO)
    }
}
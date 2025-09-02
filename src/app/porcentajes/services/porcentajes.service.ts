import { inject, Injectable, signal } from '@angular/core';
import { Porcentaje } from '../interfaces/porcentajes.intercaces';
import { environment } from 'environments/environment.development';
import { map, Observable, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { PORCENTAJE_VACIO } from '../constants/porcentajes.contants';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

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
                map(res => res.porcentajes),
                manejarHttpError()
            )
    }



    editarPorcentaje(porcentaje: Porcentaje): Observable<Porcentaje | string> {
        return this.http.put<{ porcentaje: Porcentaje }>(`${environment.backendURL}/porcentajes/${porcentaje._id}`, porcentaje)
            .pipe(
                tap(res => this.porcentajes.update(porcentajes => porcentajes.map(porcentaje => porcentaje._id === res.porcentaje._id ? res.porcentaje : porcentaje))),
                tap(() => this.limpiarSeleccionado()),
                map(res => res.porcentaje),
                manejarHttpError()
            )

    }

    eliminarUnPorcentaje(id: string): Observable<boolean | string> {
        return this.http.delete<{ msg: string }>(`${environment.backendURL}/porcentajes/${id}`)
            .pipe(
                tap(() => this.porcentajes.update(porcentajes => porcentajes.filter(porcentaje => porcentaje._id !== id))),
                map(() => true),
                manejarHttpError()
            );
    }

    porcentajeActual(porcentaje: Porcentaje) {
        this.porcentajeSeleccionado.set(porcentaje)
    }

    async limpiarSeleccionado() {
        this.porcentajeSeleccionado.set(PORCENTAJE_VACIO)
    }
}
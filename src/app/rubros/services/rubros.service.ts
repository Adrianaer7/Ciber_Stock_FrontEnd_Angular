import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Rubro } from '../interfaces/rubros.intefaces';
import { RUBRO_VACIO } from '../constants/rubros.constants';
import { environment } from 'environments/environment.development';
import { map, Observable, tap } from 'rxjs';
import { manejarHttpError } from 'app/shared/utils/http-error-handler';

@Injectable({
    providedIn: 'root'
})

export class RubrosService {

    private http = inject(HttpClient)
    rubros = signal<Rubro[]>([])
    rubroSeleccionado = signal<Rubro>(RUBRO_VACIO)


    crearRubro(rubro: Rubro): Observable<Rubro | string> {
        return this.http.post<{ rubro: Rubro }>(`${environment.backendURL}/rubros`, rubro)
            .pipe(
                tap(res => this.rubros.update(rubros => [...rubros, res.rubro])),
                map(res => res.rubro),
                manejarHttpError()
            );
    }

    traerRubros(): Observable<Rubro[] | string> {
        return this.http.get<{ rubros: Rubro[] }>(`${environment.backendURL}/rubros`)
            .pipe(
                tap(res => this.rubros.set(res.rubros)),
                map(res => res.rubros),
                manejarHttpError()
            )
    }


    editarRubro(rubro: Rubro): Observable<Rubro | string> {
        return this.http.put<{ rubro: Rubro }>(`${environment.backendURL}/rubros/${rubro._id}`, rubro)
            .pipe(
                tap(res => this.rubros.update(rubros => rubros.map(rubro => rubro._id === res.rubro._id ? res.rubro : rubro))),
                tap(() => this.limpiarSeleccionado()),
                map(res => res.rubro),
                manejarHttpError()
            )

    }


    eliminarUnRubro(id: string): Observable<boolean | string> {
        return this.http.delete<{ msg: string }>(`${environment.backendURL}/rubros/${id}`)
            .pipe(
                tap(() => this.rubros.update(rubros => rubros.filter(rubro => rubro._id !== id))),
                map(() => true),
                manejarHttpError()
            );
    }


    rubroActual(rubro: Rubro) {
        this.rubroSeleccionado.set(rubro)
    }

    async limpiarSeleccionado() {
        this.rubroSeleccionado.set(RUBRO_VACIO)
    }


}
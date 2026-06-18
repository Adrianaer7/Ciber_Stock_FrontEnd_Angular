import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { FaltantesService } from 'app/faltantes/services/faltantes.service';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { FaltanteComponent } from '../../component/faltante/faltante.component';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { limpiarBusqueda } from 'app/shared/utils/general.utils';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';

type propiedades = 'codigo' | 'nombre' | 'marca' | 'modelo' | 'rubro' | 'proveedor' | 'disponibles';
@Component({
  selector: 'listado-faltantes',
  imports: [FaltanteComponent],
  templateUrl: './listado-faltantes.component.html',
})


export class ListadoFaltantesComponent {

  faltantesService = inject(FaltantesService)
  proveedoresService = inject(ProveedoresService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  filtrados = signal<Producto[]>([]);
  ordenAscendente = signal<boolean>(true);

  faltantes = this.faltantesService.faltantes;
  proveedores = this.proveedoresService.proveedores
  usuario = this.authService.user


  faltantesResource = httpResource<{ faltantes: Producto[] }>(
    () => `${environment.backendURL}/faltantes`,
  );
  proveedoresResource = httpResource<{ proveedores: Proveedor[] }>(
    () => `${environment.backendURL}/proveedores`,
  );

  faltantesLoadEffect = effect(() => {
    if (this.faltantesResource.hasValue()) {
      this.faltantesService.faltantes.set(this.faltantesResource.value()!.faltantes);
    }
    if (this.proveedoresResource.hasValue()) {
      this.proveedoresService.proveedores.set(this.proveedoresResource.value()!.proveedores);
    }
    for (const resource of [this.faltantesResource, this.proveedoresResource]) {
      const error = resource.error();
      if (error) {
        ToastError(getHttpResourceErrorMessage(error));
      }
    }
  });


  //cuando cambie filtrando()
  filtroFaltante = computed(() => {
    const palabras = this.filtrando()

    if (!palabras) return [];

    const incluyeTodas = (descripcion: string, palabras: string): boolean => {
      return palabras
        .split(' ')
        .every(p => descripcion.includes(p));
    };

    return this.faltantes().filter(({ descripcion }) =>
      incluyeTodas(descripcion, palabras)
    );
  });

  busqueda(value: string) {
    this.filtrando.set(limpiarBusqueda(value));
    this.filtrados.set(this.filtroFaltante());
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.filtrando.set('');
      this.filtrados.set([]);
    }
  }

  ordenarPor(campo: propiedades) {
    let resultado: Producto[] = [];
    const comparar = (a: Producto, b: Producto) => {
      const valorA = (a[campo] || '');  //obtengo el valor del campo
      const valorB = (b[campo] || '');
      if (valorA > valorB) return 1;  //valorA tiene que ir despues de valorB
      if (valorA < valorB) return -1; //valorA tiene que ir antes de valorB
      return 0; //si valorA y valorB son iguales, dejo como están
    };

    if (this.filtrados().length) {
      resultado = [...this.filtrados()].sort((a: Producto, b: Producto) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)  //seria como this.ordenAscendente() ? 1 : -1
      );
      this.filtrados.set(resultado);
    } else {
      resultado = [...this.faltantes()].sort((a: Producto, b: Producto) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
      );
      this.faltantes.set(resultado);
    }
    this.ordenAscendente.set(!this.ordenAscendente());
  }
}

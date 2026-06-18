import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { Compra } from 'app/compras/interfaces/compras.interface';
import { ComprasService } from 'app/compras/services/compras.service';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { CompraComponent } from '../../components/compra/compra.component';
import { limpiarBusqueda } from 'app/shared/utils/general.utils';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';

type propiedades = 'nombre' | 'marca' | 'modelo';

@Component({
  selector: 'listado-compras',
  imports: [CompraComponent],
  templateUrl: './listado-compras.component.html',
})
export class ListadoComprasComponent {

  comprasService = inject(ComprasService)
  proveedoresService = inject(ProveedoresService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  filtradas = signal<Compra[]>([]);
  ordenAscendente = signal<boolean>(true);


  compras = this.comprasService.compras;
  proveedores = this.proveedoresService.proveedores
  usuario = this.authService.user


  comprasResource = httpResource<{ todas: Compra[] }>(
    () => `${environment.backendURL}/compras`,
  );
  proveedoresResource = httpResource<{ proveedores: Proveedor[] }>(
    () => `${environment.backendURL}/proveedores`,
  );

  comprasLoadEffect = effect(() => {
    if (this.comprasResource.hasValue()) {
      this.comprasService.compras.set(this.comprasResource.value()!.todas);
    }
    if (this.proveedoresResource.hasValue()) {
      this.proveedoresService.proveedores.set(this.proveedoresResource.value()!.proveedores);
    }
    for (const resource of [this.comprasResource, this.proveedoresResource]) {
      const error = resource.error();
      if (error) {
        ToastError(getHttpResourceErrorMessage(error));
      }
    }
  });


  //cuando cambie filtrando()
  filtroCompra = computed(() => {
    const palabras = this.filtrando()

    if (!palabras) return [];

    const incluyeTodas = (descripcion: string, palabras: string): boolean => {
      return palabras
        .split(' ')
        .every(p => descripcion.includes(p));
    };

    return this.compras().filter(({ descripcion }) =>
      incluyeTodas(descripcion, palabras)
    );
  });

  // cuando cambie el filtro de búsqueda
  busqueda(value: string) {
    this.filtrando.set(limpiarBusqueda(value));
    this.filtradas.set(this.filtroCompra());
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.filtrando.set('');
      this.filtradas.set([]);
    }
  }

  ordenarPor(campo: propiedades) {
    let resultado: Compra[] = [];
    const comparar = (a: Compra, b: Compra) => {
      const valorA = (a[campo] || '');  //obtengo el valor del campo
      const valorB = (b[campo] || '');
      if (valorA > valorB) return 1;  //valorA tiene que ir despues de valorB
      if (valorA < valorB) return -1; //valorA tiene que ir antes de valorB
      return 0; //si valorA y valorB son iguales, dejo como están
    };

    if (this.filtradas().length) {
      resultado = [...this.filtradas()].sort((a: Compra, b: Compra) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)  //seria como this.ordenAscendente() ? 1 : -1
      );
      this.filtradas.set(resultado);
    } else {
      resultado = [...this.compras()].sort((a: Compra, b: Compra) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
      );
      this.compras.set(resultado);
    }
    this.ordenAscendente.set(!this.ordenAscendente());
  }

}

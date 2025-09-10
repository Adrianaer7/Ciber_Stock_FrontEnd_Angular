import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { Compra } from 'app/compras/interfaces/compras.interfaces';
import { ComprasService } from 'app/compras/services/compras.service';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { forkJoin } from 'rxjs';
import { CompraComponent } from '../../components/compra/compra.component';
import { limpiarBusqueda } from 'app/shared/utils/general.utils';

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


  comprasResource = rxResource({
    stream: () => forkJoin({
      compras: this.comprasService.traerCompras(),
      proveedores: this.proveedoresService.traerProveedores()
    })
  });

  //traer compras o mostrar error
  comprasEffect = effect(() => {
    if (this.comprasResource.hasValue()) {
      const respuesta = this.comprasResource.value()
      if (typeof respuesta.compras === 'string') return ToastError(respuesta.compras)
      if (typeof respuesta.proveedores === 'string') return ToastError(respuesta.proveedores)
    }
  })


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

  // cuando cambie el computed() filtroCompra
  filtradosEffect = effect(() => {
    this.filtradas.set(this.filtroCompra());
  });

  //cambio filtrando
  busqueda(value: string) {
    this.filtrando.set(limpiarBusqueda(value));  //limpio el input y guardo el filtro
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.filtrando.set('')
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

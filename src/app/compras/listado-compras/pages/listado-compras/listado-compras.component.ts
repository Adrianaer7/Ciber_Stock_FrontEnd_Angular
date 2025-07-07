import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { Compra } from 'app/compras/interfaces/compras.interfaces';
import { ComprasService } from 'app/compras/services/compras.service';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { forkJoin } from 'rxjs';
import { CompraComponent } from '../../components/compra/compra.component';

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

  compras = this.comprasService.compras;
  proveedores = this.proveedoresService.proveedores
  usuario = this.authService.user


  comprasResource = rxResource({
    stream: () => forkJoin({
      compras: this.comprasService.traerFaltantes(),
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
  filtroFaltante = computed(() => {
    const palabras = this.filtrando()

    if (!palabras) return this.compras();

    const incluyeTodas = (descripcion: string, palabras: string): boolean => {
      return palabras
        .split(' ')
        .every(p => descripcion.includes(p));
    };

    return this.compras().filter(({ descripcion }) =>
      incluyeTodas(descripcion, palabras)
    );
  });

  // cuando cambie el computed() filtroFaltante
  filtradosEffect = effect(() => {
    this.filtradas.set(this.filtroFaltante());
  });

  //cambio filtrando
  busqueda(value: string) {
    this.filtrando.set(this.limpiarBusqueda(value));  //limpio el input y guardo el filtro
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.filtrando.set('')
    }
  }

  limpiarBusqueda(value: string): string {
    return value.toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }


}

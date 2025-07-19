import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { FaltantesService } from 'app/faltantes/services/faltantes.service';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { FaltanteComponent } from '../../component/faltante/faltante.component';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { forkJoin } from 'rxjs';

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


  faltantesResource = rxResource({
    stream: () => forkJoin({
      faltantes: this.faltantesService.traerFaltantes(),
      proveedores: this.proveedoresService.traerProveedores()
    })
  });

  //traer faltantes o mostrar error
  faltantesEffect = effect(() => {
    if (this.faltantesResource.hasValue()) {
      const respuesta = this.faltantesResource.value()
      if (typeof respuesta.faltantes === 'string') return ToastError(respuesta.faltantes)
      if (typeof respuesta.proveedores === 'string') return ToastError(respuesta.proveedores)
    }
  })


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

  // cuando cambie el computed() filtroFaltante
  filtradosEffect = effect(() => {
    this.filtrados.set(this.filtroFaltante());
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

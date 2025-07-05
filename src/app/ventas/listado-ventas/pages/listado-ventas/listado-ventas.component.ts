import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { Venta } from 'app/ventas/interfaces/ventas.interface';
import { VentasService } from 'app/ventas/services/ventas.service';
import { VentaComponent } from "../../components/venta/venta.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'listado-ventas',
  imports: [VentaComponent, CommonModule],
  templateUrl: './listado-ventas.component.html',
})
export class ListadoVentasComponent {
  ventaService = inject(VentasService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  filtradas = signal<Venta[]>([]);
  fechaDesde = signal('')
  fechaHasta = signal('')

  ventas = this.ventaService.ventas;
  ventaSeleccionada = this.ventaService.ventaSeleccionada;
  usuario = this.authService.user


  ventasResoruce = rxResource({
    stream: () => this.ventaService.traerVentas()
  })

  //traer ventas o mostrar error
  ventasEffect = effect(() => {
    if (this.ventasResoruce.hasValue()) {
      const respuesta = this.ventasResoruce.value()
      if (typeof respuesta === 'string') return ToastError(respuesta)
    }
  })

  //cargar el form con datos del venta a editar
  ventaSeleccionadaEffect = effect(() => {
    const venta = this.ventaSeleccionada();

  })

  //cuando cambie filtrando()
  filtroVenta = computed(() => {
    const palabras = this.filtrando().trim().toUpperCase(); // signal de texto
    const fechaDesde = this.fechaDesde(); // signal de fecha desde
    const fechaHasta = this.fechaHasta(); // signal de fecha hasta
    const ventas = this.ventas(); // signal con array de ventas

    const sinPalabras = !palabras;
    const sinFechas = !fechaDesde || !fechaHasta;

    if (sinPalabras && sinFechas) return [];

    const incluyeTodas = (descripcion: string): boolean => {
      return palabras
        .split(' ')
        .every(p => descripcion.toUpperCase().includes(p));
    };

    const enRangoDeFechas = (fecha: string): boolean => {
      if (sinFechas || fechaDesde > fechaHasta) return true;
      return fecha >= fechaDesde && fecha <= fechaHasta;
    };

    return ventas.filter(({ descripcion, fecha }) => {
      const pasaFiltroTexto = sinPalabras ? true : incluyeTodas(descripcion);
      const pasaFiltroFecha = enRangoDeFechas(fecha);
      return pasaFiltroTexto && pasaFiltroFecha;
    });
  });

  // cuando cambie el computed() filtroventa
  filtradosEffect = effect(() => {
    this.filtradas.set(this.filtroVenta());
  });

  //cambio filtrando
  busqueda(value: string) {
    this.filtrando.set(this.limpiarBusqueda(value));  //limpio el input y guardo el filtro
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.limpiarFiltro()
    }
  }

  limpiarFiltro() {
    this.filtrando.set('')
  }


  limpiarBusqueda(value: string): string {
    return value.toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }

}

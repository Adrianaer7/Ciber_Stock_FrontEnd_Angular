import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { Venta } from 'app/ventas/interfaces/ventas.interface';
import { VentasService } from 'app/ventas/services/ventas.service';
import { VentaComponent } from '../../components/venta/venta.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'listado-ventas',
  imports: [VentaComponent, CommonModule],
  templateUrl: './listado-ventas.component.html',
})
export class ListadoVentasComponent {
  ventaService = inject(VentasService);
  authService = inject(AuthService);

  filtrando = signal<string>('');
  filtradas = signal<Venta[]>([]);
  filter = signal<boolean>(false);
  fechaDesde = signal<string>('');
  fechaHasta = signal<string>('');

  ventas = this.ventaService.ventas;
  usuario = this.authService.user;

  ventasResoruce = rxResource({
    stream: () => this.ventaService.traerVentas(),
  });

  ventasEffect = effect(() => {
    if (this.ventasResoruce.hasValue()) {
      const respuesta = this.ventasResoruce.value();
      if (typeof respuesta === 'string') return ToastError(respuesta);
    }
  });

  filtradosEffect = effect(() => {
    const texto = this.limpiarBusqueda(this.filtrando());
    const ventas = this.ventas();
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    const tieneTexto = !!texto;
    const tieneFechas = !!desde && !!hasta; //que las dos variables contengan valores
    const fechasValidas = tieneFechas && desde <= hasta;  //que la fecha desde sea menor

    //si no hay ningun tipod de filtro puesto
    if (!tieneTexto && !tieneFechas) {
      this.filter.set(false);
      return;
    }

    const incluyeTodas = (desc: string) =>
      texto.split(' ')
        .every(p => desc.toUpperCase().includes(p));

    const enRangoDeFechas = (fecha: string) => !fechasValidas || (fecha >= desde && fecha <= hasta);  //si no es valida la fecha la función devuelve siempre true. Esto significa que no se filtra por fecha

    const ventasFiltradas = ventas.filter(({ descripcion, fecha }) => {
      const textoOk = tieneTexto ? incluyeTodas(descripcion) : true;  //va a devolver true siempre a menos que no encuentre la descripcion
      const fechaOk = tieneFechas ? enRangoDeFechas(fecha) : true;  //va a devoler true siempre a menos que la fecha de la venta no esté dentro del rango buscado
      return textoOk && fechaOk;  //agrega la venta al array si se cumplen las dos condiciones
    });

    this.filtradas.set(ventasFiltradas);
    this.filter.set(true);
  });

  busqueda(value: string) {
    this.filtrando.set(this.limpiarBusqueda(value));
  }

  limpiarBusqueda(value: string): string {
    return value.toUpperCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.filtrando.set('');
    }
  }

  vaciarFecha() {
    this.fechaDesde.set('');
    this.fechaHasta.set('');
  }
}

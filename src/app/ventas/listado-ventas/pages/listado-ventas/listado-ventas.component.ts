import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { ToastError } from '@constantes/general.constants';
import { AuthService } from 'app/auth/services/auth.service';
import { Venta } from 'app/ventas/interfaces/ventas.interface';
import { VentasService } from 'app/ventas/services/ventas.service';
import { VentaComponent } from '../../components/venta/venta.component';
import { limpiarBusqueda } from 'app/shared/utils/general.utils';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';

@Component({
  selector: 'listado-ventas',
  imports: [VentaComponent],
  templateUrl: './listado-ventas.component.html',
})
export class ListadoVentasComponent {
  ventaService = inject(VentasService);
  authService = inject(AuthService);

  filtrando = signal<string>('');
  fechaDesde = signal<string>('');
  fechaHasta = signal<string>('');

  ventas = this.ventaService.ventas;
  usuario = this.authService.user;

  ventasResource = httpResource<{ ventas: Venta[] }>(
    () => `${environment.backendURL}/ventas`,
  );

  ventasLoadEffect = effect(() => {
    if (this.ventasResource.hasValue()) {
      this.ventaService.ventas.set(this.ventasResource.value()!.ventas);
    }
    const error = this.ventasResource.error();
    if (error) {
      ToastError(getHttpResourceErrorMessage(error));
    }
  });

  filter = computed(() => {
    const texto = limpiarBusqueda(this.filtrando());
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();
    const tieneTexto = !!texto;
    const tieneFechas = !!desde && !!hasta;
    return tieneTexto || (tieneFechas && desde <= hasta);
  });

  filtradas = computed(() => {
    const texto = limpiarBusqueda(this.filtrando());
    const ventas = this.ventas();
    const desde = this.fechaDesde();
    const hasta = this.fechaHasta();

    const tieneTexto = !!texto;
    const tieneFechas = !!desde && !!hasta;
    const fechasValidas = tieneFechas && desde <= hasta;

    if (!tieneTexto && !tieneFechas) {
      return [];
    }

    const incluyeTodas = (desc: string) =>
      texto.split(' ')
        .every(p => desc.toUpperCase().includes(p));

    const enRangoDeFechas = (fecha: string) => !fechasValidas || (fecha >= desde && fecha <= hasta);

    return ventas.filter(({ descripcion, fecha }) => {
      const textoOk = tieneTexto ? incluyeTodas(descripcion) : true;
      const fechaOk = tieneFechas ? enRangoDeFechas(fecha) : true;
      return textoOk && fechaOk;
    });
  });

  busqueda(value: string) {
    this.filtrando.set(limpiarBusqueda(value));
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

import { Component, computed, effect, inject, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { form, FormField, required, email, pattern } from '@angular/forms/signals';
import { ProveedoresService } from '../../../services/proveedores.service';
import { Proveedor } from '../../../interfaces/proveedores.interface';
import { FormUtils } from '../../../../shared/utils/forms.utils';
import { ProveedorComponent } from '../../components/proveedor/proveedor.component';
import { AuthService } from '../../../../auth/services/auth.service';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { AlertError } from '../../../constants/proveedor.constants';
import { firstValueFrom } from 'rxjs';
import { limpiarBusqueda } from 'app/shared/utils/general.utils';
import { environment } from 'environments/environment.development';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';
import { getFirstSignalFormError, touchAllFields } from 'app/shared/utils/signal-forms.utils';

@Component({
  selector: 'listado-proveedores',
  imports: [ProveedorComponent, FormField],
  templateUrl: './listado-proveedores.component.html'
})
export class ListadoProveedoresComponent {

  proveedorService = inject(ProveedoresService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  mostrarForm = signal<boolean>(false);
  crearNuevo = signal<boolean>(false);
  ordenAscendente = signal<boolean>(true);
  filtradosOrdenados = signal<Proveedor[]>([]);

  proveedores = this.proveedorService.proveedores;
  proveedorSeleccionado = this.proveedorService.proveedorSeleccionado;
  usuario = this.authService.user

  proveedoresResource = httpResource<{ proveedores: Proveedor[] }>(
    () => `${environment.backendURL}/proveedores`,
  );

  proveedoresLoadEffect = effect(() => {
    if (this.proveedoresResource.hasValue()) {
      this.proveedorService.proveedores.set(this.proveedoresResource.value()!.proveedores);
    }
    const error = this.proveedoresResource.error();
    if (error) {
      ToastError(getHttpResourceErrorMessage(error));
    }
  });

  proveedorModel = signal({
    nombre: '',
    empresa: '',
    telPersonal: '',
    telEmpresa: '',
    email: '',
  });

  proveedorForm = form(this.proveedorModel, (schema) => {
    required(schema.empresa, { message: 'El campo empresa es requerido' });
    pattern(schema.email, new RegExp(FormUtils.emailPattern), {
      message: 'El campo email no tiene un formato de correo electrónico válido',
    });
    email(schema.email, { message: 'El campo email no es un correo electrónico válido' });
  });

  proveedorSeleccionadoEffect = effect(() => {
    const proveedor = this.proveedorSeleccionado();
    if (proveedor._id) {
      this.mostrarForm.set(true);
      this.proveedorModel.set({
        nombre: proveedor.nombre || '',
        empresa: proveedor.empresa || '',
        telPersonal: proveedor.telPersonal || '',
        telEmpresa: proveedor.telEmpresa || '',
        email: proveedor.email || '',
      });
    }
  });

  filtroProveedor = computed(() => {
    const palabras = this.filtrando()
    if (!palabras) return [];

    const incluyeTodas = (datos: string, palabras: string): boolean => {
      return palabras
        .split(' ')
        .every(p => datos.includes(p));
    };

    return this.proveedores().filter(({ datos }) =>
      incluyeTodas(datos, palabras)
    );
  });

  filtrados = computed(() => {
    const ordenados = this.filtradosOrdenados();
    return ordenados.length ? ordenados : this.filtroProveedor();
  });

  busqueda(value: string) {
    this.filtrando.set(limpiarBusqueda(value));
    this.filtradosOrdenados.set([]);
  }

  manejarFiltro() {
    if (this.filtrando()) {
      this.limpiarFiltro()
    }
  }

  limpiarFiltro() {
    this.filtrando.set('')
    this.filtradosOrdenados.set([]);
  }

  switchMostrarForm() {
    if (this.mostrarForm()) {
      this.mostrarForm.set(false);
      this.crearNuevo.set(false);
      this.proveedorService.limpiarSeleccionado()
      this.proveedorModel.set({ nombre: '', empresa: '', telPersonal: '', telEmpresa: '', email: '' });
    } else {
      this.mostrarForm.set(true)
      if (!this.crearNuevo()) {
        this.crearNuevo.set(true);
        this.proveedorService.limpiarSeleccionado()
        this.proveedorModel.set({ nombre: '', empresa: '', telPersonal: '', telEmpresa: '', email: '' });
      }
    }
  }


  async onSubmit() {
    touchAllFields([
      this.proveedorForm.nombre,
      this.proveedorForm.empresa,
      this.proveedorForm.telPersonal,
      this.proveedorForm.telEmpresa,
      this.proveedorForm.email,
    ]);

    if (this.proveedorForm().invalid()) {
      const primerError = getFirstSignalFormError(this.proveedorForm, [
        { path: this.proveedorForm.empresa, name: 'empresa' },
        { path: this.proveedorForm.email, name: 'email' },
      ]);
      if (primerError?.includes('empresa')) AlertError();
      return;
    }

    if (this.crearNuevo()) {
      let nuevoProveedor: Proveedor = this.estructurarProveedor()
      nuevoProveedor.datos = this.cargarDatos(nuevoProveedor);

      try {
        await firstValueFrom(this.proveedorService.crearProveedor(nuevoProveedor))
        this.proveedorModel.set({ nombre: '', empresa: '', telPersonal: '', telEmpresa: '', email: '' });
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        ToastExito(AGREGAR_EXITO)
      } catch (error) {
        ToastError(error as string)
        return
      }
    }

    if (this.proveedorSeleccionado()?._id) {
      let proveedorEditado: Proveedor = this.estructurarProveedor()
      proveedorEditado.datos = this.cargarDatos(proveedorEditado);

      try {
        await firstValueFrom(this.proveedorService.editarProveedor(proveedorEditado))
        this.proveedorModel.set({ nombre: '', empresa: '', telPersonal: '', telEmpresa: '', email: '' });
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        ToastExito(AGREGAR_EXITO)
      } catch (error) {
        ToastError(error as string)
      }
    }
  }

  estructurarProveedor() {
    const { nombre, empresa, telPersonal, telEmpresa, email } = this.proveedorModel();
    return {
      _id: this.proveedorSeleccionado()?._id || '',
      nombre,
      empresa,
      telPersonal,
      telEmpresa,
      email,
      datos: '',
      creador: this.usuario()?._id || ''
    }
  }

  cargarDatos(proveedor: Proveedor): string {
    return `${proveedor.nombre}${proveedor.empresa}${proveedor.telPersonal}${proveedor.telEmpresa}${proveedor.email}`.toUpperCase()
  }

  ordenarPor() {
    const comparar = (a: Proveedor, b: Proveedor) => {
      const valorA = (a.empresa || '');
      const valorB = (b.empresa || '');
      if (valorA > valorB) return 1;
      if (valorA < valorB) return -1;
      return 0;
    };

    const base = this.filtrando() ? this.filtroProveedor() : this.proveedores();
    const resultado = [...base].sort((a: Proveedor, b: Proveedor) =>
      this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
    );

    if (this.filtrando()) {
      this.filtradosOrdenados.set(resultado);
    } else {
      this.proveedores.set(resultado);
    }
    this.ordenAscendente.set(!this.ordenAscendente());
  }
}

import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProveedoresService } from '../../../services/proveedores.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { Proveedor } from '../../../interfaces/proveedores.interface';
import { FormUtils } from '../../../../shared/utils/forms.utils';
import { ProveedorComponent } from '../../components/proveedor/proveedor.component';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../../auth/services/auth.service';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { AlertError } from '../../../constants/proveedor.constants';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'listado-proveedores',
  imports: [ProveedorComponent, ReactiveFormsModule],
  templateUrl: './listado-proveedores.component.html'
})
export class ListadoProveedoresComponent {

  fb = inject(FormBuilder)
  proveedorService = inject(ProveedoresService)
  authService = inject(AuthService)
  filtrando = signal<string>('');
  filtrados = signal<Proveedor[]>([]);
  mostrarForm = signal<boolean>(false);
  crearNuevo = signal<boolean>(false);
  ordenAscendente = signal<boolean>(true);

  proveedores = this.proveedorService.proveedores;
  proveedorSeleccionado = this.proveedorService.proveedorSeleccionado;
  usuario = this.authService.user


  proveedoresResoruce = rxResource({
    stream: () => this.proveedorService.traerProveedores()
  })

  //traer proveedores o mostrar error
  proveedoresEffect = effect(() => {
    if (this.proveedoresResoruce.hasValue()) {
      const respuesta = this.proveedoresResoruce.value()
      if (typeof respuesta === 'string') return ToastError(respuesta)
    }
  })

  //cargar el form con datos del proveedor a editar
  proveedorSeleccionadoEffect = effect(() => {
    const proveedor = this.proveedorSeleccionado();
    if (proveedor._id) {
      this.mostrarForm.set(true);
      this.formProveedor.patchValue({
        nombre: proveedor.nombre || '',
        empresa: proveedor.empresa || '',
        telPersonal: proveedor.telPersonal || '',
        telEmpresa: proveedor.telEmpresa || '',
        email: proveedor.email || ''
      });
    }

  })

  formProveedor = this.fb.group({
    nombre: [''],
    empresa: ['', Validators.required],
    telPersonal: [''],
    telEmpresa: [''],
    email: ['', Validators.pattern(FormUtils.emailPattern)]
  })

  //cuando cambie filtrando()
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

  // cuando cambie el computed() filtroProveedor
  filtradosEffect = effect(() => {
    this.filtrados.set(this.filtroProveedor());
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

  switchMostrarForm() {
    if (this.mostrarForm()) {
      this.mostrarForm.set(false);
      this.crearNuevo.set(false);
      this.proveedorService.limpiarSeleccionado()
      this.formProveedor.reset();
    } else {
      this.mostrarForm.set(true)
      if (!this.crearNuevo()) {
        this.crearNuevo.set(true);
        this.proveedorService.limpiarSeleccionado()
        this.formProveedor.reset();
      }
    }
  }


  async onSubmit() {
    await this.validoCampos()
    if (!this.formProveedor.valid) return;

    //CREAR NUEVO
    if (this.crearNuevo()) {
      let nuevoProveedor: Proveedor = this.estructurarProveedor()
      nuevoProveedor.datos = this.cargarDatos(nuevoProveedor);

      //llamar al endpoint para crear un nuevo proveedor
      try {
        await firstValueFrom(this.proveedorService.crearProveedor(nuevoProveedor))
        this.formProveedor.reset();
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        ToastExito(AGREGAR_EXITO)
      } catch (error) {
        ToastError(error as string)
        return
      }
    }
    //EDITAR 
    if (this.proveedorSeleccionado()?._id) {
      let proveedorEditado: Proveedor = this.estructurarProveedor()
      proveedorEditado.datos = this.cargarDatos(proveedorEditado);

      //llamar al endpoint para editar el proveedor seleccionado
      try {
        await firstValueFrom(this.proveedorService.editarProveedor(proveedorEditado))
        this.formProveedor.reset();
        this.mostrarForm.set(false);
        this.crearNuevo.set(false);
        ToastExito(AGREGAR_EXITO)
      } catch (error) {
        ToastError(error as string)
      }
    }
  }

  estructurarProveedor() {
    return {
      _id: this.proveedorSeleccionado()?._id || '',
      nombre: this.formProveedor.get('nombre')?.value || '',
      empresa: this.formProveedor.get('empresa')?.value || '',
      telPersonal: this.formProveedor.get('telPersonal')?.value || '',
      telEmpresa: this.formProveedor.get('telEmpresa')?.value || '',
      email: this.formProveedor.get('email')?.value || '',
      datos: '',
      creador: this.usuario()?._id || ''
    }
  }


  async validoCampos() {
    const empresa = this.formProveedor.get('empresa')?.value;
    if (!empresa) AlertError()
  }

  cargarDatos(proveedor: Proveedor): string {
    return `${proveedor.nombre}${proveedor.empresa}${proveedor.telPersonal}${proveedor.telEmpresa}${proveedor.email}`.toUpperCase()
  }

  limpiarBusqueda(value: string): string {
    return value.toUpperCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  }

  ordenarPor() {
    let resultado: Proveedor[] = [];
    const comparar = (a: Proveedor, b: Proveedor) => {
      const valorA = (a.empresa || '');  //obtengo el valor del campo
      const valorB = (b.empresa || '');
      if (valorA > valorB) return 1;  //valorA tiene que ir despues de valorB
      if (valorA < valorB) return -1; //valorA tiene que ir antes de valorB
      return 0; //si valorA y valorB son iguales, dejo como están
    };

    if (this.filtrados().length) {
      resultado = [...this.filtrados()].sort((a: Proveedor, b: Proveedor) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)  //seria como this.ordenAscendente() ? 1 : -1
      );
      this.filtrados.set(resultado);
    } else {
      resultado = [...this.proveedores()].sort((a: Proveedor, b: Proveedor) =>
        this.ordenAscendente() ? comparar(a, b) : comparar(b, a)
      );
      this.proveedores.set(resultado);
    }
    this.ordenAscendente.set(!this.ordenAscendente());
  }
}

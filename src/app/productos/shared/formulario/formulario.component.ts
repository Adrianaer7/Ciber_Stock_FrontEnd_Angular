import { formatImport } from './../../../shared/utils/general.utils';
import { CommonModule } from '@angular/common';
import { httpResource } from '@angular/common/http';
import { Component, computed, effect, ElementRef, inject, input, signal, ViewChild } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';
import { AGREGAR_EXITO, EDITAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { ComprasService } from 'app/compras/services/compras.service';
import { ModalError, ModalInfo, PRODUCTO_VACIO } from 'app/productos/constants/productos.constants';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { ProductosService } from 'app/productos/services/productos.service';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { RubrosService } from 'app/rubros/services/rubros.service';
import { hoy } from 'app/shared/utils/general.utils';
import { getHttpResourceErrorMessage } from 'app/shared/utils/http-resource.utils';
import { environment } from 'environments/environment.development';
import { firstValueFrom } from 'rxjs';
import { SweetAlertResult } from 'sweetalert2';
import { Compra } from 'app/compras/interfaces/compras.interface';
import { Rubro } from 'app/rubros/interfaces/rubros.intefaces';

type ProductoFormModel = Omit<Producto, 'valor_dolar_compra' | 'precio_compra_dolar' | 'precio_compra_peso' | 'precio_venta' | 'limiteFaltante'> & {
  valor_dolar_compra: string;
  precio_compra_dolar: string;
  precio_compra_peso: string;
  precio_venta: string;
  limiteFaltante: string;
};

function toFormModel(producto: Producto): ProductoFormModel {
  return {
    ...producto,
    valor_dolar_compra: String(producto.valor_dolar_compra || ''),
    precio_compra_dolar: String(producto.precio_compra_dolar || ''),
    precio_compra_peso: String(producto.precio_compra_peso || ''),
    precio_venta: String(producto.precio_venta || ''),
    limiteFaltante: String(producto.limiteFaltante || ''),
  };
}

const PRODUCTO_FORM_VACIO = toFormModel(PRODUCTO_VACIO);

@Component({
  selector: 'formulario',
  imports: [CommonModule, FormField],
  templateUrl: './formulario.component.html',
})
export class FormularioComponent {
  formatImport = formatImport
  productoEditar = input<Producto>(PRODUCTO_VACIO);
  productosService = inject(ProductosService);
  proveedoresService = inject(ProveedoresService);
  comprasService = inject(ComprasService);
  rubrosService = inject(RubrosService);

  productos = this.productosService.productos;
  proveedores = this.proveedoresService.proveedores;
  compras = this.comprasService.compras;
  rubros = this.rubrosService.rubros;
  codigos = this.productosService.codigos;

  @ViewChild('inputImagen') inputImagen!: ElementRef<HTMLInputElement>;
  valorFaltante = signal<boolean>(false);
  formData = new FormData()
  disponibles = signal<string>('');
  proveedoresProducto = signal<Proveedor[]>([]);
  tempImages = signal<string[]>([]);
  imageFileList: FileList | undefined = undefined;
  urlImagen = signal('')
  codigo = signal<string>('')
  selectorCodigo = signal<string>('VACÍO');

  productoModel = signal<ProductoFormModel>({ ...PRODUCTO_FORM_VACIO });
  productoForm = form(this.productoModel);
  anadirFaltanteActivo = computed(() => this.productoModel().añadirFaltante);
  precioVentaFormateado = computed(() => formatImport(Number(this.productoModel().precio_venta) || 0));

  productosResource = httpResource<{ productos: Producto[] }>(
    () => `${environment.backendURL}/productos`,
  );
  proveedoresResource = httpResource<{ proveedores: Proveedor[] }>(
    () => `${environment.backendURL}/proveedores`,
  );
  comprasResource = httpResource<{ todas: Compra[] }>(
    () => `${environment.backendURL}/compras`,
  );
  rubrosResource = httpResource<{ rubros: Rubro[] }>(
    () => `${environment.backendURL}/rubros`,
  );
  codigosResource = httpResource<{ codigosDisponibles: number[] }>(
    () => `${environment.backendURL}/codigos`,
  );

  datosLoadEffect = effect(() => {
    if (this.productosResource.hasValue()) {
      this.productosService.productos.set(this.productosResource.value()!.productos);
    }
    if (this.proveedoresResource.hasValue()) {
      this.proveedoresService.proveedores.set(this.proveedoresResource.value()!.proveedores);
    }
    if (this.comprasResource.hasValue()) {
      this.comprasService.compras.set(this.comprasResource.value()!.todas);
    }
    if (this.rubrosResource.hasValue()) {
      this.rubrosService.rubros.set(this.rubrosResource.value()!.rubros);
    }
    if (this.codigosResource.hasValue()) {
      this.productosService.codigos.set(this.codigosResource.value()!.codigosDisponibles);
    }

    for (const resource of [
      this.productosResource,
      this.proveedoresResource,
      this.comprasResource,
      this.rubrosResource,
      this.codigosResource,
    ]) {
      const error = resource.error();
      if (error) {
        ToastError(getHttpResourceErrorMessage(error));
      }
    }
  });

  productoEditarEffect = effect(() => {
    this.productoModel.set(toFormModel(this.productoEditar()));
    if (this.productoEditar()._id) {
      this.codigo.set(this.productoEditar().codigo.toString());
      this.selectorCodigo.set(this.codigo());
    }
    const todosProveedores = this.productoEditar().todos_proveedores ?? [];
    const proveedoresFiltrados = this.proveedores().filter(
      proveedor => proveedor._id && todosProveedores.includes(proveedor._id)
    );
    this.proveedoresProducto.set(proveedoresFiltrados);
    if (this.productoEditar().imagen) {
      this.urlImagen.set(`${environment.backendURL}/static/productos/${this.productoEditar().imagen}`);
    }
  });

  precioVentaEffect = effect(() => {
    const { valor_dolar_compra, precio_compra_dolar, precio_compra_peso, rubro, precio_venta } = this.productoModel();
    const rentabilidad = Number(this.rubros().find(r => r.nombre === rubro)?.rentabilidad) || 0;
    const valorDolar = Number(valor_dolar_compra) || 0;
    const precioDolar = Number(precio_compra_dolar) || 0;
    const precioPeso = Number(precio_compra_peso) || 0;

    let nuevoPrecio = 0;
    if (valorDolar > 0 && precioDolar > 0 && rentabilidad > 0 && precioPeso === 0) {
      nuevoPrecio = (valorDolar * precioDolar * (100 + rentabilidad)) / 100;
    }
    if (precioPeso > 0 && rentabilidad > 0 && valorDolar > 0 && precioDolar === 0) {
      nuevoPrecio = (precioPeso * (100 + rentabilidad)) / 100;
    }

    const rounded = Number(nuevoPrecio.toFixed(2));
    if (String(rounded) !== precio_venta) {
      this.productoModel.update(m => ({ ...m, precio_venta: String(rounded) }));
    }
  });

  unidadesFaltantesEffect = effect(() => {
    const { añadirFaltante, limiteFaltante } = this.productoModel();
    if (!añadirFaltante && limiteFaltante !== '0' && limiteFaltante !== '') {
      this.productoModel.update(m => ({ ...m, limiteFaltante: '0' }));
    }
  });

  valorRubroEffect = effect(() => {
    const rubro = this.productoModel().rubro;
    const rubroEncontrado = this.rubros().find(r => r.nombre === rubro);
    const rentabilidad = rubroEncontrado?.rentabilidad ?? 0;
    if (this.productoModel().rubroValor !== rentabilidad) {
      this.productoModel.update(m => ({ ...m, rubroValor: rentabilidad }));
    }
  });

  cambioDeCodigo(value: string) {
    this.productoModel.update(m => ({ ...m, codigo: Number(value) }));
    this.selectorCodigo.set(value);
  }

  toggleAnadirFaltante() {
    this.productoModel.update(m => ({ ...m, añadirFaltante: !m.añadirFaltante }));
  }

  toggleVisibilidad() {
    this.productoModel.update(m => ({ ...m, visibilidad: !m.visibilidad }));
  }

  eliminarProveedor(id: string) {
    this.proveedoresProducto.update(proveedores => proveedores.filter(proveedor => proveedor._id !== id));
    this.productoModel.update(m => {
      const provRestantes = (m.todos_proveedores ?? []).filter(proveedorId => proveedorId !== id);
      return {
        ...m,
        todos_proveedores: provRestantes,
        proveedor: provRestantes.length ? provRestantes[provRestantes.length - 1] : '',
      };
    });
  }

  nuevaImagen(event: Event) {
    this.limpiarImagenProducto()
    const fileList = (event.target as HTMLInputElement).files;
    this.imageFileList = fileList ?? undefined;

    const imageUrls = Array.from(fileList ?? []).map((file) =>
      URL.createObjectURL(file)
    );
    this.tempImages.set(imageUrls);
    this.inputImagen.nativeElement.value = '';
  }

  limpiarImagenTemporal() {
    this.formData = new FormData();
    this.imageFileList = undefined
    this.tempImages.update(() => [])
  }

  limpiarImagenProducto() {
    this.productoModel.update(m => ({ ...m, imagen: '' }));
    this.urlImagen.set('');
    this.productoEditar().imagen = ''
  }

  async onSubmit(): Promise<void | SweetAlertResult<any>> {
    const producto = this.validarCampos();
    if (!producto) return;

    if (this.productoEditar()._id) {
      await this.submitEditarProducto(producto);
    } else {
      await this.submitAgregarProducto(producto);
    }
  }

  async submitEditarProducto(producto: Producto): Promise<void> {
    try {
      const prodString = JSON.stringify(producto);
      const prodEditarString = JSON.stringify(this.productoEditar());

      const sinCambios = (prodString === prodEditarString) && !this.imageFileList?.length && !this.disponibles();
      if (sinCambios) {
        ModalInfo();
        return;
      }

      const productoEditado = await this.editarProducto(producto);
      ToastExito(EDITAR_EXITO);

      await firstValueFrom(this.productosService.traerCodigos());

      this.productoModel.set(toFormModel(productoEditado));

      const proveedoresFiltrados = this.proveedores().filter(
        p => p._id && productoEditado.todos_proveedores.includes(p._id)
      );
      this.proveedoresProducto.set(proveedoresFiltrados);

      if (productoEditado.imagen) {
        this.urlImagen.set(`${environment.backendURL}/static/productos/${productoEditado.imagen}`);
      }

      this.limpiarImagenTemporal();
      this.disponibles.set('');
    } catch (error) {
      ToastError(error as string);
    }
  }

  async submitAgregarProducto(producto: Producto): Promise<void> {
    try {
      await this.agregarProducto(producto);
      ToastExito(AGREGAR_EXITO);

      await firstValueFrom(this.productosService.traerCodigos());

      this.productoModel.set({ ...PRODUCTO_FORM_VACIO });
      this.valorFaltante.set(false);
      this.limpiarImagenTemporal();
      this.codigo.set('');
      this.selectorCodigo.set('VACÍO');
      this.disponibles.set('');
    } catch (error) {
      ToastError(error as string);
    }
  }

  formatearHTML(campo: string): string {
    switch (campo) {
      case "nombre":
        return '<p style="color:#545454">El <b>nombre</b> es obligatorio.</p>';
      case "codigo":
        return '<p style="color:#545454">Ingresa un <b>código</b> válido</p>'
      case "disponibles":
        return '<p style="color:#545454">La <b>cantidad</b> de productos a ingresar debe ser un número entero mayor a 0.</p>'
      case "todosLosPrecios":
        return '<p style="color:#545454">Ingresa una <b>cotización U$S</b> correcta.</p>'
      case "preciosDobles":
        return '<p style="color:#545454">Solo puedes ingresar un tipo de precio de compra.</p>'
      case "precio_compra_dolar":
        return '<p style="color:#545454">Ingresa un <b>precio de compra en dólares</b> correcto.</p>'
      case "precio_compra_peso":
        return '<p style="color:#545454">Ingresa un <b>precio de compra en pesos</b> correcto.</p>'
      case "valorDeVenta":
        return '<p style="color:#545454">El <b>precio de venta</b> es inválido.</p>'
      case "limiteFaltante":
        return '<p style="color:#545454">El <b>limite de faltantes</b> es inválido.</p>'
      default: return '<p style="color:#545454">Campo inválido</p>'
    }
  }

  validarCampos(): Producto | undefined {
    const modelo = this.productoModel();
    const nombre = modelo.nombre;
    const codigo = Number(modelo.codigo);
    const valorDeVenta = Number(modelo.precio_venta) || 0;
    const valor_dolar_compra = Number(modelo.valor_dolar_compra) || 0;
    const precio_compra_dolar = Number(modelo.precio_compra_dolar) || 0;
    const precio_compra_peso = Number(modelo.precio_compra_peso) || 0;
    const limiteFaltante = Number(modelo.limiteFaltante) || 0;
    const proveedor = modelo.proveedor ?? '';
    const proveedores = modelo.todos_proveedores ?? [];
    const disponibles = Number(this.disponibles()) || 0

    if (!nombre) {
      ModalError(this.formatearHTML('nombre'));
      return
    }
    if (!codigo || codigo < 1 || Number.isNaN(codigo) || !Number.isInteger(codigo) || codigo > 999) {
      ModalError(this.formatearHTML('codigo'));
      return
    }
    if (disponibles < 0 || Number.isNaN(disponibles) || !Number.isInteger(disponibles)) {
      ModalError(this.formatearHTML('disponibles'));
      return
    }

    if (!valorDeVenta && (Number.isNaN(valor_dolar_compra) || (valor_dolar_compra !== 0 && valor_dolar_compra < 1))) {
      ModalError(this.formatearHTML('todosLosPrecios'));
      return
    }
    if (precio_compra_dolar && precio_compra_peso) {
      ModalError(this.formatearHTML('preciosDobles'));
      return
    }
    if (Number.isNaN(precio_compra_dolar) || precio_compra_dolar < 0) {
      ModalError(this.formatearHTML('precio_compra_dolar'));
      return
    }
    if (Number.isNaN(precio_compra_peso) || precio_compra_peso < 0) {
      ModalError(this.formatearHTML('precio_compra_peso'));
      return
    }
    if (Number.isNaN(valorDeVenta) || valorDeVenta < 0) {
      ModalError(this.formatearHTML('valorDeVenta'));
      return
    }
    if (Number.isNaN(limiteFaltante) || limiteFaltante < 0 || !Number.isInteger(limiteFaltante)) {
      ModalError(this.formatearHTML('limiteFaltante'));
      return
    }

    return this.darFormato({
      codigo,
      proveedor,
      proveedores,
      disponibles,
      valor_dolar_compra,
      precio_compra_dolar,
      precio_compra_peso,
      limiteFaltante
    })
  }

  darFormato(param: {
    codigo: number;
    proveedor: string;
    proveedores: string[];
    disponibles: number;
    valor_dolar_compra: number;
    precio_compra_dolar: number;
    precio_compra_peso: number;
    limiteFaltante: number;
  }): Producto {
    const { codigo, proveedor, proveedores, disponibles, valor_dolar_compra, precio_compra_dolar, precio_compra_peso, limiteFaltante } = param;

    let todosProveedores = [...proveedores];
    if (proveedor) {
      if (this.productoEditar()._id) {
        const proveedorIgual = proveedores.find((p: string) => p === proveedor);
        if (!proveedorIgual) {
          todosProveedores = [...proveedores, proveedor];
        }
      } else {
        todosProveedores = [proveedor];
      }
    }

    if (this.imageFileList && this.imageFileList.length > 0 && !Array.from(this.formData.entries()).length) {
      this.formData.append('archivo', this.imageFileList?.[0])
    }

    const base = this.productoModel();
    const producto: Producto = {
      ...base,
      todos_proveedores: todosProveedores,
      codigo,
      valor_dolar_compra,
      precio_compra_dolar,
      limiteFaltante,
      precio_compra_peso,
      precio_venta: Number(base.precio_venta) || 0,
    };

    if (disponibles > 0) {
      producto.disponibles = disponibles + base.disponibles;
    }

    return producto
  }

  async agregarProducto(producto: Producto) {
    return firstValueFrom(this.productosService.agregarProducto(producto, Number(this.disponibles()), this.formData))
  }

  async editarProducto(producto: Producto) {
    return firstValueFrom(this.productosService.editarProducto(producto, Number(this.disponibles()), this.formData))
  }
}

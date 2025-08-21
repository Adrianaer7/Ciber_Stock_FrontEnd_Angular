import { formatImport } from './../../../shared/utils/general.utils';
import { CommonModule } from '@angular/common';
import { Component, effect, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { ComprasService } from 'app/compras/services/compras.service';
import { ModalError, PRODUCTO_VACIO } from 'app/productos/constants/productos.constants';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { ProductosService } from 'app/productos/services/productos.service';
import { Proveedor } from 'app/proveedores/interfaces/proveedores.interface';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { RubrosService } from 'app/rubros/services/rubros.service';
import { hoy } from 'app/shared/utils/general.utils';
import { environment } from 'environments/environment.development';
import { forkJoin, merge } from 'rxjs';
import { SweetAlertResult } from 'sweetalert2';


@Component({
  selector: 'formulario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario.component.html',
})
export class FormularioComponent {
  formatImport = formatImport
  fb = inject(FormBuilder);
  productoEditar = input<Producto>(PRODUCTO_VACIO)
  productosService = inject(ProductosService);
  proveedoresService = inject(ProveedoresService);
  comprasService = inject(ComprasService);
  rubrosService = inject(RubrosService);


  productos = this.productosService.productos;
  proveedores = this.proveedoresService.proveedores;
  compras = this.comprasService.compras;
  rubros = this.rubrosService.rubros;
  codigos = this.productosService.codigos;

  valorFaltante = signal<boolean>(false);
  desdeForm: boolean = true;
  formData: FormData = new FormData()
  disponibles: number = 0
  proveedoresProducto = signal<Proveedor[]>([]);
  tempImages = signal<string[]>([]); //para mostrar las imagenes que se suben antes de guardar el producto
  imageFileList: FileList | undefined = undefined; 
  urlImagen = signal('')

  formularioResource = rxResource({
    stream: () => forkJoin({
      productos: this.productosService.traerProductos(),
      proveedores: this.proveedoresService.traerProveedores(),
      compras: this.comprasService.traerCompras(),
      rubros: this.rubrosService.traerRubros(),
      codigos: this.productosService.traerCodigos(),
    },
    )
  })

  formularioEffect = effect(() => {
    if (this.formularioResource.hasValue()) {
      const respuesta = this.formularioResource.value();
      if (typeof respuesta.productos === 'string') return ToastError(respuesta.productos)
      if (typeof respuesta.proveedores === 'string') return ToastError(respuesta.proveedores)
      if (typeof respuesta.compras === 'string') return ToastError(respuesta.compras)
      if (typeof respuesta.rubros === 'string') return ToastError(respuesta.rubros)
    }
  })

  productoEditarEffect = effect(() => {
    this.formProducto.patchValue(this.productoEditar())
    const todosProveedores = this.productoEditar().todos_proveedores ?? [];
    const proveedoresFiltrados = this.proveedores().filter(
      proveedor => proveedor._id && todosProveedores.includes(proveedor._id)
    );
    this.proveedoresProducto.set(proveedoresFiltrados)
    if(this.productoEditar().imagen) {
      this.urlImagen.set(`${environment.backendURL}/static/productos/${this.productoEditar().imagen}`);
    }
  })

  formProducto = this.fb.group({
    _id: [''],
    nombre: [''],
    marca: [''],
    modelo: [''],
    codigo: [0],
    barras: [''],
    rubro: [''],
    rubroValor: [0],
    precio_venta: [0],
    precio_venta_conocidos: [0],
    precio_venta_efectivo: [0],
    precio_venta_tarjeta: [0],
    precio_venta_ahoraDoce: [0],
    precio_venta_cuotas: [0],
    precio_compra_dolar: [0],
    precio_compra_peso: [0],
    valor_dolar_compra: [0],
    proveedor: [''],
    todos_proveedores: [['']],
    factura: [''],
    garantia: [''],
    fecha_compra: [hoy],
    disponibles: [0],
    imagen: [''],
    notas: [''],
    faltante: [false],
    limiteFaltante: [0],
    añadirFaltante: [false],
    visibilidad: [true],
    creado: [''],
    creador: [''],
    descripcion: [''],
  })


  valorDeVentaEffect = effect(() => {
    //detecto cambios en los campos de precio y rubro
    merge(
      this.formProducto.get('valor_dolar_compra')!.valueChanges,
      this.formProducto.get('precio_compra_dolar')!.valueChanges,
      this.formProducto.get('precio_compra_peso')!.valueChanges,
      this.formProducto.get('rubro')!.valueChanges
    ).subscribe(() => this.actualizarPrecioVenta());
  });



  //si no quiero añadir faltante, entonces el limite de faltante se pone en vacio
  unidadesFaltantesEffect = effect(() => {
    this.formProducto.get('añadirFaltante')!.valueChanges.subscribe(() => {
      if (!this.formProducto.get('añadirFaltante')?.value) {
        this.formProducto.get('limiteFaltante')?.setValue(0);
      }
    })
  })

  //cuando cambio el rubro, actualizo rubroValor
  valorRubroEffect = effect(() => {
    this.formProducto.get('rubro')!.valueChanges.subscribe((rubro) => {
      const rubroEncontrado = this.rubros().find(r => r.nombre === rubro);
      if (rubroEncontrado) {
        this.formProducto.get('rubroValor')?.setValue(rubroEncontrado.rentabilidad);
      } else {
        this.formProducto.get('rubroValor')?.setValue(0);
      }
    });
  })

  actualizarPrecioVenta(): void {
    const valorDolar = Number(this.formProducto.get('valor_dolar_compra')?.value) || 0;
    const precioDolar = Number(this.formProducto.get('precio_compra_dolar')?.value) || 0;
    const precioPeso = Number(this.formProducto.get('precio_compra_peso')?.value) || 0;
    const rubro = this.formProducto.get('rubro')?.value;
    const rentabilidad = Number(this.rubros().find(r => r.nombre === rubro)?.rentabilidad) || 0;

    let precioVenta = 0;
    // Compra en dólares
    if (valorDolar > 0 && precioDolar > 0 && rentabilidad > 0 && precioPeso === 0) {
      const subtotal = valorDolar * precioDolar;
      precioVenta = (subtotal * (100 + rentabilidad)) / 100;
    }

    // Compra en pesos
    if (precioPeso > 0 && rentabilidad > 0 && valorDolar > 0 && precioDolar === 0) {
      precioVenta = (precioPeso * (100 + rentabilidad)) / 100;
    }
    this.formProducto.get('precio_venta')?.setValue(Number(precioVenta.toFixed(2)));
  }



  eliminarProveedor(id: string) {
    //actualizo la señal
    this.proveedoresProducto.update(proveedores => proveedores.filter(proveedor => proveedor._id !== id));
    //elimino de los proveedores del formulario
    const proveedoresForm = this.formProducto.get('todos_proveedores')?.value ?? [];
    const noEliminados = proveedoresForm.filter(proveedorId => proveedorId !== id);
    this.formProducto.get('todos_proveedores')?.setValue(noEliminados);
    this.formProducto.get('proveedor')?.setValue(noEliminados[noEliminados.length - 1]);
  }


  nuevaImagen(event: Event) {
    const fileList = (event.target as HTMLInputElement).files;  //obtiene los archivos seleccionados desde el input de tipo file
    this.imageFileList = fileList ?? undefined; //de momento permito subir solo una imagen pero lo dejo preparado para varias

    const imageUrls = Array.from(fileList ?? []).map((file) =>  //el array.from convierte el FileList a un arreglo de JS
      URL.createObjectURL(file)  //crea una URL temporal para cada archivo seleccionado
    );
    this.tempImages.set(imageUrls);  //actualiza las imagenes temporales con las URLs creadas
  }


  onSubmit(): void | Promise<SweetAlertResult<any>> {

    const producto = this.validarCampos()
    if (producto) {  //si se validó correctamente

      //si es producto nuevo
      if (!this.productoEditar()._id) { 
        this.productosService.agregarProducto(producto, producto.disponibles, this.desdeForm, this.formData).subscribe(res => {
          if (typeof res === 'string') return ToastError(res) //si hay error
          ToastExito(AGREGAR_EXITO)
          this.productosService.traerCodigos().subscribe()
        })
        this.formProducto.reset(PRODUCTO_VACIO)
        this.valorFaltante.set(false);
        this.imageFileList = undefined
        this.tempImages.set([])
        console.log(Object.entries(this.formProducto.value));
      } else {
        if (this.productoEditar().disponibles !== producto.disponibles) {
          this.disponibles = producto.disponibles
        }
        console.log(Object.entries(this.formProducto.value));
        /* this.productosService.editarProducto(producto, this.disponibles, this.desdeForm, this.formData).subscribe(res => {
          if (typeof res === 'string') return ToastError(res) //si hay error
          ToastExito(AGREGAR_EXITO)
          this.productosService.traerCodigos().subscribe()
          this.formData = new FormData();
          console.log(Object.entries(this.formProducto.value));

        }) */
      }
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

  validarCampos(): any {
    const nombre = this.formProducto.get('nombre')?.value;
    const codigo = Number(this.formProducto.get('codigo')?.value);
    const disponibles = Number(this.formProducto.get('disponibles')?.value) ?? 0;
    const valorDeVenta = Number(this.formProducto.get('precio_venta')?.value) ?? 0;
    const valor_dolar_compra = Number(this.formProducto.get('valor_dolar_compra')?.value) ?? 0;
    const precio_compra_dolar = Number(this.formProducto.get('precio_compra_dolar')?.value) ?? 0;
    const precio_compra_peso = Number(this.formProducto.get('precio_compra_peso')?.value) ?? 0;
    const limiteFaltante = Number(this.formProducto.get('limiteFaltante')?.value) ?? 0;
    const proveedor = this.formProducto.get('proveedor')?.value ?? '';
    const proveedores = this.formProducto.get('todos_proveedores')?.value ?? [];

    if (!nombre) {
      ModalError(this.formatearHTML('nombre'));
      return
    }
    if (!codigo || codigo < 1 || isNaN(codigo) || !Number.isInteger(codigo) || codigo > 999) {
      ModalError(this.formatearHTML('codigo'));
      return
    }
    if (disponibles < 0 || isNaN(disponibles) || !Number.isInteger(disponibles)) {
      ModalError(this.formatearHTML('disponibles'));
      return
    }

    if (!valorDeVenta && (isNaN(valor_dolar_compra) || (valor_dolar_compra !== 0 && valor_dolar_compra < 1))) {
      ModalError(this.formatearHTML('todosLosPrecios'));
      return
    }
    if (precio_compra_dolar && precio_compra_peso) {
      ModalError(this.formatearHTML('preciosDobles'));
      return
    }
    if (isNaN(precio_compra_dolar) || precio_compra_dolar < 0) {
      ModalError(this.formatearHTML('precio_compra_dolar'));
      return
    }
    if (isNaN(precio_compra_peso) || precio_compra_peso < 0) {
      ModalError(this.formatearHTML('precio_compra_peso'));
      return
    }
    if (isNaN(valorDeVenta) || valorDeVenta < 0) {
      ModalError(this.formatearHTML('valorDeVenta'));
      return
    }
    if (isNaN(limiteFaltante) || limiteFaltante < 0 || !Number.isInteger(limiteFaltante)) {
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


  darFormato(param: any): Producto {
    const { codigo, proveedor, proveedores, disponibles, valor_dolar_compra, precio_compra_dolar, precio_compra_peso, limiteFaltante } = param;
    if (proveedor) {
      if (!this.productoEditar()._id) { //si es producto nuevo
        this.formProducto.get('todos_proveedores')?.setValue([proveedor]);
      } else {
        const proveedorIgual = proveedores.find((p: string) => p === proveedor);
        if (!proveedorIgual) {
          this.formProducto.get('todos_proveedores')?.setValue([...proveedores, proveedor]);
        }
      }
    }

    if(this.imageFileList && this.imageFileList.length > 0) {
      this.formData.append('archivo', this.imageFileList?.[0])
    }

    const producto: Producto = this.formProducto.value as Producto;
    producto.codigo = codigo  // Asegurar que el código sea un número
    producto.valor_dolar_compra = valor_dolar_compra;
    producto.precio_compra_dolar = precio_compra_dolar;
    producto.limiteFaltante = limiteFaltante
    producto.precio_compra_peso = precio_compra_peso;
    if(this.productoEditar()._id) {
      producto.disponibles = Number(this.productoEditar().disponibles + disponibles)
    } else {
      producto.disponibles = Number(disponibles)
    }

    
    return producto
  }


}

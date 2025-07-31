import { CommonModule } from '@angular/common';
import { Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { AGREGAR_EXITO, ToastError, ToastExito } from '@constantes/general.constants';
import { ComprasService } from 'app/compras/services/compras.service';
import { ModalError, PRODUCTO_VACIO } from 'app/productos/constants/productos.constants';
import { Producto } from 'app/productos/interfaces/productos.interface';
import { ProductosService } from 'app/productos/services/productos.service';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { RubrosService } from 'app/rubros/services/rubros.service';
import { forkJoin, merge } from 'rxjs';
import { SweetAlertResult } from 'sweetalert2';

@Component({
  selector: 'formulario',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulario.component.html',
})
export class FormularioComponent {

  fb = inject(FormBuilder);
  productoEditar = signal<Producto>(PRODUCTO_VACIO)
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

  formularioResource = rxResource({
    stream: () => forkJoin({
      productos: this.productosService.traerProductos(),
      proveedores: this.proveedoresService.traerProveedores(),
      compras: this.comprasService.traerCompras(),
      rubros: this.rubrosService.traerRubros(),
      codigos: this.productosService.traerCodigos()
    }
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

  formProducto = this.fb.group({
    _id: [this.productoEditar()._id || ''],
    nombre: [this.productoEditar().nombre || ''],
    marca: [this.productoEditar().marca || ''],
    modelo: [this.productoEditar().modelo || ''],
    codigo: [this.productoEditar().codigo || ''],
    barras: [this.productoEditar().barras || ''],
    rubro: [this.productoEditar().rubro || ''],
    rubroValor: [this.productoEditar().rubroValor || 0],
    precio_venta: [this.productoEditar().precio_venta || 0],
    precio_venta_conocidos: [this.productoEditar().precio_venta_conocidos || 0],
    precio_venta_efectivo: [this.productoEditar().precio_venta_efectivo || 0],
    precio_venta_tarjeta: [this.productoEditar().precio_venta_tarjeta || 0],
    precio_venta_ahoraDoce: [this.productoEditar().precio_venta_ahoraDoce || 0],
    precio_venta_cuotas: [this.productoEditar().precio_venta_cuotas || 0],
    precio_compra_dolar: [this.productoEditar().precio_compra_dolar || 0],
    precio_compra_peso: [this.productoEditar().precio_compra_peso || 0],
    valor_dolar_compra: [this.productoEditar().valor_dolar_compra || 0],
    proveedor: [this.productoEditar().proveedor || ''],
    todos_proveedores: [this.productoEditar().todos_proveedores || []],
    factura: [this.productoEditar().factura || ''],
    garantia: [this.productoEditar().garantia || ''],
    fecha_compra: [this.productoEditar().fecha_compra],
    disponibles: [this.productoEditar().disponibles || 0],
    imagen: [this.productoEditar().imagen || ''],
    notas: [this.productoEditar().notas || ''],
    faltante: [this.productoEditar()?.faltante || false],
    limiteFaltante: [this.productoEditar().limiteFaltante || 0],
    añadirFaltante: [this.productoEditar()?.añadirFaltante || false],
    visibilidad: [this.productoEditar()?.visibilidad ?? true],
    creado: [this.productoEditar().creado || new Date()],
    creador: [this.productoEditar().creador || ''],
    descripcion: [this.productoEditar().descripcion || ''],
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

  onSubmit(): void | Promise<SweetAlertResult<any>> {
    const nombre = this.formProducto.get('nombre')?.value;
    const codigo = Number(this.formProducto.get('codigo')?.value);
    const disponibles = this.formProducto.get('disponibles')?.value ?? 0;
    const valorDeVenta = this.formProducto.get('precio_venta')?.value ?? 0;
    const valor_dolar_compra = this.formProducto.get('valor_dolar_compra')?.value ?? 0;
    const precio_compra_dolar = this.formProducto.get('precio_compra_dolar')?.value ?? 0;
    const precio_compra_peso = this.formProducto.get('precio_compra_peso')?.value ?? 0;
    const limiteFaltante = this.formProducto.get('limiteFaltante')?.value ?? 0;
    const proveedor = this.formProducto.get('proveedor')?.value ?? '';
    const proveedores = this.formProducto.get('todos_proveedores')?.value ?? [];

    //console.log(Object.entries(this.formProducto.value));

    if (!nombre) return ModalError(this.formatearHTML('nombre'));
    if (!codigo || codigo < 1 || isNaN(codigo) || !Number.isInteger(codigo) || codigo > 999) return ModalError(this.formatearHTML('codigo'));
    if (disponibles < 0 || isNaN(disponibles) || !Number.isInteger(disponibles)) return ModalError(this.formatearHTML('disponibles'));
    if (!valorDeVenta && (isNaN(valor_dolar_compra) || (valor_dolar_compra !== 0 && valor_dolar_compra < 1))) return ModalError(this.formatearHTML('todosLosPrecios'));
    if (precio_compra_dolar && precio_compra_peso) return ModalError(this.formatearHTML('preciosDobles'));
    if (isNaN(precio_compra_dolar) || precio_compra_dolar < 0) return ModalError(this.formatearHTML('precio_compra_dolar'));
    if (isNaN(precio_compra_peso) || precio_compra_peso < 0) return ModalError(this.formatearHTML('precio_compra_peso'));
    if (isNaN(valorDeVenta) || valorDeVenta < 0) return ModalError(this.formatearHTML('valorDeVenta'));
    if (isNaN(limiteFaltante) || limiteFaltante < 0 || !Number.isInteger(limiteFaltante)) return ModalError(this.formatearHTML('limiteFaltante'));

    if (proveedor) {
      if (!this.productoEditar()._id) {
        this.formProducto.get('todos_proveedores')?.setValue([proveedor]);
      } else {
        const proveedorIgual = proveedores.find(p => p === proveedor);
        if (!proveedorIgual) {
          this.formProducto.get('todos_proveedores')?.setValue([...proveedores, proveedor]);
        }
      }
    }

    //if(imagen) {}

    const producto: Producto = this.formProducto.value as Producto;
    producto.codigo = codigo  // Asegurar que el código sea un número
    console.log(producto)

    if (this.productoEditar()._id) {
      this.productosService.editarProducto(producto, disponibles, this.desdeForm, undefined);
    } else {
      this.productosService.agregarProducto(producto, disponibles, this.desdeForm, this.formData).subscribe(res => {
         if (typeof res === 'string') return ToastError(res) //si hay error
          this.formProducto.reset();
          this.valorFaltante.set(false);
          this.formData = new FormData();
          ToastExito(AGREGAR_EXITO)
      })
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
}

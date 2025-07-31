import { Component, computed, inject, input, signal } from '@angular/core';
import { Producto, Tipos } from '../../../interfaces/productos.interface';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { GarantiasService } from 'app/productos/services/garantias.service';
import { ProveedoresService } from 'app/proveedores/services/proveedores.service';
import { AGREGAR_EXITO, Copiado, ELIMINAR_EXITO, ModalCantidad, ToastError, ToastExito } from '@constantes/general.constants';
import { Clipboard } from '@angular/cdk/clipboard';
import { FaltantesService } from 'app/faltantes/services/faltantes.service';
import { ProductosService } from 'app/productos/services/productos.service';
import { ErrorCantidad, ErrorValor, ToastVentaExito } from 'app/productos/constants/productos.constants';
import { VentasService } from 'app/ventas/services/ventas.service';
import { Venta } from 'app/ventas/interfaces/ventas.interface';
import { DolaresService } from 'app/productos/services/dolares.service';
import { hoy } from '../../../../utils/general.utils';
import { ToastFaltanteExito } from 'app/faltantes/constants/faltantes.constants';

@Component({
  selector: 'producto',
  imports: [CommonModule, RouterLink],
  templateUrl: './producto.component.html',
})
export class ProductoComponent {

  clipboard = inject(Clipboard)
  garantiasService = inject(GarantiasService)
  proveedoresService = inject(ProveedoresService)
  faltantesService = inject(FaltantesService)
  productosService = inject(ProductosService)
  dolaresService = inject(DolaresService)
  ventasService = inject(VentasService)
  producto = input.required<Producto>()
  faltante = input.required<boolean>()
  resta = signal(0)
  cantidad = 0
  desdeForm = false

  proveedores = this.proveedoresService.proveedores
  garantias = this.garantiasService.garantias
  dolarDB = this.dolaresService.dolarDB


  colorFaltante = computed(() => this.faltante())

  todasGarantias = computed(() => {
    const garantias = this.garantias();
    const proveedores = this.proveedores();
    const productos = this.producto();

    if (!garantias || !proveedores || !productos) return [];

    const garantiaProducto = garantias.find(garantia => garantia.idProducto === productos._id); //garantia que coincide con el id de este producto
    if (!garantiaProducto) return [];

    return garantiaProducto.detalles.flatMap(detalle => //recorro el array de detalles
      proveedores.filter(prov => detalle.proveedor.includes(prov._id!)) //obtengo un nuevo array de proveedores que coinciden con los que hay en los detalles
        .map(prov => (  //recorro el array de proveedores recien creado y genero un nuevo array que contenga el nombre del proveedor y la garantia (que saco del detalle que estoy recorriendo)
          {
            proveedor: prov.empresa,
            garantia: detalle.caducidad
          }))
    );
  });

  private limpiarTexto(texto: string): string {
    return texto.trim().replace(/\s\s+/g, ' ');
  }

  private textoBase = computed(() =>
    this.limpiarTexto(`${this.producto().nombre} ${this.producto().marca ?? ''} ${this.producto().modelo ?? ''}`)
  );

  copiar(tipo: Tipos) {
    let texto = '';

    switch (tipo) {
      case 'tarjeta':
        texto = `${this.textoBase()} $${Math.round(this.producto().precio_venta_tarjeta)}`;
        break;
      case 'efectivo':
        texto = `${this.textoBase()} $${Math.round(this.producto().precio_venta_efectivo)}`;
        break;
      case 'conocidos':
        texto = `${this.textoBase()} $${Math.round(this.producto().precio_venta_conocidos)}`;
        break;
      case 'ahoraDoce':
        texto =
          `${this.textoBase()} Total final ahora 12: $${Math.round(this.producto().precio_venta_ahoraDoce)} - Valor de cada cuota: $${this.producto().precio_venta_cuotas}`;
        break;
    }

    this.clipboard.copy(this.limpiarTexto(texto));
    Copiado('¡copiado!')

  };



  copiarPrecioTarjeta() { }
  copiarPrecioEfectivo() { }
  copiarPrecioConocidos() { }
  copiarAhoraDoce() { }


  async venderElProducto() {
    const valor = await ModalCantidad()
    if (valor.isConfirmed) {
      //validaciones
      const unidades = Number(valor.value[0])
      if (unidades < 1 || !unidades || isNaN(unidades) || !Number.isInteger(unidades)) {
        await ErrorValor()
        this.venderElProducto()
        return
      }
      if (unidades > this.producto().disponibles) {
        await ErrorCantidad()
        this.venderElProducto()
        return
      }
      //editar producto
      this.producto().disponibles = this.producto().disponibles - unidades
      this.productosService.editarProducto(this.producto(), this.cantidad, this.desdeForm).subscribe(res => {
        if (typeof res === 'string') return ToastError(res)
      })
      //añadir nueva venta
      const venta: Venta = this.estructurarVenta(unidades)
      this.ventasService.crearVenta(venta).subscribe(res => {
        if (typeof res === 'string') return ToastError(res)
      })

      await ToastVentaExito(unidades, this.producto().nombre)
      if (this.producto().limiteFaltante) {
        this.resta.set(this.producto().disponibles - unidades)
      }
      if (this.resta() <= this.producto().limiteFaltante) {
        ToastFaltanteExito()
      }
    }

  }

  cambiarFaltante() {
    this.faltantesService.editarFaltante(this.producto()._id).subscribe(res => {
      if (typeof res === 'string') return ToastError(res)
      !this.producto().faltante ? ToastExito(AGREGAR_EXITO) : ToastExito(ELIMINAR_EXITO)
    })
  }

  estructurarVenta(unidades: number) {
    const { _id, codigo, nombre, marca, modelo, barras, precio_venta_tarjeta, descripcion } = this.producto()
    return {
      _id: "",
      codigo,
      nombre,
      marca,
      modelo,
      barras,
      dolar: this.dolarDB(),
      precioEnDolar: (precio_venta_tarjeta / this.dolarDB()).toFixed(2),
      precioEnArs: precio_venta_tarjeta,
      unidades,
      fecha: hoy,
      descripcion,
      idProducto: _id,
      existeProducto: true,
      creado: "",
      creador: ""
    }
  }



  mostrarElModal() { }
}
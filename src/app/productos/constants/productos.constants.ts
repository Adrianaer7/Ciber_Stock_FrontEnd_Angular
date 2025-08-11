import { Toast } from "@constantes/general.constants"
import { hoy } from "app/shared/utils/general.utils"
import Swal from "sweetalert2"


export const PRODUCTO_VACIO = {
    _id: "",
    nombre: "",
    marca: "",
    modelo: "",
    codigo: 0,
    barras: "",
    rubro: "",
    rubroValor: 0,
    precio_venta: 0,
    precio_venta_conocidos: 0,
    precio_venta_efectivo: 0,
    precio_venta_tarjeta: 0,
    precio_venta_ahoraDoce: 0,
    precio_venta_cuotas: 0,
    precio_compra_dolar: 0,
    precio_compra_peso: 0,
    valor_dolar_compra: 0,
    proveedor: "",
    todos_proveedores: [],
    factura: "",
    garantia: "",
    fecha_compra: hoy,
    disponibles: 0,
    imagen: "",
    notas: "",
    faltante: false,
    limiteFaltante: 0,
    añadirFaltante: false,
    visibilidad: true,
    creado: hoy,
    creador: "",
    descripcion: ""
}


export function ErrorValor() {
    return Swal.fire({
        icon: 'error',
        title: 'Error',
        color: "rgb(31 41 55)",
        background: "white",
        html: '<p style="color: #545454">Los <b>unidades a vender</b> deben ser un número entero mayor a 0.</p>',
    })
}

export function ErrorCantidad() {
    return Swal.fire({
        icon: 'error',
        title: 'Error',
        color: "rgb(31 41 55)",
        background: "white",
        html: '<p style="color: #545454">No se pueden vender</b> más unidades de las que hay.</p>',
    })
}

export const ToastVentaExito = async (unidades: number, nombre: string) => {
    return Toast.fire({
        icon: 'success',
        title: `${unidades > 1 ? "Se vendieron " + unidades + " unidades de " + nombre : "Se vendió " + unidades + " unidad de " + nombre}`,
        background: "white",
        width: "25%",
        color: "#545454",
    })
}

export function ModalError(html: string) {
    return Swal.fire({
        icon: 'error',
        title: '<h1 style="color:#545454">Error</h3>',
        html,
        background: "white",
    })
}
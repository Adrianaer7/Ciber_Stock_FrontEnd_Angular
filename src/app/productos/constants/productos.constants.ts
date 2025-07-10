import { Toast } from "@constantes/general.constants"
import Swal from "sweetalert2"

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
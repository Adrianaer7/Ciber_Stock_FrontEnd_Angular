import { Toast } from "@constantes/general.constants";
import Swal from "sweetalert2"



export function ErrorValor() {
    return Swal.fire({
        icon: 'error',
        title: 'Error',
        color: "rgb(31 41 55)",
        background: "white",
        html: '<p style="color: #545454">Los <b>unidades a descontar</b> deben ser un número entero mayor a 0.</p>',
    })
}

export function ErrorCantidad() {
    return Swal.fire({
        icon: 'error',
        title: 'Error',
        color: "rgb(31 41 55)",
        background: "white",
        html: '<p style="color: #545454">No se pueden descontar</b> más unidades de las que se vendieron.</p>',
    })
}

export function ToastExitoEditar(unidades: number, nombre: string) {
    Toast.fire({
        icon: 'success',
        title: `${unidades > 1 ? "Se devolvieron " + unidades + " unidades de " + nombre : "Se devolvió " + unidades + " unidad de " + nombre}`,
        background: "white",
        width: "25%",
        color: "#545454",
    })
}
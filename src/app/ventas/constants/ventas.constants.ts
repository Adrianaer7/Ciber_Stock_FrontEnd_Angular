import { Toast } from "@constantes/general.constants";
import Swal from "sweetalert2"

export function ModalCantidad() {
    return Swal.fire({
        title: '<h5 style="color:#545454">Unidades</h5>',
        background: "white",
        html: '<input id="swal-input" type="tel" value="1" style="color: black; width: 100px; text-align:center;" class="swal2-input">',
        width: "25rem",
        focusConfirm: true,
        preConfirm: () => {
            const input = document.getElementById('swal-input') as HTMLInputElement | null;
            return [
                input ? input.value : ""
            ]
        },
        showCloseButton: true,
    })
}

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
        html: '<p style="color: #545454">No se pueden descontar</b> más unidades de las que se vendieron..</p>',
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
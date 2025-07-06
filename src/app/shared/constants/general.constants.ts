import Swal from "sweetalert2"

export const ELIMINAR_EXITO = 'Se eliminó correctamente'
export const AGREGAR_EXITO = 'Se agregó correctamente'
export const EDITAR_EXITO = 'Se editó correctamente'

export const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000
})


export const ToastError = (title: string) => {
    Toast.fire({
        icon: 'error',
        title,
        color: "#545454",
        background: "white",
    });
}

export const ToastExito = (title: string) => {
    Toast.fire({
        icon: 'success',
        title,
        background: "white",
        width: "25%",
        color: "#545454",
    })
}


export function Warning() {
    return Swal.fire({
        title: '<h5 style="color:#545454">¿Estás seguro?</h5>',
        text: "¡No se puede revertir esto!",
        icon: 'warning',
        color: "#545454",
        showCloseButton: true,
        showCancelButton: true,
        confirmButtonText: '<b>Si, eliminar!</b>',
        confirmButtonColor: '#d33',
        cancelButtonText: '<p>Cancelar</p>',
        background: "white",
    })
}



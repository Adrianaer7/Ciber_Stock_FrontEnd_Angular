import { Toast } from "@constantes/general.constants"

export const ToastFaltanteExito = () => {
    return Toast.fire({
        icon: 'success',
        title: 'Agregado a faltante',
        background: "white",
        width: "25%",
        color: "#545454",
    })
}
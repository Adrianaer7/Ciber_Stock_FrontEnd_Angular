import Swal from "sweetalert2";
import { Porcentaje } from "../interfaces/porcentajes.intercaces";

export const PORCENTAJE_VACIO: Porcentaje = {
  _id: '',
  nombre: '',
  comision: 1,
  tipo: '',
  creador: ''
};

export function AlertErrorNombre() {
    return Swal.fire({
        icon: 'error',
        title: '<h1 style="color:#545454">Error</h3>',
        html: `<p style="color:#545454">El <b>nombre del porcentaje</b> es obligatorio.</p>`,
        background: "white",
    })
}

export function AlertErrorComision() {
    return Swal.fire({
        icon: 'error',
        title: '<h1 style="color:#545454">Error</h3>',
        html: `<p style="color:#545454">La <b>comision</b> tiene que ser mayor a 0.</p>`,
        background: "white",
    })
}
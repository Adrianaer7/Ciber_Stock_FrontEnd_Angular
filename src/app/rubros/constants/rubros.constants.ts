import { Rubro } from './../interfaces/rubros.intefaces';
import Swal from "sweetalert2";

export const RUBRO_VACIO: Rubro = {
  _id: '',
  nombre: '',
  rentabilidad: 0,
  creador: ''
};

export function AlertErrorNombre() {
    return Swal.fire({
        icon: 'error',
        title: '<h1 style="color:#545454">Error</h3>',
        html: `<p style="color:#545454">El <b>nombre del rubro</b> es obligatorio.</p>`,
        background: "white",
    })
}

export function AlertErrorRentabilidad() {
    return Swal.fire({
        icon: 'error',
        title: '<h1 style="color:#545454">Error</h3>',
        html: `<p style="color:#545454">La <b>rentabilidad</b> tiene que ser mayor a 0.</p>`,
        background: "white",
    })
}
import Swal from "sweetalert2";
import { Proveedor } from "../interfaces/proveedores.interface";

export const PROVEEDOR_VACIO: Proveedor = {
  _id: '',
  nombre: '',
  empresa: '',
  telPersonal: '',
  telEmpresa: '',
  email: '',
  datos: '',
  creador: ''
};

export function AlertError() {
    return Swal.fire({
        icon: 'error',
        title: '<h1 style="color:#545454">Error</h3>',
        html: `<p style="color:#545454">El <b>nombre de la empresa</b> es obligatorio.</p>`,
        background: "white",
    })
}
import { Producto } from '../interfaces/productos.interface';

type CamposServidor = '_id' | 'creador' | 'creado' | 'descripcion';

export type ProductoParaApi = Omit<Producto, CamposServidor>;

export function productoParaApi(producto: Producto): ProductoParaApi {
    const { _id, creador, creado, descripcion, ...payload } = producto;
    return payload;
}

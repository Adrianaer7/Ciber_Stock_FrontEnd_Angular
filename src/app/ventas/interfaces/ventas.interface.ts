export interface Venta {
    _id:            string;
    codigo:         number;
    nombre:         string;
    marca:          string;
    modelo:         string;
    barras:         string;
    dolar:          number;
    precioEnDolar:  string;
    precioEnArs:    number;
    unidades:       number;
    fecha:          string;
    descripcion:    string;
    idProducto:     string;
    existeProducto: boolean;
    creado:         string;
    creador:        string;
}

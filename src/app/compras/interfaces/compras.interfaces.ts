export interface Compra {
    _id:         string;
    idProducto:  string;
    nombre:      string;
    marca:       string;
    modelo:      string;
    codigo:      number;
    historial:   Historial[];
    descripcion: string;
    creador:     string;
    creado:      Date;
}

export interface Historial {
    cantidad:            string;
    fecha_compra:        string;
    precio_compra_dolar: number;
    arsAdolar:           null;
    valor_dolar_compra:  number;
    proveedor:           string;
    barras:              string;
    factura:             string;
    garantia:            string;
}

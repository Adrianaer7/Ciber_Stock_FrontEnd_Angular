export interface ResponseDolar {
    _id:        string;
    precio:     number;
    automatico: boolean;
    creador:    string;
}

export interface Productos {
    productos: Producto[];
}

export interface Producto {
    _id:                    string;
    nombre:                 string;
    marca:                  string;
    modelo:                 string;
    codigo:                 number;
    barras:                 string;
    rubro:                  string;
    rubroValor:             number;
    precio_venta:           number;
    precio_venta_conocidos: number;
    precio_venta_efectivo:  number;
    precio_venta_tarjeta:   number;
    precio_venta_ahoraDoce: number;
    precio_venta_cuotas:    number;
    precio_compra_dolar:    number;
    precio_compra_peso:     number;
    valor_dolar_compra:     number;
    proveedor:              string;
    todos_proveedores:      string[];
    factura:                string;
    garantia:               string;
    fecha_compra:           Date;
    disponibles:            number;
    imagen:                 string;
    notas:                  string;
    faltante:               boolean;
    limiteFaltante:         number;
    añadirFaltante:         boolean;
    visibilidad:            boolean;
    creado:                 Date;
    creador:                string;
    descripcion:            string;
}


export interface Garantia {
    _id:        string;
    idProducto: string;
    codigo:     number;
    detalles:   DetalleGarantia[];
    creador:    string;
    creado:     Date;
}

export interface DetalleGarantia {
    caducidad: string;
    proveedor: string;
}

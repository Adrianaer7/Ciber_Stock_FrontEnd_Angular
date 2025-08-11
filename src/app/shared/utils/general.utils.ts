//genero fecha formateada
export const generarFecha = (fecha: string) => { //tomo la fecha del producto
    const fechaNueva = new Date(fecha + "T00:00:00")  //le agrego T00:00:00 para que no haga conflicto la zona horaria y agende mal el dia de la fecha
    const opciones: Intl.DateTimeFormatOptions = { year: "numeric", month: "2-digit", day: "2-digit" }
    return fechaNueva.toLocaleString("es-AR", opciones)
}

export const hoy = new Date(Date.now()).toISOString().slice(0, 10);
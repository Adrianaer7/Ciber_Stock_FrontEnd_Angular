export interface Usuario {
    _id:    string;
    email:  string;
    nombre: string;
    token?:  string;
}

export interface UsuarioAutenticado {
    usuario: Usuario;
}


export interface RegistroUsuarioResponse {
    msg: string;
}

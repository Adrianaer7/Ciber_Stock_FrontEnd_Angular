export interface Usuario {
    _id:    string;
    email:  string;
    nombre: string;
    token?:  string;
}

export interface UsuarioAutenticado {
    usuario: Usuario;
}

export interface ErrorResponse   {
    error: AuthError
}

export interface AuthError {
    msg:        string;
    error:      string;
    statusCode: number;
}

export interface RegistroUsuarioResponse {
    msg: string;
}

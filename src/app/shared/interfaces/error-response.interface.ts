export interface ErrorResponse   {
    error: Error
}

export interface Error {
    msg:        string;
    error:      string;
    statusCode: number;
}
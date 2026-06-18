import { FieldTree, ValidationError } from '@angular/forms/signals';

const ERROR_MESSAGES: Record<string, (field: string) => string> = {
  required: (field) => `El campo ${field} es requerido`,
  email: (field) => `El campo ${field} no es un correo electrónico válido`,
  minLength: (field) => `El campo ${field} no cumple la longitud mínima`,
  min: (field) => `El campo ${field} no cumple el valor mínimo`,
  passwordsNotEqual: () => 'Las contraseñas no coinciden',
};

export function getSignalFormErrorMessage(error: ValidationError, fieldName: string): string {
  if (error.message) return error.message;
  const factory = ERROR_MESSAGES[error.kind];
  return factory ? factory(fieldName) : `Error en el campo ${fieldName}`;
}

export function getFirstSignalFormError(
  form: FieldTree<unknown>,
  fields: { path: FieldTree<unknown>; name: string }[],
): string | null {
  for (const { path, name } of fields) {
    if (path().invalid() && path().touched()) {
      const errors = path().errors();
      if (errors.length) {
        return getSignalFormErrorMessage(errors[0], name);
      }
    }
  }
  const rootErrors = form().errors();
  if (rootErrors.length) {
    return getSignalFormErrorMessage(rootErrors[0], 'formulario');
  }
  return null;
}

export function touchAllFields(fields: FieldTree<unknown>[]): void {
  for (const field of fields) {
    field().markAsTouched();
  }
}

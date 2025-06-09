import { AbstractControl, FormGroup, ValidationErrors } from "@angular/forms";


export class FormUtils {

  static emailPattern = '^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$';

  //a medida que escribo se va validando el campo
  static camposIguales(campo1: string, campo2: string) {
    return (formGroup: AbstractControl) => {
      const campoA = formGroup.get(campo1);
      const campoB = formGroup.get(campo2);

      if (!campoA || !campoB) return null;

      if (campoA.value !== campoB.value) {
        formGroup.setErrors({ passwordsNotEqual: true }); // Marcar el formulario como inválido
        campoB.setErrors({ passwordsNotEqual: true }); // También marcar el campo como inválido
      } else {
        formGroup.setErrors(null);
        campoB.setErrors(null);
      }

      return null;
    };
  }

  static getTextError(errors: ValidationErrors | null, campo: string): string | null {
    if (!errors) return null;

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return `El campo ${campo} es requerido`;

        case 'minlength':
          return `El campo ${campo} debe tener al menos ${errors['minlength'].requiredLength} caracteres.`;

        case 'min':
          return `El campo ${campo} debe tener un valor mínimo de ${errors['min'].min}`;

        case 'email':
          return `El campo ${campo} no es un correo electrónico válido`;

        case 'pattern':
          return errors['pattern'].requiredPattern === FormUtils.emailPattern
            ? `El campo ${campo} no tiene un formato de correo electrónico válido`
            : `Error de patrón contra expresión regular en ${campo}`;

        case 'passwordsNotEqual':
          return `Las contraseñas ingresadas no coinciden`;

        default:
          return `Error desconocido en el campo ${campo}: ${key}`;
      }
    }

    return null;
  }


  static getFirstError(form: FormGroup): string | null {
  // Verificar errores globales (como `passwordsNotEqual`)
  if (form.errors?.['passwordsNotEqual']) { //antes que se haga submit este passwordsNotEqual ya se carga
    return 'Las contraseñas no coinciden';
  }

  // Obtener errores de cada campo invidiualmente
  const nombresCampos = Object.keys(form.controls);
  const listaErrores = nombresCampos.map((campo) => {
    const erroresCampo = form.get(campo)?.errors ?? null;
    return FormUtils.getTextError(erroresCampo, campo); //si existe error retorna msg si no retorna null
  }).filter((error) => error !== null); // Filtrar errores nulos

  return listaErrores.length > 0 ? listaErrores[0] : null; // Retorna el primer error encontrado
}
}
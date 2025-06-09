import { Component, input } from '@angular/core';

@Component({
  selector: 'mensaje',
  imports: [],
  templateUrl: './mensaje.component.html',
})
export class MensajeComponent { 
  mensaje = input.required<string>();
}

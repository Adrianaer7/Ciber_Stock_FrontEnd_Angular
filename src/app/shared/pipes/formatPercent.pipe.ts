import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { PercentPipe } from '@angular/common';

@Pipe({
  name: 'formatPercent'
})
export class FormatPercentPipe implements PipeTransform {
  private readonly percentPipe: PercentPipe;

  constructor(@Inject(LOCALE_ID) private readonly locale: string) {
    this.percentPipe = new PercentPipe(this.locale);  //aunque no use el parametro locale, lo necesito para instanciar el pipe
  }

  transform(valor: number | string, format: string = '1.2-2', alreadyPercent: boolean = true): string {
    const numero = Number(valor);
    if (Number.isNaN(numero)) return '';

    const normalizado = alreadyPercent ? numero / 100 : numero;
    return this.percentPipe.transform(normalizado, format, this.locale) ?? '';
  }
}

import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
    name: 'formatImport'
})

//para que esto funcione tengo que configurar el main.ts y el app.config.ts
export class FormatImportPipe implements PipeTransform {
    private readonly currencyPipe: CurrencyPipe;

    constructor(@Inject(LOCALE_ID) private readonly locale: string) {    //traigo el locale del app.config.ts
        this.currencyPipe = new CurrencyPipe(this.locale)
    }

    transform(valor: number | string): number | string {
        if (valor == null) return '';
        valor = Number(valor)
        return this.currencyPipe.transform(valor, 'ARS', 'symbol', '1.2-2', 'es-AR') ?? '';
    }
}
import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
    name: 'formatDate'
})

//para que esto funcione tengo que configurar el main.ts y el app.config.ts
export class FormatDatePipe implements PipeTransform {
    private datePipe: DatePipe;

    constructor(@Inject(LOCALE_ID) private locale: string) {    //traigo el locale del app.config.ts
        this.datePipe = new DatePipe(this.locale)
    }

    transform(value: Date | string | number): string | null {
        if (!value) return null;
        return this.datePipe.transform(value, 'dd/MM/yyyy');
    }
}
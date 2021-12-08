import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer } from '@angular/platform-browser';

export type ITranslator = (key: string, param1?: any | boolean, param2?: boolean) => any;

export class Translator {
    constructor(private prefix: string, private translateService: TranslateService) {
    }

    public translate(key: string, params?: object): string {
        return this.translateService.instant(this.key(key), params);
    }

    public key(key: string) {
        return `${this.prefix}.${key}`;
    }
}

@Injectable({
  providedIn: 'root'
})
export class TranslatorFactoryService {
    constructor(private translateService: TranslateService, private domSanitizer: DomSanitizer) {
    }

    public create(prefix: string): ITranslator {
        const translator: Translator = new Translator(prefix, this.translateService);
        return (key, param1, param2) => {
            let bypass = typeof(param1) === 'boolean' && param1;
            const params = typeof(param1) === 'boolean' ? null : param1;

            if (!bypass) {
                bypass = typeof(param2) === 'boolean' && param2;
            }

            const translation: string = translator.translate(key, params);
            if (bypass) {
                return this.domSanitizer.bypassSecurityTrustHtml(translation);
            }
            return translation;
        }
    }
}


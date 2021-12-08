import { Component, ViewChild } from '@angular/core';

import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { BraintreeFormComponent } from './braintree-form/braintree-form.component';

declare var webkit: any;

@Component({
    //selector: 'app-add-payment-method',
    templateUrl: './add-payment-method.page.html',
    styleUrls: ['./add-payment-method.page.scss'],
})
export class AddPaymentMethodPage {
    public isLoading: boolean;
    public t: ITranslator;

    @ViewChild(BraintreeFormComponent) braintreeForm: BraintreeFormComponent;

    constructor(
        translatorFactoryService: TranslatorFactoryService) {
        this.t = translatorFactoryService.create('pages.authenticated.economy.components.add-payment-method');
    }

    public loadingChanged(isLoading: boolean): void {
        this.isLoading = isLoading;
    }

    public close(success: boolean): void {
        webkit.messageHandlers.cordova_iab.postMessage(JSON.stringify({ event: 'close', success: success }));
    }
}

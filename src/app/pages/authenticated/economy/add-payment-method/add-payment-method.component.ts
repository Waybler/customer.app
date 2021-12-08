import { Component, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { BraintreeFormComponent } from '../braintree-form/braintree-form.component';

@Component({
    selector: 'app-add-payment-method',
    templateUrl: './add-payment-method.component.html',
    styleUrls: ['./add-payment-method.component.scss']
})
export class AddPaymentMethodComponent {
    public isLoading: boolean;
    public t: ITranslator;
    @ViewChild(BraintreeFormComponent) braintreeForm: BraintreeFormComponent;

    constructor(
        private modalController: ModalController,
        translatorFactoryService: TranslatorFactoryService    ) {
        this.t = translatorFactoryService.create('pages.authenticated.economy.components.add-payment-method');
    }

    public loadingChanged(isLoading: boolean): void {
        this.isLoading = isLoading;
    }

    public success() : void {
        this.closeModal();
    }

    public closeModal(): void {
        this.modalController.dismiss();
    }
}

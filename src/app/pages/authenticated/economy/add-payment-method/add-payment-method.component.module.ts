import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AddPaymentMethodComponent } from './add-payment-method.component';
import { BraintreeFormComponentModule } from '../braintree-form/braintree-form.component.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        BraintreeFormComponentModule
    ],
    declarations: [AddPaymentMethodComponent],
    entryComponents: [AddPaymentMethodComponent],
    exports: [AddPaymentMethodComponent]
})
export class AddPaymentMethodComponentModule {
}

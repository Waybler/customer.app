import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BraintreeFormComponent } from './braintree-form.component';
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    declarations: [BraintreeFormComponent],
    entryComponents: [BraintreeFormComponent],
    exports: [BraintreeFormComponent]
})
export class BraintreeFormComponentModule {
}

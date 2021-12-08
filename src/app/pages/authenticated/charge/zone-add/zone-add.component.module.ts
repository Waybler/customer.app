import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ZoneAddComponent } from './zone-add.component';
import { BraintreeFormComponentModule } from '../../economy/braintree-form/braintree-form.component.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    BraintreeFormComponentModule,
  ],
  declarations: [ZoneAddComponent],
  entryComponents: [ZoneAddComponent],
  exports: [ZoneAddComponent],
})
export class ZoneAddComponentModule {
}

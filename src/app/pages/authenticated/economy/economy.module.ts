import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { EconomyPage } from './economy.page';
import { BraintreeFormComponentModule } from './braintree-form/braintree-form.component.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddPaymentMethodComponentModule } from './add-payment-method/add-payment-method.component.module';

const routes: Routes = [
    {
        path: '',
        component: EconomyPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        BraintreeFormComponentModule,
        AddPaymentMethodComponentModule,
        ComponentsModule
    ],
    declarations: [EconomyPage],
    entryComponents: []
})
export class EconomyPageModule { }

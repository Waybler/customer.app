import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { BraintreeFormComponentModule } from './braintree-form/braintree-form.component.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { AddPaymentMethodPage } from './add-payment-method.page';
import { AuthGuard } from '../auth-guard.service';
import { AddPaymentMethodComponentModule as AddPaymentMethodComponentModule } from './add-payment-method/add-payment-method.component.module';

const routes: Routes = [
    {
        canActivate: [AuthGuard],
        canLoad: [AuthGuard],
        path: '',
        component: AddPaymentMethodPage
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
    declarations: [AddPaymentMethodPage],
    entryComponents: []
})
export class AddPaymentMethodPageModule { }

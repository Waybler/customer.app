import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ZoneAddComponent } from './zone-add/zone-add.component';
import { BraintreeFormComponentModule } from '../economy/braintree-form/braintree-form.component.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { ZoneAddPage } from './zone-add.page';
import { ZoneAddComponentModule } from './zone-add/zone-add.component.module';

const routes: Routes = [
    {
        path: '',
        component: ZoneAddPage
    }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild(routes),
        ComponentsModule,
        ZoneAddComponentModule,
        DirectivesModule
    ],
    declarations: [ZoneAddPage],
    entryComponents: []
})
export class ZoneAddPageModule { }



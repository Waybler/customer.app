import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChargePage } from './charge.page';
import { HeaterOptionsComponent } from './heater-options/heater-options.component';
import { BraintreeFormComponentModule } from '../economy/braintree-form/braintree-form.component.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { ZoneStatusComponent } from './zone-status/zone-status.component';
import { ZoneOptionsComponent } from './zone-options/zone-options.component';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { ZoneSearchComponent } from './zone-search/zone-search.component';
import { ZoneComponent } from './zone/zone.component';
import { ChargingComponent } from './charging/charging.component';
import { ZoneAddComponentModule } from './zone-add/zone-add.component.module';

const routes: Routes = [
  {
    path: '',
    component: ChargePage,
  },
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes),
    BraintreeFormComponentModule,
    ComponentsModule,
    ZoneAddComponentModule,
    DirectivesModule,
  ],
  declarations: [
    ChargePage,
    HeaterOptionsComponent,
    ZoneOptionsComponent,
    ZoneStatusComponent,
    ZoneSearchComponent,
    ZoneComponent,
    ChargingComponent,
  ]
  ,
  entryComponents: [
    HeaterOptionsComponent,
    ZoneOptionsComponent,
    ZoneStatusComponent,
    ZoneSearchComponent,
  ],
})
export class ChargePageModule {}



import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { StartPageRoutingModule } from './start-routing.module';

import { StartPage } from './start.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    StartPageRoutingModule,
    ComponentsModule
  ],
  declarations: [StartPage]
})
export class StartPageModule {}

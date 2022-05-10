import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ComponentsModule } from 'src/app/components/components.module';
import { DirectivesModule } from 'src/app/directives/directives.module';
import { ZoneAddPage } from './zone-add.page';
import { ZoneAddComponentModule } from './zone-add/zone-add.component.module';
import { AuthGuard } from '../auth-guard.service';

const routes: Routes = [
  {
    canActivate: [AuthGuard],
    canLoad: [AuthGuard],
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



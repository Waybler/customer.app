import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { UserTermsComponent } from './user-terms/user-terms.component';
import { LanguageSelectorComponent } from './locale-selector/locale-selector.component';
import { DirectivesModule } from '../directives/directives.module';
import { CodePushComponent } from './code-push/code-push.component';
import { ToastComponent } from './utils/cac-toast/toast.component';
import { VehicleModule } from './vehicle/vehicle.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DirectivesModule,
    RoundProgressModule,
    VehicleModule],
  declarations: [UserTermsComponent, LanguageSelectorComponent, CodePushComponent, ToastComponent],
  entryComponents: [UserTermsComponent, LanguageSelectorComponent, CodePushComponent, ToastComponent],
  exports: [UserTermsComponent, LanguageSelectorComponent, CodePushComponent, ToastComponent],
})
export class ComponentsModule {
}

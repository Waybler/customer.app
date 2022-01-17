import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
// import { DirectivesModule } from '../directives/directives.module';
import { ManageVehiclesComponent } from './manage-vehicles/manage-vehicles.component';
import { RegisterVehicleComponent } from './register-vehicle/register-vehicle.component';
import { VehicleDisplayComponent } from './vehicle-display/vehicle-display.component';
import { VehiclesListComponent } from './vehicles-list/vehicles-list.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // DirectivesModule,
    RoundProgressModule,
  ],
  declarations: [ManageVehiclesComponent, RegisterVehicleComponent, VehicleDisplayComponent, VehiclesListComponent],
  entryComponents: [ManageVehiclesComponent, RegisterVehicleComponent, VehicleDisplayComponent, VehiclesListComponent],
  exports: [ManageVehiclesComponent, RegisterVehicleComponent, VehicleDisplayComponent, VehiclesListComponent],
})
export class VehicleModule {
}

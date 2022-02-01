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
import { AddVehicleModalComponent } from './add-first-vehicle-modal/add-vehicle-modal.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    // DirectivesModule,
    RoundProgressModule,
  ],
  declarations: [
    AddVehicleModalComponent,
    ManageVehiclesComponent,
    RegisterVehicleComponent,
    VehicleDisplayComponent,
    VehiclesListComponent,
  ],
  entryComponents: [
    AddVehicleModalComponent,
    ManageVehiclesComponent,
    RegisterVehicleComponent,
    VehicleDisplayComponent,
    VehiclesListComponent,
  ],
  exports: [
    AddVehicleModalComponent,
    ManageVehiclesComponent,
    RegisterVehicleComponent,
    VehicleDisplayComponent,
    VehiclesListComponent,
  ],
})
export class VehicleModule {
}

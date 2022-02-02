import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { VehicleService } from '../../../services/vehicle.service';
import { VehicleServiceAPIRequestBody, VehiclesServiceFunctionsParams, Vehicle } from '../../../models/vehicle';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-vehicle-add-vehicle-modal',
  templateUrl: './add-vehicle-modal.component.html',
  styleUrls: ['./add-vehicle-modal.component.scss'],
})
export class AddVehicleModalComponent implements OnInit, OnDestroy {
  public t: ITranslator;
  public tGlobal: ITranslator;
  public vehicles: Vehicle[];
  public hasFetchedData = false;

  constructor(private userService: UserService,
              private vehicleService: VehicleService,
              private modalController: ModalController,
              translateProviderService: TranslatorFactoryService) {
    this.t = translateProviderService.create('components.vehicle');
    this.tGlobal = translateProviderService.create('global');
  }

  ngOnInit() {
    this.userService.legalEntityIdSubject.subscribe((legalEntityId: number | null) => {
      if (legalEntityId) {
        this.vehicleService.fetchVehiclesForUser(legalEntityId).subscribe((vehicles) => {
          // Do nothing as we handle the response by subscribing to this.vehicleService.vehiclesSubject
          this.hasFetchedData = true;
        });
      }
    });

  }

  ngOnDestroy() {
  }

  public closeModal(): void {
    this.modalController.dismiss();
  }

  onRegisterVehicle(vehicleData: VehicleServiceAPIRequestBody) {
    console.info('manage-vehicle.component -> onRegisterVehicle'
      , '\nevent: ', vehicleData);
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const registerVehicleParams: VehiclesServiceFunctionsParams = Object.assign({}, vehicleData, {
      legalEntityId,
    });
    this.vehicleService.registerVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      console.info('manage-vehicle.component -> onRegisterVehicle -> registerVehicle response -> fetchVehiclesForUser: :'
        , '\nnew vehicle: ', data);
      this.refetchVehicles();
      this.modalController.dismiss({
        vehicle: data,
      });
    });
  }

  refetchVehicles() {
    this.vehicleService.fetchVehiclesForUser((this.userService.legalEntityIdSubject.value)).subscribe((vehicles: Vehicle[]) => {
      console.info('manage-vehicle.component -> refetchVehicles :'
        , '\nall vehicles: ', vehicles);
    });

  }
}

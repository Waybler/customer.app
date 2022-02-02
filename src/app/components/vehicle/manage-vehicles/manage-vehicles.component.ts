import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { VehicleService } from '../../../services/vehicle.service';
import { VehicleServiceAPIRequestBody, VehiclesServiceFunctionsParams, Vehicle, ChargingVehiclesObject } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-manage-vehicles',
  templateUrl: './manage-vehicles.component.html',
  styleUrls: ['./manage-vehicles.component.scss'],
})
export class ManageVehiclesComponent implements OnInit, OnDestroy {
  public t: ITranslator;
  public vehicles: Vehicle[];
  public hasFetchedData = false;

  public showExpandedView = false;
  public currentlyChargingVehicles: ChargingVehiclesObject = null;

  constructor(
    private userService: UserService,
    private vehicleService: VehicleService,
    translateProviderService: TranslatorFactoryService,
  ) {
    this.t = translateProviderService.create('components.vehicle');
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

    this.vehicleService.vehiclesSubject.subscribe((vehicles: Vehicle[]) => {
      this.hasFetchedData = true;
      this.vehicles = vehicles;
      console.info('manage-vehicle.component -> ngOnInit -> vehicleService.vehiclesSubject ->  :',
        '\nvehicles: ', vehicles,
      );
    });

    this.vehicleService.currentlyChargingVehiclesSubject.subscribe((currentlyChargingVehicles) => {
      this.currentlyChargingVehicles = currentlyChargingVehicles;

      console.info('charge.page -> ngOnInit -> userService.currentlyChargingVehiclesSubject ->  :',
        '\ncurrentlyChargingVehicles: ', currentlyChargingVehicles,
      );
    });
  }

  ngOnDestroy() {
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
    });
  }

  onRemoveVehicle(vehicleData: VehicleServiceAPIRequestBody) {
    console.info('manage-vehicle.component -> onRemoveVehicle:'
      , '\nvehicle: ', vehicleData);
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const registerVehicleParams: VehiclesServiceFunctionsParams = Object.assign({}, vehicleData, {
      legalEntityId,
    });
    this.vehicleService.removeVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      console.info('manage-vehicle.component -> onRemoveVehicle -> removeVehicle  :'
        , '\nnew vehicle: ', data);
      this.refetchVehicles();
    });

  }

  onSetVehicleAsDefault(vehicle: Vehicle) {
    console.info('manage-vehicle.component -> onSetVehicleAsDefault:'
      , '\nvehicle: ', vehicle);
    const registerVehicleParams: VehiclesServiceFunctionsParams = this.getVehicleServiceFunctionParamsForVehicle(vehicle);
    this.vehicleService.setDefaultVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      console.info('manage-vehicle.component -> onSetVehicleAsDefault -> setDefaultVehicle  :'
        , '\nnew vehicle: ', data);
      // this.refetchVehicles();
    });
  }

  onUnsetVehicleAsDefault(vehicle: Vehicle) {
    console.info('manage-vehicle.component -> onUnsetVehicleAsDefault:'
      , '\nvehicle: ', vehicle);
    const registerVehicleParams: VehiclesServiceFunctionsParams = this.getVehicleServiceFunctionParamsForVehicle(vehicle);
    this.vehicleService.unsetDefaultVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      console.info('manage-vehicle.component -> onUnsetVehicleAsDefault -> unsetDefaultVehicle  :'
        , '\nnew vehicle: ', data);
      // this.refetchVehicles();
    });
  }

  onShowExpandedViewButtonClick() {
    console.info('manage-vehicle.component -> onShowExpandedViewButtonClick');
    this.showExpandedView = true;
  }

  getVehicleServiceFunctionParamsForVehicle(vehicle: Vehicle): VehiclesServiceFunctionsParams {
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const vehicleData: VehicleServiceAPIRequestBody = {
      registrationNumber: vehicle.registrationNumber,
      countryCode: vehicle.countryCode,
    }
    const registerVehicleParams: VehiclesServiceFunctionsParams = Object.assign({}, vehicleData, {
      legalEntityId,
    });
    return registerVehicleParams;

  }

  refetchVehicles() {
    this.vehicleService.fetchVehiclesForUser((this.userService.legalEntityIdSubject.value)).subscribe((vehicles: Vehicle[]) => {
      this.showExpandedView = false;
      console.info('manage-vehicle.component -> refetchVehicles :'
        , '\nall vehicles: ', vehicles);
    });

  }
}

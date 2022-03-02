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
  public countryCodes: string[];
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
    });

    this.vehicleService.currentlyChargingVehiclesSubject.subscribe((currentlyChargingVehicles) => {
      this.currentlyChargingVehicles = currentlyChargingVehicles;
    });
    this.countryCodes = this.vehicleService.getCountryCodes();
  }

  ngOnDestroy() {
  }

  onRegisterVehicle(vehicleData: VehicleServiceAPIRequestBody) {
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const registerVehicleParams: VehiclesServiceFunctionsParams = Object.assign({}, vehicleData, {
      legalEntityId,
    });
    this.vehicleService.registerVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      this.refetchVehicles();
    });
  }

  onRemoveVehicle(vehicleData: VehicleServiceAPIRequestBody) {
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const registerVehicleParams: VehiclesServiceFunctionsParams = Object.assign({}, vehicleData, {
      legalEntityId,
    });
    this.vehicleService.removeVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      this.refetchVehicles();
    });

  }

  onSetVehicleAsDefault(vehicle: Vehicle) {
    const registerVehicleParams: VehiclesServiceFunctionsParams = this.getVehicleServiceFunctionParamsForVehicle(vehicle);
    this.vehicleService.setDefaultVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      // this.refetchVehicles();
    });
  }

  onUnsetVehicleAsDefault(vehicle: Vehicle) {
    const registerVehicleParams: VehiclesServiceFunctionsParams = this.getVehicleServiceFunctionParamsForVehicle(vehicle);
    this.vehicleService.unsetDefaultVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      // this.refetchVehicles();
    });
  }

  onShowExpandedViewButtonClick() {
    this.showExpandedView = true;
  }

  getVehicleServiceFunctionParamsForVehicle(vehicle: Vehicle): VehiclesServiceFunctionsParams {
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const vehicleData: VehicleServiceAPIRequestBody = {
      registrationNumber: vehicle.registrationNumber,
      countryCode: vehicle.countryCode,
    };

    const registerVehicleParams: VehiclesServiceFunctionsParams = Object.assign({}, vehicleData, {
      legalEntityId,
    });

    return registerVehicleParams;

  }

  refetchVehicles() {
    this.vehicleService.fetchVehiclesForUser((this.userService.legalEntityIdSubject.value)).subscribe((vehicles: Vehicle[]) => {
      this.showExpandedView = false;
    });

  }
}

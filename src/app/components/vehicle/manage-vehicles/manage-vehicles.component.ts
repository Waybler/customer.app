import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { VehicleService } from '../../../services/vehicle.service';
import { RegisterVehiclesAPIRequestBody, RegisterOrRemoveVehiclesServiceParams, Vehicle } from '../../../models/vehicle';

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

  constructor(private userService: UserService,
              private vehicleService: VehicleService,
              translateProviderService: TranslatorFactoryService,
              private cdr: ChangeDetectorRef) {
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
      console.info(') -> ngOnInit -> vehicleService.vehiclesSubject ->  :',
        '\nvehicles: ', vehicles,
      );
    });
  }

  ngOnDestroy() {
  }

  onRegisterVehicle(vehicleData: RegisterVehiclesAPIRequestBody) {
    console.info('manage-vehicle.component -> onRegisterVehicle'
      , '\nevent: ', vehicleData);
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const registerVehicleParams: RegisterOrRemoveVehiclesServiceParams = Object.assign({}, vehicleData, {
      legalEntityId,
    });
    this.vehicleService.registerVehicle(registerVehicleParams).subscribe((data: Vehicle) => {
      console.info('manage-vehicle.component -> onRegisterVehicle -> registerVehicle response -> fetchVehiclesForUser: :'
        , '\nnew vehicle: ', data);
      this.refetchVehicles();
    });
  }

  onRemoveVehicle(vehicleData: RegisterVehiclesAPIRequestBody) {
    console.info('manage-vehicle.component -> onRemoveVehicle:'
      , '\nvehicle: ', vehicleData);
    const legalEntityId = this.userService.legalEntityIdSubject.value;
    const registerVehicleParams: RegisterOrRemoveVehiclesServiceParams = Object.assign({}, vehicleData, {
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
  }

  onUnsetVehicleAsDefault(vehicle: Vehicle) {
    console.info('manage-vehicle.component -> onUnsetVehicleAsDefault:'
      , '\nvehicle: ', vehicle);
  }

  onShowExpandedViewButtonClick() {
    console.info('manage-vehicle.component -> onShowExpandedViewButtonClick');
    this.showExpandedView = true;
  }

  refetchVehicles() {
    this.vehicleService.fetchVehiclesForUser((this.userService.legalEntityIdSubject.value)).subscribe((vehicles: Vehicle[]) => {
      this.showExpandedView = false;
      console.info('manage-vehicle.component -> refetchVehicles :'
        , '\nall vehicles: ', vehicles);
    });

  }
}

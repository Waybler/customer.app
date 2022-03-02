import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { ChargingVehiclesObject, Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-vehicles-list',
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss'],
})
export class VehiclesListComponent implements OnInit, OnDestroy {
  @Input()
  public vehicles: Vehicle[];

  @Input()
  public countryCodes: string[];

  @Input()
  public currentlyChargingVehicles: ChargingVehiclesObject;

  @Output()
  public removeVehicle: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();

  @Output()
  public setVehicleAsDefault: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();

  @Output()
  public unsetVehicleAsDefault: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();

  public t: ITranslator;

  constructor(private userService: UserService,
              translateProviderService: TranslatorFactoryService,
              private cdr: ChangeDetectorRef) {
    this.t = translateProviderService.create('components.vehicle');
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  onRemoveVehicle(vehicle: Vehicle) {
    this.removeVehicle.emit(vehicle);
  }

  onSetVehicleAsDefault(vehicle: Vehicle) {
    this.setVehicleAsDefault.emit(vehicle);
  }

  onUnsetVehicleAsDefault(vehicle: Vehicle) {
    this.unsetVehicleAsDefault.emit(vehicle);
  }

  isCurrentlyCharging(vehicle: Vehicle): boolean {
    if (!vehicle || !this.currentlyChargingVehicles) {
      return false;
    }

    const currentlyChargingVehicleObject = this.currentlyChargingVehicles[vehicle.registrationNumber];
    return !!currentlyChargingVehicleObject;
  }
}

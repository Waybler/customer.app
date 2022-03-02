import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-vehicle-display',
  templateUrl: './vehicle-display.component.html',
  styleUrls: ['./vehicle-display.component.scss'],
})
export class VehicleDisplayComponent implements OnInit, OnDestroy {
  @Input()
  public vehicle: Vehicle;

  @Input()
  public isCurrentlyCharging: boolean;

  @Output()
  public removeVehicle: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();

  @Output()
  public setVehicleAsDefault: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();

  @Output()
  public unsetVehicleAsDefault: EventEmitter<Vehicle> = new EventEmitter<Vehicle>();

  // private isExpandedView = false;

  public t: ITranslator;

  constructor(private userService: UserService,
              translateProviderService: TranslatorFactoryService) {
    this.t = translateProviderService.create('components.vehicle');
  }

  ngOnInit() {
  }

  ngOnDestroy() {
  }

  onSetAsDefaultToggleChange($event) {
    const shouldBeDefault = $event.detail.checked;
    if (shouldBeDefault) {
      this.setVehicleAsDefault.emit(this.vehicle);
    } else {
      this.unsetVehicleAsDefault.emit(this.vehicle);
    }
  }

  onRemoveVehicleButtonClick() {
    if (!this.isCurrentlyCharging) {
      this.removeVehicle.emit(this.vehicle);
    }
  }
}

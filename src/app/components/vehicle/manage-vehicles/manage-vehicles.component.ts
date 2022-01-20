import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Subscription } from 'rxjs';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';

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

  onRegisterVehicle(event) {
    console.info('manage-vehicle.component -> onRegisterVehicle'
      , '\nevent: ', event);
  }

  onRemoveVehicle(vehicle: Vehicle) {
    console.info('manage-vehicle.component -> onRemoveVehicle:'
      , '\nvehicle: ', vehicle);
  }

  onShowExpandedViewButtonClick() {
    console.info('manage-vehicle.component -> onShowExpandedViewButtonClick');
    this.showExpandedView = true;
  }

}

import { Component, OnInit, OnDestroy, Output, EventEmitter, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { VehicleServiceAPIRequestBody } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-register-vehicle',
  templateUrl: './register-vehicle.component.html',
  styleUrls: ['./register-vehicle.component.scss'],
})
export class RegisterVehicleComponent implements OnInit, OnDestroy {
  @Input()
  showTitle: boolean;

  @Input()
  public countryCodes: string[];

  @Output()
  public registerVehicle: EventEmitter<VehicleServiceAPIRequestBody> = new EventEmitter<VehicleServiceAPIRequestBody>();

  public t: ITranslator;
  public tGlobal: ITranslator;
  public defaultCountryCode = 'Se';

  public vehicleRegistrationModel: VehicleServiceAPIRequestBody = {
    registrationNumber: null,
    countryCode: null,
  };

  constructor(
    private userService: UserService,
    translateProviderService: TranslatorFactoryService,
  ) {
    this.t = translateProviderService.create('components.vehicle');
    this.tGlobal = translateProviderService.create('global');
    this.vehicleRegistrationModel.countryCode = this.defaultCountryCode;
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }

  onCountryCodeChange($event) {

  }

  onRegistrationNumberChange($event) {

  }

  onRegisterVehicleSubmit(form) {
    this.registerVehicle.emit(this.vehicleRegistrationModel);
  }

}

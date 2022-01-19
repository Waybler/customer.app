import { Component, OnInit, ChangeDetectorRef, OnDestroy, Output, EventEmitter } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { NgForm } from '@angular/forms';
import { RegisterVehiclesAPIRequestBody } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-register-vehicle',
  templateUrl: './register-vehicle.component.html',
  styleUrls: ['./register-vehicle.component.scss'],
})
export class RegisterVehicleComponent implements OnInit, OnDestroy {
  @Output()
  public onRegisterVehicle: EventEmitter<RegisterVehiclesAPIRequestBody> = new EventEmitter<RegisterVehiclesAPIRequestBody>();

  public t: ITranslator;
  public tGlobal: ITranslator;

  public vehicleRegistrationModel: RegisterVehiclesAPIRequestBody = {
    registrationNumber: null,
    countryCode: null,
  };

  constructor(private userService: UserService,
              translateProviderService: TranslatorFactoryService,
              private cdr: ChangeDetectorRef) {
    this.t = translateProviderService.create('components.vehicle');
    this.tGlobal = translateProviderService.create('global');
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
    console.info('register-vehicle.component -> onRegisterVehicleSubmit:'
      , '\nevent: ', form
      , '\nthis.vehicleRegistrationModel: ', this.vehicleRegistrationModel);
    this.onRegisterVehicle.emit(this.vehicleRegistrationModel);
  }

}

import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';

@Component({
  selector: 'app-vehicle-register-vehicle',
  templateUrl: './register-vehicle.component.html',
  styleUrls: ['./register-vehicle.component.scss'],
})
export class RegisterVehicleComponent implements OnInit, OnDestroy {
   public t: ITranslator;

  constructor(private userService: UserService,
              translateProviderService: TranslatorFactoryService,
              private cdr: ChangeDetectorRef) {
    this.t = translateProviderService.create('pages.components.vehicle');
  }

  ngOnInit() {

  }

  ngOnDestroy() {
  }
}

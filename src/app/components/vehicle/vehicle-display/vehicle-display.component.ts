import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
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

  private isExpandedView = false;

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

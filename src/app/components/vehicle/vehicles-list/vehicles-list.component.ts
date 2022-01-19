import { Component, OnInit, ChangeDetectorRef, OnDestroy, Input } from '@angular/core';
import { UserService } from '../../../services/user.service';
import { ITranslator, TranslatorFactoryService } from '../../../services/translator-factory.service';
import { Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-vehicle-vehicles-list',
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.scss'],
})
export class VehiclesListComponent implements OnInit, OnDestroy {
  @Input()
  public vehicles: Vehicle[];

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

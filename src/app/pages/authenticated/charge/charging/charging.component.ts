import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';
import { ChargeSession } from '../../../../models/chargeSession';

@Component({
  selector: 'app-charging',
  templateUrl: './charging.component.html',
  styleUrls: ['./charging.component.scss'],
})
export class ChargingComponent implements OnInit {
  public t: ITranslator;

  @Input()
  public session: ChargeSession;

  @Input()
  public chargeZone: any;

  @Input()
  public showBack: boolean;

  @Input()
  public station: any;

  @Output()
  public stop = new EventEmitter();

  @Output()
  public back = new EventEmitter();

  constructor(
    public userService: UserService,
    translatorFactoryService: TranslatorFactoryService,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.charge.components.charging');
  }

  ngOnInit() {
  }

  public isHeaterSession(): boolean {
    return this.session.settings != null && this.session.settings.departureTime != null;
  }

  public startedAt(): string {
    const date = new Date((this.session.startedAt) as any);
    const minute = date.getMinutes();
    return `${date.getHours()}:${((minute < 10) ? ('0' + minute) : minute)}`;
  }
}

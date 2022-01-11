import { Component, OnInit, Input } from '@angular/core';
import { ChargeZone, ZONE_ERROR_LEVEL } from 'src/app/models/chargeZone';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';
import { CONTRACT_STATUS } from '../../../../models/contract';
import { PAYMENT_METHOD_STATUS } from '../../../../models/payment';

@Component({
  selector: 'app-zone-status',
  templateUrl: './zone-status.component.html',
  styleUrls: ['./zone-status.component.scss'],
})
export class ZoneStatusComponent implements OnInit {
  @Input()
  public chargeZone: any;

  public t: ITranslator;

  public CONTRACT_STATUS = CONTRACT_STATUS;
  public paymentMethodStatus: PAYMENT_METHOD_STATUS | null;

  constructor(private userService: UserService, translateProviderService: TranslatorFactoryService) {
    this.t = translateProviderService.create('pages.authenticated.charge.components.zone-status');
  }

  ngOnInit() {
    console.info('zone-status.component -> ngOnInit ->  ');
    this.userService.paymentMethods$.subscribe((value) => {
      console.info('zone-status.component -> ngOnInit -> userService.paymentMethods$:\n', value);
    });
    this.userService.paymentMethodsStatus.subscribe((paymentMethodStatus) => {
      this.paymentMethodStatus = paymentMethodStatus;
      console.info('zone-status.component -> ngOnInit -> userService.paymentMethodStatus:\n', paymentMethodStatus);

    });
  }

  zoneIsInError(chargeZone: ChargeZone): boolean {
    return this.zoneErrorlevel(chargeZone) === ZONE_ERROR_LEVEL.ERROR;
  }

  zoneIsInWarning(chargeZone: ChargeZone): boolean {
    return this.zoneErrorlevel(chargeZone) === ZONE_ERROR_LEVEL.WARNING;
  }

  zoneIsInInfo(chargeZone: ChargeZone): boolean {
    return this.zoneErrorlevel(chargeZone) === ZONE_ERROR_LEVEL.INFO;
  }

  zoneErrorlevel(chargeZone: ChargeZone): any {
    switch (chargeZone.status) {
      case CONTRACT_STATUS.OK: {
        return ZONE_ERROR_LEVEL.OK;
      }
      case CONTRACT_STATUS.CONTRACT_OCCUPIED:
        return chargeZone.maxSessions === 1 ? ZONE_ERROR_LEVEL.OK : ZONE_ERROR_LEVEL.INFO;

      case CONTRACT_STATUS.TIME_RESTRICTED:
      case CONTRACT_STATUS.USER_PAYMENT_METHOD_ABOUT_TO_EXPIRE:
      case CONTRACT_STATUS.USER_PAYMENT_METHOD_EXPIRED_LAST_MONTH: {
        return ZONE_ERROR_LEVEL.WARNING;
      }
      case CONTRACT_STATUS.NOT_ACCEPTED_USER_TERMS:
      case CONTRACT_STATUS.USER_PAYMENT_METHOD_MISSING:
      case CONTRACT_STATUS.USER_PAYMENT_METHOD_EXPIRED_MORE_THAN_ONE_MONTH_AGO:
      case CONTRACT_STATUS.NOT_ACCEPTED_CONTRACT_TERMS:
      case CONTRACT_STATUS.OWNER_PAYMENT_METHOD_MISSING: {
        return ZONE_ERROR_LEVEL.ERROR;
      }
      default: {
        return ZONE_ERROR_LEVEL.UNKNOWN;
      }
    }
  }

  public allStationsOk(chargeZone: ChargeZone): boolean {
    let noStations = 0;
    let noStationsNok = 0;

    for (const stationGroup of chargeZone.stationGroups) {
      for (const station of stationGroup.stations) {
        noStations = noStations + 1;
        if (station.state === 'failure') {
          noStationsNok = noStationsNok + 1;
        }
      }
    }

    const limit = noStations * 0.2;
    const limitOk = noStationsNok < limit;
    return limitOk;
  }

  public acceptChargeZoneTerms(chargeZone: ChargeZone): void {
    this.userService.acceptChargeZoneTerms(chargeZone).subscribe();
  }
}

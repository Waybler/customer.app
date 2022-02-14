import { Component, OnInit, Input } from '@angular/core';
import { ChargeZone } from 'src/app/models/chargeZone';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';

@Component({
    selector: 'app-zone-status',
    templateUrl: './zone-status.component.html',
    styleUrls: ['./zone-status.component.scss']
})
export class ZoneStatusComponent implements OnInit {
    @Input()
    public chargeZone: any;

    public t: ITranslator;

    constructor(private userService: UserService, translateProviderService: TranslatorFactoryService) {
        this.t = translateProviderService.create('pages.authenticated.charge.components.zone-status');
    }

    ngOnInit() {
    }

    zoneIsInError(chargeZone: ChargeZone): boolean {
        return this.zoneErrorlevel(chargeZone) === 'error';
    }

    zoneIsInWarning(chargeZone: ChargeZone): boolean {
        return this.zoneErrorlevel(chargeZone) === 'warning';
    }
    zoneIsInInfo(chargeZone: ChargeZone): boolean {
        return this.zoneErrorlevel(chargeZone) === 'info';
    }

    zoneErrorlevel(chargeZone: ChargeZone): any {
        switch (chargeZone.status) {
            case 'ok':
                return 'ok';

            case 'contract-occupied':
                return chargeZone.maxSessions === 1 ? 'ok' : 'info';

            case 'time-restricted':
                return 'warning';

            case 'not-accepted-user-terms':
            case 'user-payment-method-missing':
            case 'not-accepted-contract-terms':
            case 'owner-payment-method-missing':
                return 'error';

            default:
                return 'unknown';
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
        const limitOk = noStationsNok < limit || limit == 0;
        return limitOk;
    }

    public acceptChargeZoneTerms(chargeZone: any): void {
        this.userService.acceptChargeZoneTerms(chargeZone, chargeZone.newTerms).subscribe();
    }
}

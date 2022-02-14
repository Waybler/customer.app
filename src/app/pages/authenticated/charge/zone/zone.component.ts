import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';
import { HeaterOptionsComponent } from '../heater-options/heater-options.component';
import { UserAppSettings } from '../../../../models/user';
import { ChargeZone, ShouldUseCompactviewObject, STATION_STATE } from '../../../../models/chargeZone';
import { ChargeSession } from '../../../../models/chargeSession';
import { ContractType, Terms } from '../../../../models/contract';

@Component({
  selector: 'app-zone',
  templateUrl: './zone.component.html',
  styleUrls: ['./zone.component.scss'],
})
export class ZoneComponent implements OnInit {
  @Input()
  public chargeZone: ChargeZone;

  @Input()
  public sessions: ChargeSession[];

  @Input()
  public userAppSettings: UserAppSettings;

  @Input()
  public shouldUseCompactviewObject: ShouldUseCompactviewObject;

  @Output()
  public start = new EventEmitter<any>();

  @Output()
  public selected = new EventEmitter<any>();

  public showOptions = false;
  public showFutureTerms = false;
  public t: ITranslator;
  public ContractType = ContractType;

  constructor(
    public userService: UserService,
    private toastController: ToastController,
    private modalController: ModalController,
    translatorFactoryService: TranslatorFactoryService,
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.charge.components.zone');
  }

  ngOnInit() {
    this.userService.shouldUseCompactView$.subscribe((shouldUseCompactview) => {
      this.shouldUseCompactviewObject = { shouldUseCompactView: shouldUseCompactview };
      this.cdr.detectChanges();
    });
  }

  public getFutureColor(terms: any): string {
    return terms.accepted ? 'medium' : 'warning';
  }

  public showStationGroupName(): boolean {
    return this.chargeZone.stationGroups.length > 1;
  }

  public allStations(stationGroup: any, showCompactView: boolean): any {
    const allStations = [];
    for (const station of stationGroup.stations) {
      if (showCompactView) {
        let haveOwnSession = false;
        for (const session of this.sessions) {
          if (session.stationId === station.stationId) {
            haveOwnSession = true;
            break;
          }
        }

        if (station.state !== STATION_STATE.FREE && station.state !== STATION_STATE.BUSY || haveOwnSession) {
          allStations.push(station);
        }
      } else {
        allStations.push(station);
      }
    }

    return allStations.sort((a, b) => a.sortOrder < b.sortOrder ? -1 : 1);
  }

  public freeStations(stationGroup: any): number {
    let result = 0;
    for (const station of this.allStations(stationGroup, false)) {
      if (station.state === STATION_STATE.FREE) {
        result += 1;
      }
    }

    return result;
  }

  public async toast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1000 });
    await toast.present();
  }

  public showStation(station: any): void {
    this.selected.emit({ chargeZone: this.chargeZone, station });
  }

  private startSession(chargeZone, station, params?: any): void {
    this.start.emit({ chargeZone, station, params });
  }

  public startCharge(chargeZone, station, params?: any): void {
    this.userService.userAppSettings$.subscribe(async (appSettings: UserAppSettings) => {
      if (appSettings?.showCarHeating) {
        const alert = await this.alertController.create({
          header: this.t('charge-options.header'),
          message: this.t('charge-options.message'),
          buttons: [
            {
              text: this.t('charge-options.heater'),
              cssClass: 'secondary',
              handler: () => {
                this.showHeaterOptions(chargeZone, station);
              },
            }, {
              text: this.t('charge-options.charging'),
              handler: () => {
                this.startSession(chargeZone, station, params);
              },
            },
            {
              text: this.t('charge-options.cancel'),
              role: 'cancel',
              cssClass: 'secondary',
              handler: () => {
              },
            },
          ],
        });

        await alert.present();
      } else {
        this.startSession(chargeZone, station, params);
      }
    });
  }

  public async showHeaterOptions(chargeZone, station): Promise<void> {
    const modal = await this.modalController.create({
      component: HeaterOptionsComponent,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      this.startSession(chargeZone, station, data);
    }
  }

  public isSessionOwner(station: any): boolean {
    for (const session of this.sessions) {
      if (session.stationId === station.stationId) {
        return true;
      }
    }

    return false;
  }

  public toggleShowOptions() {
    this.showOptions = !this.showOptions;
    this.cdr.detectChanges();
  }
}

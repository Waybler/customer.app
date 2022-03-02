import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { ToastController, ModalController, AlertController } from '@ionic/angular';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService } from 'src/app/services/user.service';
import { HeaterOptionsComponent } from '../heater-options/heater-options.component';
import { UserAppSettings } from '../../../../models/user';
import { ChargeZone, ShouldUseCompactviewObject, Station, STATION_STATE } from '../../../../models/chargeZone';
import { ChargeSession } from '../../../../models/chargeSession';
import { ContractType } from '../../../../models/contract';
import { Vehicle } from '../../../../models/vehicle';
import { AddVehicleModalComponent } from '../../../../components/vehicle/add-first-vehicle-modal/add-vehicle-modal.component';
import { VehicleService } from '../../../../services/vehicle.service';

interface ChargeSessionAuxiliaryParams {
  chargeZoneId?: number;
  vehicle?: Vehicle;
  overrideShowCarHeating?: boolean;
}

interface AlertForVehicleSelectionParams {
  chargeZone: ChargeZone;
  station: Station;
  otherParams?: ChargeSessionAuxiliaryParams;
}

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

  @Input()
  public currentlyChargingVehicles: {
    [key: string]: Vehicle
  };

  @Input()
  public vehicles: Vehicle[];

  @Input()
  public defaultVehicle: Vehicle;

  @Output()
  public start = new EventEmitter<any>();

  @Output()
  public selected = new EventEmitter<any>();

  public showOptions = false;
  public t: ITranslator;
  public tVehicle: ITranslator;
  public ContractType = ContractType;
  public selectedVehicle: Vehicle;

  constructor(
    public userService: UserService,
    private toastController: ToastController,
    private modalController: ModalController,
    private cdr: ChangeDetectorRef,
    private alertController: AlertController,
    translatorFactoryService: TranslatorFactoryService,
    public vehicleService: VehicleService,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.charge.components.zone');
    this.tVehicle = translatorFactoryService.create('components.vehicle');
  }

  ngOnInit() {
    this.userService.shouldUseCompactView$.subscribe((shouldUseCompactView) => {
      this.shouldUseCompactviewObject = { shouldUseCompactView };
      this.cdr.detectChanges();
    });

    this.setSelectedVehicleIfNotSet();
  }

  private async alertForVehicleSelection(params: AlertForVehicleSelectionParams) {
    const buttons = this.getSelectVehicleButtons(params);
    const alert = await this.alertController.create({
      cssClass: 'alertController selectVehicle',
      header: this.tVehicle('select-vehicle.header'),
      message: this.tVehicle('select-vehicle.message'),
      buttons,
    });

    await alert.present();

  }

  private getSelectVehicleButtons(params: AlertForVehicleSelectionParams): any[] {
    const buttons = [];
    if (this.vehicles?.length) {
      this.vehicles.forEach((vehicle: Vehicle) => {
        const newButton = {
          text: vehicle.registrationNumber,
          cssClass: 'secondary vehicleRegistrationNumber',
          handler: () => {
            this.setAsSelectedVehicle(vehicle);
            const otherParams = Object.assign({}, params.otherParams);
            this.startCharge(params.chargeZone, params.station, otherParams);
          },
        };
        buttons.push(newButton);
      });
    }
    const cancelButton = {
      text: this.t('charge-options.cancel'),
      role: 'cancel',
      cssClass: 'secondary',
      handler: () => {
      },
    };
    buttons.push(cancelButton);
    return buttons;
  }

  private setAsSelectedVehicle(vehicle: Vehicle) {
    this.selectedVehicle = vehicle;
  }

  private setSelectedVehicleIfNotSet() {
    if (!this.selectedVehicle) {
      if (this.defaultVehicle) {
        this.selectedVehicle = this.defaultVehicle;
      }
    }
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

  public getMatchingRegistrationNumberForChargeStation(stationId: number): string {
    const registrationNumber = this.vehicleService.getMatchingRegistrationNumberForChargeStation(stationId);
    return (registrationNumber) ? `(${registrationNumber})` : '';
  }

  public async toast(message: string): Promise<void> {
    const toast = await this.toastController.create({ message, duration: 1000 });
    await toast.present();
  }

  public showStation(station: any): void {
    this.selected.emit({ chargeZone: this.chargeZone, station });
  }

  private startSession(chargeZone: ChargeZone, station: Station, otherParams?: ChargeSessionAuxiliaryParams): void {
    this.start.emit({ chargeZone, station, otherParams });
  }

  public startCharge(chargeZone: ChargeZone, station: Station, otherParams?: ChargeSessionAuxiliaryParams): void {
    this.userService.userAppSettings$.subscribe(async (appSettings: UserAppSettings) => {
      this.setSelectedVehicleIfNotSet();
      const weHaveNoSelectedVehicleAndAreNotSetToAlwaysShowCarHeating = !this.selectedVehicle
        && !otherParams?.vehicle
        && !appSettings?.showCarHeating;
      const weHaveAlwaysShowCarHeatingAndHaveSelectedChargingAndNoSelectedVehicle = appSettings?.showCarHeating
        && otherParams?.overrideShowCarHeating
        && (!this.selectedVehicle && !otherParams?.vehicle);

      if (weHaveNoSelectedVehicleAndAreNotSetToAlwaysShowCarHeating
        || weHaveAlwaysShowCarHeatingAndHaveSelectedChargingAndNoSelectedVehicle) {
        if (this.vehicles?.length) {
          await this.alertForVehicleSelection({
            chargeZone,
            station,
            otherParams,
          });
        } else {
          // TODO: Add a modal for vehicle registration.
          await this.showAddFirstVehicleModal({
            chargeZone,
            station,
            otherParams,
          });
         }
        return;
      } else {
        if (!otherParams) {
          otherParams = {};
        }
        if (!otherParams?.vehicle) {
          if (this.selectedVehicle) {
            otherParams.vehicle = Object.assign({}, this.selectedVehicle);
          }
        }
      }

      if (appSettings?.showCarHeating && !otherParams?.overrideShowCarHeating) {
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
                otherParams.overrideShowCarHeating = true;
                this.startCharge(chargeZone, station, otherParams);
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
        this.startSession(chargeZone, station, otherParams);
      }
      this.selectedVehicle = null;

    });
  }

  public async showAddFirstVehicleModal(params: AlertForVehicleSelectionParams): Promise<void> {
    const modal = await this.modalController.create({
      component: AddVehicleModalComponent,
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data) {
      if (!params.otherParams) {
        params.otherParams = {};
      }
      // this.selectedVehicle = data;
      params.otherParams.vehicle = data;
      this.startSession(params.chargeZone, params.station, params.otherParams);

    }
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

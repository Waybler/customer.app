import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewChecked } from '@angular/core';
import { webSocket } from 'rxjs/webSocket';
import { environment, vendor } from '../../../../environments/environment';
import { retryWhen, tap, delay, switchMap, debounceTime, filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';
import { ToastController, Platform } from '@ionic/angular';
import { ChangeDetectionStrategy } from '@angular/core';
import { SessionService } from 'src/app/services/session.service';
import { ITranslator, TranslatorFactoryService } from 'src/app/services/translator-factory.service';
import { UserService, StartChargeResult, StopChargeResult, USER_APP_SETTINGS_DEFAULT_VALUE } from 'src/app/services/user.service';
import { LocaleService } from 'src/app/services/locale.service';
import { WebSocketType, IWebSocketUserServiceResponse } from '../../../models/webSocket';
import {
  ChargeZone,
  ShouldUseCompactviewObject,
  Station,
  StationGroup,
  StationsAvailableObject,
  STATION_STATE,
} from '../../../models/chargeZone';
import { ChargeSession, ChargeSessionStartParams } from '../../../models/chargeSession';
import { UserAppSettings } from '../../../models/user';
import { VehicleService } from '../../../services/vehicle.service';
import { Vehicle } from '../../../models/vehicle';

@Component({
  selector: 'app-charge',
  templateUrl: './charge.page.html',
  styleUrls: ['./charge.page.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChargePage implements OnInit, OnDestroy, AfterViewChecked {
  private websocket: Observable<any>;
  private webSocketSubscription: Subscription;
  private updatedUserSubscription: Subscription;
  private localeSubscription: Subscription;
  private userAppSettingsSubscription: Subscription;
  private shouldUseCompactViewSubscription: Subscription;

  public chargeZones: Array<ChargeZone> = null;
  public activeSession: any = null;
  public activeZone: ChargeZone = null;
  public activeStation: Station = null;
  private stationsObject: StationsAvailableObject = { allStations: null, availableStations: null };
  public tryActiveSession: any = null;
  public sessions: ChargeSession[] = [];
  public showBack = false;
  public user: any = null;

  public message: any[] = [];
  public showDebug = false;
  public showCompactViewDialog = false;
  public shouldUseCompactViewObject: ShouldUseCompactviewObject = { shouldUseCompactView: false };

  public show: any = {};

  public t: ITranslator;
  public showAdd = false;

  public isConnected = false;
  private disconnectPending = false;
  private pauseSubscription: Subscription;
  private resumeSubscription: Subscription;
  private connecting = false;
  private backPressed = false;
  public userAppSettings: UserAppSettings;
  public vehicles: Vehicle[];
  public defaultVehicle: Vehicle;

  constructor(
    private userService: UserService,
    private sessionService: SessionService,
    private vehicleService: VehicleService,
    private toastController: ToastController,
    private platform: Platform,
    private cdr: ChangeDetectorRef,
    private localeService: LocaleService,
    translatorFactoryService: TranslatorFactoryService,
  ) {
    this.t = translatorFactoryService.create('pages.authenticated.charge');
  }

  public async ngOnInit(): Promise<void> {
    this.pushMessage('ngOnInit');

    this.updatedUserSubscription = this.userService.userUpdated$.pipe(
      filter(u => u != null),
    ).subscribe(
      (u) => {
        this.user = u;
      },
    );

    this.userAppSettingsSubscription = this.userService.userAppSettingsSubject$.subscribe(
      (userAppSettings => {
        if (userAppSettings) {
          this.userAppSettings = userAppSettings;
          this.updateShouldUseCompactView(this.userAppSettings);
          this.cdr.detectChanges();

        }
      }),
    );

    this.shouldUseCompactViewSubscription = this.userService.shouldUseCompactView$.subscribe(
      (shouldUseCompactView => {
        this.shouldUseCompactViewObject = { shouldUseCompactView };
      }),
    );

    this.localeSubscription = this.localeService.localeLoaded$.pipe(
      tap(() => {
        this.cdr.detectChanges();
      }),
    ).subscribe();

    this.resumeSubscription = this.platform.resume.subscribe(() => {
      this.ionViewDidEnterx();
    });
    this.pauseSubscription = this.platform.pause.subscribe(() => {
      this.internalIonViewDidLeave();
    });
    this.userService.userAppSettings$.subscribe((data) => {
      this.userAppSettings = data;
      this.cdr.detectChanges();
      this.useChargeZoneViewSettings();
    });

    this.userService.legalEntityIdSubject.subscribe((legalEntityId: number | null) => {
      if (legalEntityId) {
        this.vehicleService.fetchVehiclesForUser(legalEntityId).subscribe((vehicles) => {
          // Do nothing as we handle the response by subscribing to this.vehicleService.vehiclesSubject
        });
      }
    });

    this.vehicleService.vehiclesSubject.subscribe((vehicles: Vehicle[]) => {
      this.vehicles = vehicles;
      console.info(') -> ngOnInit -> vehicleService.vehiclesSubject ->  :',
        '\nvehicles: ', vehicles,
      );
    });

    this.vehicleService.defaultVehicleSubject.subscribe((vehicle: Vehicle) => {
      this.defaultVehicle = vehicle;
      console.info(') -> ngOnInit -> vehicleService.defaultVehicleSubject ->  :',
        '\nvehicles: ', vehicle,
      );
    });
    this.ionViewDidEnterx();
  }

  private pushMessage(msg: string) {
    const today = new Date();
    const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
    this.message.push(`${time}: ${msg}`);
    if (this.message.length >= 10) {
      this.message = this.message.slice(1, this.message.length);
    }
  }

  public ionViewDidEnterx(): void {
    if (this.connecting === true) {
      this.pushMessage('Skip connect, already Connecting');
      return;
    }

    this.connecting = true;

    if (this.webSocketSubscription) {
      this.pushMessage('Existing subscription on connect');
      this.isConnected = false;
      this.webSocketSubscription.unsubscribe();
    }

    this.pushMessage('Start subscribe to websocket');
    this.websocket = this.userService.token$.pipe(
      switchMap(token => {
        this.invalidateState();
        this.pushMessage(`connect with token: ${token}`);
        return webSocket<any>(`${environment.wsUrl}app/websocket?token=${token}&app-uuid=${vendor.vendorAppId}`).pipe(
          retryWhen(errors => {
              return errors.pipe(
                tap(_ => {
                  this.pushMessage('socketError');
                  if (this.disconnectPending) {
                    this.isConnected = false;
                  } else {
                    this.disconnectPending = true;
                  }
                  this.cdr.detectChanges();
                }),
                delay(1000),
              );
            },
          ),
          tap((value: IWebSocketUserServiceResponse) => {
            this.isConnected = true;
            this.connecting = false;
            this.disconnectPending = false;

            const type: WebSocketType = value.type;
            const data = value.data;

            this.pushMessage(`Message received: ${type}`);
            switch (type) {
              case WebSocketType.USER_UPDATED:
                this.userService.setUser(value.data);
                break;

              case WebSocketType.SESSION_UPDATED: {
                const session = this.findSession(data.stationId);
                if (session == null) {
                  if (data.status !== 'Completed') {
                    this.sessions.push(data);
                  }
                } else {
                  if (data.status === 'Completed') {
                    this.removeSession(data);
                  } else {
                    Object.assign(session, data as ChargeSession);
                  }
                }
                this.sessionService.sessionUpdated(data);
                break;
              }

              case WebSocketType.STATION_UPDATED:
                for (const s of this.findStation(data.stationId)) {
                  Object.assign(s, data as Station);
                }
                break;

              case WebSocketType.CHARGE_ZONES:
                this.chargeZones = data as ChargeZone[];
                this.useChargeZoneViewSettings();
                break;

              case WebSocketType.CHARGE_ZONE_ADDED:
                this.chargeZones.push(data);
                break;

              case WebSocketType.CHARGE_ZONE_REMOVED:
                for (let index = 0; index < this.chargeZones.length; index++) {
                  if (this.chargeZones[index].contractId === data.contractId) {
                    this.chargeZones.splice(index, 1);
                    break;
                  }
                }
                break;

              case WebSocketType.CHARGE_ZONE_UPDATED:
                const chargeZone = this.findChargeZoneByContractId(data.contractId);
                Object.keys(chargeZone).forEach((key) => {
                  if (key !== 'contractId') {
                    delete chargeZone[key];
                  }
                });
                Object.assign(chargeZone, data);
                break;
            }

            if (this.activeSession == null && this.tryActiveSession != null) {
              for (const session of this.sessions) {
                if (this.tryActiveSession.stationId === session.stationId && this.tryActiveSession.zoneId === session.zoneId) {
                  this.setActiveSession(session);
                }
              }
            } else if (this.autoShowCharging() && this.sessions.length === 1 && !this.backPressed) {
              this.setActiveSession(this.sessions[0]);
            }

            this.showBack = (this.chargeZones != null && this.chargeZones.length > 1)
              || (this.chargeZones != null && this.chargeZones.length === 1 && this.chargeZones[0].maxSessions > 1);
            this.userService.sessionCount = this.sessions.length;

          }),
        );
      }),
      debounceTime(100),
    );

    this.webSocketSubscription = this.websocket.subscribe(
      () => {
        this.cdr.detectChanges();
      },
      err => this.pushMessage(err),
      () => this.pushMessage('Done'),
    );

  }

  public toggleDebug() {
    this.showDebug = this.showDebug !== true;
  }

  private invalidateState(): void {
    this.chargeZones = null;
    this.sessions = [];
    this.userService.sessionCount = this.sessions.length;
    this.setActiveSession(null, false);
    try {
      this.cdr.detectChanges();
    } catch {
    }
  }

  public ngAfterViewChecked(): void {
    if (this.chargeZones == null) {
      return;
    }

    // Workaround for zones having duplicate station buttons sometimes
    for (const zone of this.chargeZones) {
      const found = {};
      for (const el of [].slice.call(document.querySelectorAll('div[stations] ion-button[data-zone=\'' + zone.zoneId + '\']'))) {
        if (found[el.attributes['data-station'].value] === undefined) {
          found[el.attributes['data-station'].value] = true;
        } else {
          // Duplicate found
          el.parentElement.removeChild(el);
        }
      }
    }
  }

  public internalIonViewDidLeave(): void {
    this.pushMessage('Unsubscribe to websocket');
    if (this.webSocketSubscription) {
      this.webSocketSubscription.unsubscribe();
    }

    this.pushMessage('disconnected');
    this.isConnected = false;
    this.connecting = false;

    this.invalidateState();
  }

  public ngOnDestroy(): void {
    this.pushMessage('ngOnDestroy');

    this.internalIonViewDidLeave();
    this.resumeSubscription.unsubscribe();
    this.pauseSubscription.unsubscribe();
    this.webSocketSubscription.unsubscribe();
    this.updatedUserSubscription.unsubscribe();
    this.localeSubscription.unsubscribe();
    this.userAppSettingsSubscription.unsubscribe();
  }

  public async selected(chargeZone, station): Promise<void> {
    this.setActiveSession(this.findSession(station.stationId));
  }

  public async startCharge(chargeZone: ChargeZone, station: Station, params?: any): Promise<void> {
    let vehicle: Vehicle;
    const defaultVehicle = this.vehicleService?.defaultVehicleSubject?.value;
    if (defaultVehicle) {
      vehicle = defaultVehicle;
    } else {
      // Start a pop-up for vehicle selection
      console.info('charge.page -> startCharge -> LAUNCH POP-UP FOR VEHICLE SELECTION');
      // debugger;
    }
    if (!vehicle) {
      console.info('charge.page -> startCharge ->RETURN because we do not have a vehicle');
      return;
    }
    console.info('charge.page -> startCharge:'
      , '\nvehicle: ', vehicle);
    return;
    const session: ChargeSession = {
      status: 'Unknown',
      stationId: station.stationId,
      zoneId: chargeZone.zoneId,
      contractId: chargeZone.contractId,
      chargedEnergy: 0,
      settings: params,
    };
    const legalEntityId = this.userService?.legalEntityIdSubject?.value;
    this.sessions.push(session);
    this.setActiveSession(session);

    const startChargeParams: ChargeSessionStartParams = {
      legalEntityId,
      contractUserId: chargeZone.contractUserId,
      stationId: station.stationId,
      otherParams: params,
    };
    this.userService.startCharge(startChargeParams).subscribe(
      result => {
        switch (result) {
          case StartChargeResult.Success:
            break;
          default:
            this.removeSession(session);
            this.toastController.create({
              cssClass: 'danger',
              duration: 2000,
              message: this.t('failed-to-start'),
              position: 'top',
            }).then(t => t.present());
            this.cdr.detectChanges();
            break;
        }
      },
    );
  }

  public async stopCharge(): Promise<void> {
    const legalEntityId = this.userService?.legalEntityIdSubject?.value;
    const stopChargeParams = {
      legalEntityId,
      sessionId: this.activeSession.sessionId,
    };

    this.userService.stopCharge(stopChargeParams).subscribe(
      r => {
        if (r === StopChargeResult.Failed) {
          this.toastController.create({ cssClass: 'danger', duration: 2000, message: this.t('failed-to-stop'), position: 'top' })
            .then(t => t.present());
        }
      },
    );
  }

  public hideCharging(): void {
    this.setActiveSession(null);
    this.backPressed = true;
  }

  /* Helper methods */

  private removeSession(session: ChargeSession) {
    for (let index = 0; index < this.sessions.length; index++) {
      if (this.sessions[index].stationId === session.stationId) {
        this.sessions.splice(index, 1);
        break;
      }
    }
    if (this.activeSession.stationId === session.stationId) {
      this.setActiveSession(null);
    }
  }

  private setActiveSession(session: ChargeSession, overwriteTryActiveSession = true): void {
    this.activeSession = session;
    if (this.activeSession != null) {
      this.activeZone = this.findChargeZone(this.activeSession.zoneId);
      for (const stationGroup of this.activeZone.stationGroups) {
        for (const station of stationGroup.stations) {
          if (station.stationId === this.activeSession.stationId) {
            this.activeStation = station;
          }
        }
      }
    } else {
      this.activeZone = null;
      this.activeStation = null;
    }

    if (overwriteTryActiveSession) {
      this.tryActiveSession = this.activeSession;
    }

    this.cdr.detectChanges();
  }

  private autoShowCharging(): boolean {
    for (const zone of this.chargeZones) {
      if (zone.maxSessions > 1) {
        return false;
      }
    }

    return true;
  }

  private findSession(stationId: number): any {
    for (const session of this.sessions) {
      if (session.stationId === stationId) {
        return session;
      }
    }

    return null;
  }

  private findChargeZoneByContractId(contractId): any {
    for (const chargeZone of this.chargeZones) {
      if (chargeZone.contractId === contractId) {
        return chargeZone;
      }
    }

    return {};
  }

  private findChargeZone(chargeZoneId: number): any {
    for (const chargeZone of this.chargeZones) {
      if (chargeZone.zoneId === chargeZoneId) {
        return chargeZone;
      }
    }

    return {};
  }

  private findStation(stationId: number): any[] {
    const result = new Array<any>();

    if (this.chargeZones == null) {
      return result;
    }

    for (const chargeZone of this.chargeZones) {
      for (const stationGroup of chargeZone.stationGroups) {
        for (const station of stationGroup.stations) {
          if (station.stationId === stationId) {
            result.push(station);
          }
        }
      }
    }

    return result;
  }

  public acceptTerms(): void {
    this.userService.acceptTerms().subscribe();
  }

  private async useChargeZoneViewSettings() {
    this.setStationsObject();

    const totalStationsCount = (this.stationsObject.allStations) ? Object.entries(this.stationsObject.allStations).length : 0;
    const availableStationsCount = (this.stationsObject.availableStations)
      ? Object.entries(this.stationsObject?.availableStations)?.length
      : 0;
    const userAppSettings = await this.userService.getUserAppSettings();

    if (!userAppSettings) {
      // This means that the user app settings have not been resolved, so we run this function again upon their resolution.
      return;
    }
    const thereAreOccupiedChargingStations = totalStationsCount !== availableStationsCount;
    const compactViewIsNotSet = !userAppSettings || (userAppSettings && (!userAppSettings?.hasSetCompactView));

    const compactViewLimitToUse = (userAppSettings?.compactViewLimit || USER_APP_SETTINGS_DEFAULT_VALUE.compactViewLimit);
    const totalStationsAreMoreThanCompactViewPromptLimit = totalStationsCount >= compactViewLimitToUse;

    const shouldShowCompactView = compactViewIsNotSet
      && thereAreOccupiedChargingStations
      && totalStationsAreMoreThanCompactViewPromptLimit;

    if (shouldShowCompactView) {
      // Show pop-up if this has not been shown before
      this.showCompactViewDialog = true;
    } else {
      if (this.showCompactViewDialog) {
        this.showCompactViewDialog = false;
      }
      this.cdr.detectChanges();
    }

  }

  private setStationsObject() {
    const chargeZones: ChargeZone[] = this.chargeZones;

    if (!this.chargeZones || !this.chargeZones.length) {
      return;
    }

    let stationGroupsArray: StationGroup[] = [];
    chargeZones.forEach((zone) => {
      if (zone.stationGroups && zone.stationGroups.length) {
        stationGroupsArray = stationGroupsArray.concat(zone.stationGroups);
      }
    });
    let stations: Station[] = [];
    {
      if (!this.stationsObject.allStations) {
        this.stationsObject.allStations = {};
      }
      if (!this.stationsObject.availableStations) {
        this.stationsObject.availableStations = {};
      }
    }
    stationGroupsArray.forEach((stationGroup) => {
      if (stationGroup.stations) {
        stations = stations.concat(stationGroup.stations);
        stations.forEach((station) => {
          this.stationsObject.allStations[station.stationId] = station;
          if (station.state === STATION_STATE.READY) {
            this.stationsObject.availableStations[station.stationId] = station;
          }
        });
      }
    });

  }

  private async updateShouldUseCompactView(userAppSettings?: UserAppSettings): Promise<ShouldUseCompactviewObject> {
    if (!userAppSettings) {
      userAppSettings = this.userAppSettings;
    }
    const shouldUseCompactView = await this.userService.calculateShouldUseCompactView({
      userAppSettings,
      stationsObject: this.stationsObject,
    });
    const currentShouldUseCompactView = await this.userService.getShouldUseCompactView();
    if (currentShouldUseCompactView !== shouldUseCompactView) {
      await this.userService.setShouldUseCompactView(shouldUseCompactView);
    }
    this.shouldUseCompactViewObject.shouldUseCompactView = shouldUseCompactView;
    return this.shouldUseCompactViewObject;
  }

  public async setShowCompactView(value: boolean): Promise<void> {
    await this.userService.setShowCompactView(value);
    await this.updateShouldUseCompactView(this.userAppSettings);
    this.showCompactViewDialog = false;
    this.cdr.detectChanges();
  }

  public onShowCompactStationsAccept = () => {
    this.setShowCompactView(true);

  }

  public onShowCompactStationsDecline = () => {
    this.setShowCompactView(false);
  }
}
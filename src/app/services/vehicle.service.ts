import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { LocaleService } from './locale.service';
import { UserService } from './user.service';
import {
  ChargingVehiclesObject,
  GetVehiclesAPIResponse,
  VehiclesServiceFunctionsParams,
  RegisterVehiclesAPIResponse,
  Vehicle, VehicleAndStation, SetOrUnsetDefaultVehicleAPIResponse, RemoveVehiclesAPIResponse,
} from '../models/vehicle';
import { ChargeSession, CHARGE_SESSION_STATE } from '../models/chargeSession';
import { SessionService } from './session.service';
import { ITranslator, TranslatorFactoryService } from './translator-factory.service';

interface VehicleCache {
  lastSessionData: ChargeSession | null;
}

const cache: VehicleCache = {
  lastSessionData: null,
};

@Injectable({
  providedIn: 'root',
})

export class VehicleService {
  private legalEntityIdSubject;
  private legalEntityId$: Observable<number>;
  public vehiclesSubject: BehaviorSubject<Vehicle[] | null> = new BehaviorSubject(null);
  public defaultVehicleSubject: BehaviorSubject<Vehicle | null> = new BehaviorSubject(null);
  public currentlyChargingVehiclesSubject = new BehaviorSubject<ChargingVehiclesObject>({});
  private t: ITranslator;

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService,
    private localeService: LocaleService,
    private userService: UserService,
    private sessionService: SessionService,
    private translateProviderService: TranslatorFactoryService,
  ) {
    this.legalEntityId$ = userService.legalEntityId$;
    this.legalEntityIdSubject = userService.legalEntityIdSubject;
    this.t = translateProviderService.create('components.vehicle');

    this.legalEntityIdSubject.subscribe((legalEntityId) => {
    });
    this.sessionService.sessionUpdates$.subscribe((chargeSessionData: ChargeSession) => {
      cache.lastSessionData = chargeSessionData;
      this.updateCurrentlyChargingVehiclesSubject(chargeSessionData);
    });
  }

  public fetchVehiclesForUser(legalEntityId: number): Observable<any> {
    if (!legalEntityId) {
      throw Error('fetchVehiclesForUser: No userId number');
    }
    const url = `${environment.apiUrl}${legalEntityId}/vehicles`;

    return this.httpClient.get(url).pipe(
      map((response: GetVehiclesAPIResponse) => {
        const vehicles = response.data;
        // this.mockDefaultVehicle(vehicles);// TODO : Erase mock data once back-end supports isDefaultVehicle
        this.setDefaultVehicleIfExists(vehicles);
        this.vehiclesSubject.next(vehicles);

        this.updateCurrentlyChargingVehiclesSubject(cache.lastSessionData);

        return vehicles;
      }));
  }

  public mockDefaultVehicle(vehicles: Vehicle[]) {
    if (vehicles && vehicles.length) { // TODO : Erase mock data once back-end supports isDefaultVehicle
      if (vehicles.length === 1) {
        vehicles[0].isDefaultVehicle = true;
      } else if (vehicles.length > 1) {
        vehicles[1].isDefaultVehicle = true;

      }
    }

  }

  public getCountryCodes(): string[] {
    const countryCodes = ['Se', 'Fi', 'No', 'Dk', 'De', 'Lu'];
    const countryCodesObjectWithTranslation = {};
    countryCodes.forEach((countryCode) => {
      countryCodesObjectWithTranslation[countryCode] = this.t('country-codes.' + countryCode);
    });
    const countryNamesSorted = Object.values(countryCodesObjectWithTranslation).sort();
    const countryCodesSorted = [];
    countryNamesSorted.forEach((countryName) => {
      const key = Object.keys(countryCodesObjectWithTranslation).filter((k) => countryCodesObjectWithTranslation[k] === countryName)[0];
      countryCodesSorted.push(key);
    });
    countryCodesSorted.push('Other');
    return countryCodesSorted;
  }

  public registerVehicle(params: VehiclesServiceFunctionsParams): Observable<Vehicle> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/add`;
    return this.httpClient.post(url, params)
      .pipe(
        map((response: RegisterVehiclesAPIResponse) => response.data),
      );
  }

  public removeVehicle(params: VehiclesServiceFunctionsParams): Observable<any> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/remove`;
    return this.httpClient.post(url, params)
      .pipe(
        map((response: RemoveVehiclesAPIResponse) => response.data),
      );
  }

  public setDefaultVehicle(params: VehiclesServiceFunctionsParams): Observable<any> {
    const legalEntityId = params.legalEntityId;
    this.defaultVehicleSubject.next(null);
    const vehicles = this.vehiclesSubject.getValue();

    const url = `${environment.apiUrl}${legalEntityId}/vehicles/setdefault`;
    return this.httpClient.post(url, params)
      .pipe(
        tap(() => {
          const previousDefaultVehicle = vehicles.find(
            (vehicle) => vehicle.isDefaultVehicle === true && vehicle.registrationNumber !== params.registrationNumber,
          );
          const newDefaultVehicle = vehicles.find((vehicle) => vehicle.registrationNumber === params.registrationNumber);

          if (previousDefaultVehicle) {
            previousDefaultVehicle.isDefaultVehicle = false;
          }
          if (newDefaultVehicle) {
            newDefaultVehicle.isDefaultVehicle = true;
          }
          this.vehiclesSubject.next(vehicles);
          this.defaultVehicleSubject.next(newDefaultVehicle);
        }),
        map((response: SetOrUnsetDefaultVehicleAPIResponse) => response.data),
      );
  }

  public unsetDefaultVehicle(params: VehiclesServiceFunctionsParams): Observable<any> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/unsetdefault`;
    return this.httpClient.post(url, params)
      .pipe(
        map((response: SetOrUnsetDefaultVehicleAPIResponse) => response.data),
      );
  }

  public setDefaultVehicleIfExists(vehicles: Vehicle[]) {
    const defaultVehicle = vehicles?.find((vehicle: Vehicle) => vehicle.isDefaultVehicle);
    if (defaultVehicle) {
       this.defaultVehicleSubject.next(defaultVehicle);
    } else {
      this.defaultVehicleSubject.next(null);
    }
  }

  public removeVehicleFromChargingVehicles(chargeSessionData: ChargeSession) {

    // console.info('VehicleService -> removeVehicleFromChargingVehicles : '
    //   , '\nchargeSessionData: ', chargeSessionData);
  }

  private updateCurrentlyChargingVehiclesSubject(chargeSessionData: ChargeSession) {
    if (!chargeSessionData) {
      return;
    }
    const vehicles = this.vehiclesSubject.value;
    const currentlyChargingVehicles = this.currentlyChargingVehiclesSubject.value;
    const registrationNumber = chargeSessionData?.vehicleRegistrationNumber;
    if (!registrationNumber) {
      return;
    }
    if (!vehicles || !vehicles.length) {
      return;
    }
    if (chargeSessionData.status === CHARGE_SESSION_STATE.COMPLETED) {
      if (currentlyChargingVehicles[registrationNumber]) {
        delete currentlyChargingVehicles[registrationNumber];
      }
    } else {
      const relevantVehicle = vehicles.find((vehicle) => vehicle.registrationNumber === registrationNumber);
      if (relevantVehicle) {
        currentlyChargingVehicles[registrationNumber] = Object.assign({}, currentlyChargingVehicles[registrationNumber], {
          vehicle: relevantVehicle,
          stationId: chargeSessionData.stationId,
        });
      }
    }
    this.currentlyChargingVehiclesSubject.next(Object.assign({}, currentlyChargingVehicles));
  }

  public getMatchingRegistrationNumberForChargeStation(stationId: number): string {
    const vehicles = this.vehiclesSubject.value;
    if (!stationId || !vehicles || !vehicles.length) {
      return '';
    }
    const currentlyChargingVehicles = this.currentlyChargingVehiclesSubject.value;
    if (!currentlyChargingVehicles) {
      return '';
    }
    const registrationNumbersForCurrentlyChargingVehicles = Object.keys(currentlyChargingVehicles);
    if (!registrationNumbersForCurrentlyChargingVehicles || !registrationNumbersForCurrentlyChargingVehicles.length) {
      return '';
    }
    const matchingRegistrationNumber = registrationNumbersForCurrentlyChargingVehicles.find((registrationNumber) => {
      const vehicleObject: VehicleAndStation = currentlyChargingVehicles[registrationNumber];
      const matchesStationId = vehicleObject?.stationId === stationId;
      return matchesStationId;
    });

    if (!matchingRegistrationNumber) {
      return '';
    } else {
      return matchingRegistrationNumber;
    }
  }

}

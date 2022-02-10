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

  constructor(
    private httpClient: HttpClient,
    private storageService: StorageService,
    private localeService: LocaleService,
    private userService: UserService,
    private sessionService: SessionService,
  ) {
    this.legalEntityId$ = userService.legalEntityId$;
    this.legalEntityIdSubject = userService.legalEntityIdSubject;

    this.legalEntityIdSubject.subscribe((legalEntityId) => {
      console.info('VehicleService -> constructor -> legalEntityId: ', legalEntityId);
    });
    this.sessionService.sessionUpdates$.subscribe((chargeSessionData: ChargeSession) => {

      console.info('VehicleService -> constructor -> sessionService.sessionUpdates$: '
        , '\nchargeSessionData: ', chargeSessionData);
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
        console.info('VehicleService -> fetchVehiclesForUser -> get -> map :',
          '\nresponse: ', response,
        );
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

  public registerVehicle(params: VehiclesServiceFunctionsParams): Observable<Vehicle> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/add`;
    return this.httpClient.post(url, params)
      .pipe(
        tap((response: RegisterVehiclesAPIResponse) => {
          console.info('VehicleService -> registerVehicle -> response: ', response);
        }),
        map((response: RegisterVehiclesAPIResponse) => response.data),
      );
  }

  public removeVehicle(params: VehiclesServiceFunctionsParams): Observable<any> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/remove`;
    return this.httpClient.post(url, params)
      .pipe(
        tap((response: RemoveVehiclesAPIResponse) => {
          console.info('VehicleService -> registerVehicle -> response: ', response);
        }),
        map((response: RemoveVehiclesAPIResponse) => response.data),
      );
  }

  public setDefaultVehicle(params: VehiclesServiceFunctionsParams): Observable<any> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/setdefault`;
    return this.httpClient.post(url, params)
      .pipe(
        tap((response: SetOrUnsetDefaultVehicleAPIResponse) => {
          console.info('VehicleService -> setDefaultVehicle -> response: ', response);
        }),
        map((response: SetOrUnsetDefaultVehicleAPIResponse) => response.data),
      );
  }
  public unsetDefaultVehicle(params: VehiclesServiceFunctionsParams): Observable<any> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/unsetdefault`;
    return this.httpClient.post(url, params)
      .pipe(
        tap((response: SetOrUnsetDefaultVehicleAPIResponse) => {
          console.info('VehicleService -> unsetDefaultVehicle -> response: ', response);
        }),
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

    console.info('VehicleService -> removeVehicleFromChargingVehicles : '
      , '\nchargeSessionData: ', chargeSessionData);
  }

  private updateCurrentlyChargingVehiclesSubject(chargeSessionData: ChargeSession) {
    {
      // const currentlyChargingVehiclesObject = Object.assign({}, this.currentlyChargingVehiclesSubject.value);
      // const vehicleRegistrationNumber = params.otherParams.vehicle.registrationNumber;
      // currentlyChargingVehiclesObject[vehicleRegistrationNumber] = {
      //   vehicle: params.otherParams.vehicle,
      //   stationId: params.stationId,
      // };
      // this.currentlyChargingVehiclesSubject.next(currentlyChargingVehiclesObject);
      // console.info('user.service -> startCharge -> tap: '
      //   , '\ndata: ', data);
    }
    if (!chargeSessionData) {
      return;
    }
    console.info('VehicleService -> updateCurrentlyChargingVehiclesSubject  ',
      '\nchargeSessionData:', chargeSessionData);
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
    console.info('VehicleService -> updateCurrentlyChargingVehiclesSubject : '
      , '\nchargeSessionData: ', chargeSessionData
      , '\nvehicles: ', vehicles
      , '\ncurrentlyChargingVehicles: ', currentlyChargingVehicles
      , '\ngetMatchingRegistrationNumberForChargeStation: ', this.getMatchingRegistrationNumberForChargeStation(chargeSessionData.stationId));
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

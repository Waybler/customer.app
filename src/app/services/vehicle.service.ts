import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { LocaleService } from './locale.service';
import { UserService } from './user.service';
import {
  GetVehiclesAPIResponse,
  RegisterVehiclesAPIRequestBody,
  RegisterVehiclesAPIResponse,
  RegisterOrRemoveVehiclesServiceParams,
  Vehicle,
} from '../models/vehicle';

const cache: any = {
  stationsObject: null,
};

@Injectable({
  providedIn: 'root',
})
export class VehicleService {
  private legalEntityIdSubject;
  private legalEntityId$: Observable<number>;
  public vehiclesSubject: BehaviorSubject<Vehicle[] | null> = new BehaviorSubject(null);

  constructor(private httpClient: HttpClient, private storageService: StorageService, private localeService: LocaleService, private userService: UserService) {
    this.legalEntityId$ = userService.legalEntityId$;
    this.legalEntityIdSubject = userService.legalEntityIdSubject;

    this.legalEntityIdSubject.subscribe((legalEntityId) => {
      console.info('VehicleService -> constructor -> legalEntityId: ', legalEntityId);
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
        this.vehiclesSubject.next(vehicles);
        return vehicles;
      }));
  }

  public registerVehicle(params: RegisterOrRemoveVehiclesServiceParams): Observable<Vehicle> {
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

  public removeVehicle(params: RegisterOrRemoveVehiclesServiceParams): Observable<any> {
    const legalEntityId = params.legalEntityId;
    const url = `${environment.apiUrl}${legalEntityId}/vehicles/remove`;
    return this.httpClient.post(url, params)
      .pipe(
        tap((response: RegisterVehiclesAPIResponse) => {
          console.info('VehicleService -> registerVehicle -> response: ', response);
        }),
        map((response: RegisterVehiclesAPIResponse) => response.data),
      );
  }
}

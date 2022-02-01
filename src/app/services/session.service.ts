import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { ChargeSession } from '../models/chargeSession';
import { ChargingVehiclesObject } from '../models/vehicle';

@Injectable({
  providedIn: 'root',
})
export class SessionService {
  private sessionUpdatedSubject: Subject<ChargeSession> = new Subject<ChargeSession>();

  public sessionUpdates$ = this.sessionUpdatedSubject.asObservable();

  sessionUpdated(data: ChargeSession) {
    console.info('session.service -> sessionUpdated: ',
      '\ndata:', data);
    this.sessionUpdatedSubject.next(data);
  }

}

import * as Moment from 'moment';
import { Vehicle } from './vehicle';

export enum CHARGE_SESSION_STATE {
  UNKOWN = 'Unknown',
  WAITING = 'Waiting',
  CHARGING = 'Charging',
  COMPLETED = 'Completed'
}

export interface ChargeSession {
  chargedEnergy: number;
  contractId: number;
  contractUserId?: number;
  countryCode?: string;
  id?: number;
  power?: number;
  registrationNumber?: string;
  settings?: any;
  startedAt?: Moment.Moment;
  stationId: number;
  status: CHARGE_SESSION_STATE;
  zoneId: number;
}

export interface ChargeSessionAPIStartParams {
  legalEntityId: number;
  contractUserId: number;
  stationId: number;
  otherParams?: ChargeSessionAPIStartParamsAuxiliary;
}

export interface ChargeSessionAPIStartParamsAuxiliary {
  legalEntityId: number;
  vehicleRegistrationNumber?: string;
  vehicleCountryCode?: string;
  vehicle?: Vehicle;
}

export interface APIBodyChargeSessionStart {
  contractUserId: number;
  stationId: number;
  vehicleRegistrationNumber?: string;
  countryCode?: string;
  params?: any;
}

export interface ChargeSessionAPIStopParams {
  legalEntityId: number;
  sessionId: number;
}


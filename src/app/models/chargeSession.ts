import * as Moment from 'moment';

export interface ChargeSession {
  chargedEnergy: number;
  contractId: number;
  contractUserId?: number;
  id?: number;
  power?: number;
  settings?: any;
  startedAt?: Moment.Moment;
  stationId: number;
  status: string;
  zoneId: number;
}

export interface HeaterSessionParams {
  date: Date;
  offset: number;
  time: string;
}

export interface ChargeSessionStartParams {
  legalEntityId: number;
  contractUserId: number;
  stationId: number;
  otherParams?: HeaterSessionParams;
}

export interface APIBodyChargeSessionStart {
  contractUserId: number;
  stationId: number;
   heatingParams?: HeaterSessionParams;
}

export interface ChargeSessionStopParams {
  legalEntityId: number;
  sessionId: number;
}


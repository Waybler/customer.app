import { ContractType, ContractUser, FutureTerms, IContractStatus, Terms } from './contract';
import * as Moment from 'moment';
import { API_RESULT } from './api';
import { Payment } from './payment';

export enum STATION_STATE {
  BUSY = 'busy',
  CABLE_CONNECTED = 'cable-connected',
  FAILURE = 'failure',
  FREE = 'free',
  READY = 'ready'
}

export interface Station {
  stationId: number;
  chargeLevel: number;
  name: string;
  session: string;
  sortOrder: number;
  state: STATION_STATE;
}

export interface ContractUserReservedStation {
  id: number;
  station: Station;
  autostart: boolean;
  contractUser: ContractUser;
}

export interface StationGroup {
  id: number;
  currency: string;
  isVirtual: boolean;
  maintenanceFee: number;
  name: string;
  stations: Station[];
  status: number;
}

export interface StationsAvailableObject {
  allStations: { int?: Station } | null;
  availableStations: { int?: Station } | null;
}

export interface Cluster {
  id: number;
  name: string;
  status: number;
  isVirtual: boolean;
  maintenanceFee: number;
  currency: string;
  stations: Station[];
}

export interface ChargeZonePublicInfo {
  zoneId: number;
  autostart: boolean;
  code: number;
  contractType: ContractType;
  isTimeRestricted: false;
  name: string;
  terms: Terms;
}

export interface ChargeZone extends ChargeZonePublicInfo {
  autostart: boolean;
  cancellationDate: Date;
  contractId: number;
  contractUserId: number;
  futureTerms: FutureTerms;
  isAdmin: boolean;
  isOneTimeFeeZone: boolean;
  isOwner: boolean;
  isTimeRestricted: false;
  contracteeId: number;
  maxSessions: number;
  newTerms: any;
  ownerId: number;
  stationGroups: StationGroup[];
  status: IContractStatus;
}

export interface ShouldUseCompactviewObject {
  shouldUseCompactView: boolean;
}

export interface GetChargeZoneInfoAPIResponse {
  paymentMethods: Payment[];
  result: API_RESULT;
  zoneCode: API_RESULT;
  zone: ChargeZonePublicInfo;
  user: {
    needToAddPaymentMethod: boolean;
  };
}
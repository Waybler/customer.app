import { ContractType, CONTRACT_STATUS, ITerms } from './contract';
import * as Moment from 'moment';

export enum STATION_STATE {
  BUSY = 'busy',
  CABLE_CONNECTED = 'cable-connected',
  FAILURE = 'failure',
  FREE = 'free',
  READY = 'ready'
}

export enum ZONE_ERROR_LEVEL {
  ERROR = 'error',
  INFO = 'info',
  OK = 'ok',
  UNKNOWN = 'unknown',
  WARNING = 'warning',
 }

export interface Station {
  stationId: number;
  chargeLevel: number;
  name: string;
  session: string;
  sortOrder: number;
  state: STATION_STATE;
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

export interface ChargeZone {
  zoneId: number;
  autostart: boolean;
  cancellationDate: Date;
  code: number;
  contractId: number;
  contractUserId: number;
  contractType: ContractType;
  isAdmin: true;
  isOwner: true;
  isTimeRestricted: false;
  contracteeId: number;
  maxSessions: number;
  name: string;
  newTerms: any;
  ownerId: number;
  stationGroups: StationGroup[];
  status: CONTRACT_STATUS;
  terms: ITerms;
}

export interface ShouldUseCompactviewObject {
  shouldUseCompactView: boolean;
}

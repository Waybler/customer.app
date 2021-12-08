import {WebsocketDataUserUpdated} from './user';
import {ChargeZone, Station} from './chargeZone';
import {ChargeSession} from './chargeSession';

export enum WebSocketType {
  CHARGE_ZONE_ADDED = 'charge-zone-added',
  CHARGE_ZONE_REMOVED = 'charge-zone-removed',
  CHARGE_ZONE_UPDATED = 'charge-zone-updated',
  CHARGE_ZONES = 'charge-zones',
  SESSION_UPDATED = 'session-updated',
  STATION_UPDATED = 'station-updated',
  USER_UPDATED = 'user-updated'
}

export interface IWebSocketTypeOfUserChargeZones {
  type: WebSocketType.CHARGE_ZONES;
  data: ChargeZone[];
}

export interface IWebSocketTypeOfUserChargeZoneUpdated {
  type: WebSocketType.CHARGE_ZONE_UPDATED;
  data: ChargeZone[];
}

export interface IWebSocketTypeOfSessionUpdated {
  type: WebSocketType.SESSION_UPDATED;
  data: ChargeSession;
}

export interface IWebSocketTypeOfStationUpdated {
  type: WebSocketType.STATION_UPDATED;
  data: Station;
}

export interface IWebSocketTypeOfUserUpdated {
  type: WebSocketType.USER_UPDATED;
  data: WebsocketDataUserUpdated;
}

export type IWebSocketUserServiceResponse =
  IWebSocketTypeOfUserChargeZones
  | IWebSocketTypeOfSessionUpdated
  | IWebSocketTypeOfStationUpdated
  | IWebSocketTypeOfUserUpdated
  | any;


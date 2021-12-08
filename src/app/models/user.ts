import * as Moment from 'moment';

export interface UserAppSettings {
  hasSetCompactView: boolean | null;
  showCompactView: boolean;
  compactViewLimit?: number;
  showCarHeating: boolean;
}

export enum USER_APP_SETTINGS_PROPERTY {
  hasSetCompactView = 'hasSetCompactView',
  showCompactView = 'showCompactView',
  compactViewLimit = 'compactViewLimit',
  showCarHeating = 'showCarHeating'
}

export interface UserAppSettingsAPIResponse {
  success: boolean;
  data: UserAppSettings;
}

export interface UserAuthenticateVerifyAPIResponse {
  result: string;
  legalEntityId: number;
}

export interface WebsocketDataUserUpdated {
  email: string;
  preferredLocale: string;
  termsAccepted: boolean;
  termsAcceptedDate: Moment.Moment;
}
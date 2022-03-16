// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

import { EnvironmentConfig, VendorConfig } from '../app/models/appConfig';

export const environment: EnvironmentConfig = {
  production: false,
  // apiUrl: 'https://api.cacharge.com/v6/',
  // wsUrl: 'wss://api.cacharge.com/v6/',
  // appUrl: 'https://app.cacharge.com'

  apiUrl: 'http://localhost/v6/',
  wsUrl: 'ws://localhost/v6/',
  appUrl: 'http://localhost',

  // apiUrl: 'http://10.10.0.201/v6/',
  // wsUrl: 'ws://10.10.0.201/v6/',
  // appUrl: 'http://10.10.0.201',
};

export const vendor: VendorConfig = {
  vendorName: 'CaCharge',
  vendorAppId: '8D0A2CFA-4373-43E2-951A-8BFF7C25D4D7',
  vendorSupportEmail: 'support@cacharge.com',

  // Config
  forceRegistrationNumber: true,
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
import 'zone.js/dist/zone-error';  // Included with Angular CLI.

import { EnvironmentConfig, VendorConfig } from '../app/models/appConfig';

export const environment: EnvironmentConfig = {
  production: true,
  apiUrl: 'https://api.cacharge.com/v6/',
  apiUrlV5: 'https://api.cacharge.com/v6/',
  wsUrl: 'wss://api.cacharge.com/v6/',
  appUrl: 'https://app.cacharge.com',
};

export const vendor: VendorConfig = {
  vendorName: 'CaCharge',
  vendorAppId: 'x-01',
  vendorSupportEmail: 'support@cacharge.com',

  // Config
  forceRegistrationNumber: false,
};

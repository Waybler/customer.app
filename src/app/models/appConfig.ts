export interface EnvironmentConfig {
  production?: boolean;
  apiUrl: string;
  apiUrlV5?: string;
  wsUrl: string;
  appUrl: string;
}

export interface VendorConfig {
  vendorName: string;
  vendorAppId: string;
  vendorSupportEmail: string;

  // Config
  forceRegistrationNumber?: boolean;
}
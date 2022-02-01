export interface Vehicle {
  countryCode: string;
  make: string;
  model: string;
  modelYear: number;
  registrationNumber: string;
  vehicleIdentificationNumber: string;
  vehicleYear: number;
  isDefaultVehicle: boolean;
}

export interface GetVehiclesAPIResponse {
  success: boolean;
  data: Vehicle[];
}

export interface RegisterVehiclesAPIRequestBody {
  countryCode: string;
  registrationNumber: string;
}

export interface RegisterVehiclesAPIResponse {
  success: boolean;
  data: Vehicle;
}

export interface RemoverVehiclesAPIResponse {
  success: boolean;
  data: null;
}

export interface RegisterOrRemoveVehiclesServiceParams extends RegisterVehiclesAPIRequestBody {
  legalEntityId: number;
}

export interface VehicleAndStation {
  vehicle: Vehicle;
  stationId: number;
}

export interface ChargingVehiclesObject {
  [key: string]: VehicleAndStation;
}
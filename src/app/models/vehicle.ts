import { API_RESULT } from './api';

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

export interface VehicleServiceAPIRequestBody {
  countryCode: string;
  registrationNumber: string;
}

export interface RegisterVehiclesAPIResponse {
  success: boolean;
  data: Vehicle;
}

export interface RemoveVehiclesAPIResponse {
  success: boolean;
  data: {
    result: API_RESULT
  };
}

export interface SetOrUnsetDefaultVehicleAPIResponse {
  success: boolean;
  data: {
    result: API_RESULT
  };
}

export interface VehiclesServiceFunctionsParams extends VehicleServiceAPIRequestBody {
  legalEntityId: number;
}

export interface VehicleAndStation {
  vehicle: Vehicle;
  stationId: number;
}

export interface ChargingVehiclesObject {
  [key: string]: VehicleAndStation;
}
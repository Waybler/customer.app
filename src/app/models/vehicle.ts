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

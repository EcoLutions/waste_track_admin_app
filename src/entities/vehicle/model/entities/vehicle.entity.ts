import {VehicleTypeEnum} from '../enums/vehicle-type.enum';

export interface VehicleEntity {
  id: string;
  licensePlate: string;
  vehicleType: VehicleTypeEnum;
  volumeCapacity: number;
  weightCapacity: number;
  mileage: number;
  districtId: string;
  assignedDriverId: string | null;
  lastMaintenanceDate: Date | null;
  nextMaintenanceDate: Date | null;
  isActive: boolean;
}

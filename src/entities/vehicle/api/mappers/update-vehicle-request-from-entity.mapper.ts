import { VehicleEntity } from '../../model';
import { UpdateVehicleRequest } from '../types/update-vehicle-request.type';

export class UpdateVehicleRequestFromEntityMapper {
  static fromEntityToDto(entity: VehicleEntity): UpdateVehicleRequest {
    return {
      vehicleId: entity.id,
      licensePlate: entity.licensePlate ?? null,
      vehicleType: entity.vehicleType ?? null,
      volumeCapacity: entity.volumeCapacity ?? null,
      weightCapacity: entity.weightCapacity ?? null,
      districtId: entity.districtId ?? null,
      assignedDriverId: entity.assignedDriverId ?? null,
      lastMaintenanceDate: entity.lastMaintenanceDate?.toISOString() ?? null,
      nextMaintenanceDate: entity.nextMaintenanceDate?.toISOString() ?? null,
      isActive: entity.isActive ?? null
    };
  }
}

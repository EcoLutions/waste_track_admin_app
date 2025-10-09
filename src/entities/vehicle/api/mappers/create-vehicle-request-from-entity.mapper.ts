import { VehicleEntity } from '../../model';
import { CreateVehicleRequest } from '../types/create-vehicle-request.type';

export class CreateVehicleRequestFromEntityMapper {
  static fromEntityToDto(entity: VehicleEntity): CreateVehicleRequest {
    return {
      licensePlate: entity.licensePlate,
      vehicleType: entity.vehicleType,
      volumeCapacity: entity.volumeCapacity.toString(),
      weightCapacity: entity.weightCapacity.toString(),
      districtId: entity.districtId
    };
  }
}

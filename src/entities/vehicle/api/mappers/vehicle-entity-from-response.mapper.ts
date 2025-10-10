import { VehicleEntity } from '../../model';
import { VehicleResponse } from '../types/vehicle-response.type';
import { VehicleTypeEnum } from '../../model';

export class VehicleEntityFromResponseMapper {
  static fromDtoToEntity(dto: VehicleResponse): VehicleEntity {
    return {
      id: dto.id ?? '',
      licensePlate: dto.licensePlate ?? '',
      vehicleType: VehicleEntityFromResponseMapper.mapStringToVehicleType(dto.vehicleType ?? ''),
      volumeCapacity: dto.volumeCapacity ? parseFloat(dto.volumeCapacity) : 0,
      weightCapacity: dto.weightCapacity ?? 0,
      mileage: dto.mileage ?? 0,
      districtId: dto.districtId ?? '',
      assignedDriverId: dto.assignedDriverId ?? null,
      lastMaintenanceDate: dto.lastMaintenanceDate ? new Date(dto.lastMaintenanceDate) : null,
      nextMaintenanceDate: dto.nextMaintenanceDate ? new Date(dto.nextMaintenanceDate) : null,
      isActive: dto.isActive ?? true
    };
  }

  private static mapStringToVehicleType(vehicleType: string): VehicleTypeEnum {
    const normalized = (vehicleType ?? '').toString().trim().toLowerCase();

    const typeKey = Object.keys(VehicleTypeEnum).find(key => {
      const val = VehicleTypeEnum[key as keyof typeof VehicleTypeEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (typeKey) {
      return VehicleTypeEnum[typeKey as keyof typeof VehicleTypeEnum];
    }

    console.warn(`Invalid vehicle type received: ${vehicleType}, defaulting to TRUCK`);
    return VehicleTypeEnum.TRUCK;
  }
}

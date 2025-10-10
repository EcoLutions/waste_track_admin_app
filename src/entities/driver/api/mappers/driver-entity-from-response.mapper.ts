import { DriverEntity } from '../../model';
import { DriverResponse } from '../types/driver-response.type';
import { DriverStatusEnum } from '../../model';

export class DriverEntityFromResponseMapper {
  static fromDtoToEntity(dto: DriverResponse): DriverEntity {
    return {
      id: dto.id ?? '',
      districtId: dto.districtId ?? '',
      firstName: dto.firstName ?? '',
      lastName: dto.lastName ?? '',
      documentNumber: dto.documentNumber ?? '',
      phoneNumber: dto.phoneNumber ?? '',
      userId: dto.userId ?? '',
      driverLicense: dto.driverLicense ?? '',
      licenseExpiryDate: dto.licenseExpiryDate ? new Date(dto.licenseExpiryDate) : new Date(),
      emailAddress: dto.emailAddress ?? '',
      totalHoursWorked: dto.totalHoursWorked ?? 0,
      lastRouteCompletedAt: dto.lastRouteCompletedAt ? new Date(dto.lastRouteCompletedAt) : null,
      status: DriverEntityFromResponseMapper.mapStringToDriverStatus(dto.status ?? ''),
      assignedVehicleId: dto.assignedVehicleId ?? null,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapStringToDriverStatus(status: string): DriverStatusEnum {
    const normalized = (status ?? '').toString().trim().toLowerCase();

    const statusKey = Object.keys(DriverStatusEnum).find(key => {
      const val = DriverStatusEnum[key as keyof typeof DriverStatusEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (statusKey) {
      return DriverStatusEnum[statusKey as keyof typeof DriverStatusEnum];
    }

    console.warn(`Invalid driver status received: ${status}, defaulting to AVAILABLE`);
    return DriverStatusEnum.AVAILABLE;
  }
}

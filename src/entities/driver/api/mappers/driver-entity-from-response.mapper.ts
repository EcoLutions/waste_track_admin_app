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
      assignedVehicleId: dto.assignedVehicleId ?? null
    };
  }

  private static mapStringToDriverStatus(status: string): DriverStatusEnum {
    const statusKey = Object.keys(DriverStatusEnum).find(
      key => DriverStatusEnum[key as keyof typeof DriverStatusEnum] === status
    );

    if (statusKey) {
      return DriverStatusEnum[statusKey as keyof typeof DriverStatusEnum];
    }

    console.warn(`Invalid driver status received: ${status}, defaulting to AVAILABLE`);
    return DriverStatusEnum.AVAILABLE;
  }
}

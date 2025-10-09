import { DistrictEntity } from '../../model';
import { DistrictResponse } from '../types/district-response.type';
import { OperationalStatusEnum } from '../../model';

export class DistrictEntityFromResponseMapper {
  static fromDtoToEntity(dto: DistrictResponse): DistrictEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      code: dto.code ?? '',
      boundaries: dto.boundaries ?? '',
      operationalStatus: DistrictEntityFromResponseMapper.mapStringToOperationalStatus(dto.operationalStatus ?? ''),
      serviceStartDate: dto.serviceStartDate ? new Date(dto.serviceStartDate) : null,
      subscriptionId: dto.subscriptionId ?? '',
      maxVehicles: dto.maxVehicles ?? 0,
      maxDrivers: dto.maxDrivers ?? 0,
      maxContainers: dto.maxContainers ?? 0,
      primaryAdminEmail: dto.primaryAdminEmail ?? ''
    };
  }

  private static mapStringToOperationalStatus(status: string): OperationalStatusEnum {
    const statusKey = Object.keys(OperationalStatusEnum).find(
      key => OperationalStatusEnum[key as keyof typeof OperationalStatusEnum] === status
    );

    if (statusKey) {
      return OperationalStatusEnum[statusKey as keyof typeof OperationalStatusEnum];
    }

    console.warn(`Invalid operational status received: ${status}, defaulting to ACTIVE`);
    return OperationalStatusEnum.ACTIVE;
  }
}

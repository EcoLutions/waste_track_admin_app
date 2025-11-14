import { DistrictEntity } from '../../model';
import { DistrictResponse } from '../types/district-response.type';
import { OperationalStatusEnum } from '../../model';

export class DistrictEntityFromResponseMapper {
  static fromDtoToEntity(dto: DistrictResponse): DistrictEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      code: dto.code ?? '',
      depotLatitude: dto.depotLatitud ?? '',
      depotLongitude: dto.depotLongitude ?? '',
      operationalStatus: DistrictEntityFromResponseMapper.mapStringToOperationalStatus(dto.operationalStatus ?? ''),
      serviceStartDate: dto.serviceStartDate ? new Date(dto.serviceStartDate) : null,
      operationStartTime: dto.operationStartTime ?? '',
      operationEndTime: dto.operationEndTime ?? '',
      maxRouteDuration: dto.maxRouteDuration ?? '',
      planId: dto.planId ?? '',
      planName: dto.planName ?? '',
      maxVehicles: dto.maxVehicles ?? 0,
      maxDrivers: dto.maxDrivers ?? 0,
      maxContainers: dto.maxContainers ?? 0,
      currency: dto.currency ?? '',
      price: dto.price ?? '',
      billingPeriod: dto.billingPeriod ?? '',
      currentVehicleCount: dto.currentVehicleCount ?? 0,
      currentDriverCount: dto.currentDriverCount ?? 0,
      currentContainerCount: dto.currentContainerCount ?? 0,
      primaryAdminEmail: null,
      primaryAdminUsername: null
    };
  }

  private static mapStringToOperationalStatus(status: string): OperationalStatusEnum {
    const normalized = (status ?? '').toString().trim().toLowerCase();

    const statusKey = Object.keys(OperationalStatusEnum).find(key => {
      const val = OperationalStatusEnum[key as keyof typeof OperationalStatusEnum];
      return String(val).toLowerCase() === normalized || key.toLowerCase() === normalized;
    });

    if (statusKey) {
      return OperationalStatusEnum[statusKey as keyof typeof OperationalStatusEnum];
    }

    console.warn(`Invalid operational status received: ${status}, defaulting to ACTIVE`);
    return OperationalStatusEnum.ACTIVE;
  }
}

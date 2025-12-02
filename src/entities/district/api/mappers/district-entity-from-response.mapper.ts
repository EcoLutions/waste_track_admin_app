import { DistrictEntity } from '../../model';
import { DistrictResponse } from '../types/district-response.type';
import { OperationalStatusEnum } from '../../model';
import {DateTimeUtils} from '../../../../shared/libs/utils/date-time.utils';
import {EnumMapper} from '../../../../shared/api/mappers/enum.mapper';

export class DistrictEntityFromResponseMapper {
  static fromDtoToEntity(dto: DistrictResponse): DistrictEntity {
    return {
      id: dto.id ?? '',
      name: dto.name ?? '',
      code: dto.code ?? '',
      depotLatitude: dto.depotLatitud ?? '',
      depotLongitude: dto.depotLongitude ?? '',
      disposalLongitude: dto.disposalLongitude ?? '',
      disposalLatitude: dto.disposalLatitude ?? '',
      operationalStatus: EnumMapper.mapStringToEnum(dto.operationalStatus, OperationalStatusEnum, OperationalStatusEnum.ACTIVE),
      serviceStartDate: DateTimeUtils.stringToLocalDate(dto.serviceStartDate),
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
      primaryAdminUsername: null,
      createdAt: DateTimeUtils.isoStringToDate(dto.createdAt),
      updatedAt: DateTimeUtils.isoStringToDate(dto.updatedAt),
    };
  }
}

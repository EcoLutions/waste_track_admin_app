import {RouteEntity, RouteStatusEnum} from '../../model';
import {RouteResponse} from '../types/route-response.type';
import {EnumMapper} from '../../../../shared/api/mappers/enum.mapper';
import {DateTimeUtils} from '../../../../shared/libs/utils/date-time.utils';
import {DurationUtils} from '../../../../shared/libs/utils/duration.utils';

export class RouteEntityFromResponseMapper {
  static fromDtoToEntity(dto: RouteResponse): RouteEntity {
    return {
      id: dto.id ?? '',
      districtId: dto.districtId ?? '',
      vehicleId: dto.vehicleId,
      driverId: dto.driverId,
      status: EnumMapper.mapStringToEnum(dto.status, RouteStatusEnum, RouteStatusEnum.DRAFT),
      scheduledStartAt: DateTimeUtils.stringToLocalDateTime(dto.scheduledStartAt) ?? new Date(),
      scheduledEndAt: DateTimeUtils.stringToLocalDateTime(dto.scheduledEndAt) ?? new Date(),
      startedAt: DateTimeUtils.stringToLocalDateTime(dto.startedAt),
      completedAt: DateTimeUtils.stringToLocalDateTime(dto.completedAt),
      waypoints: [],
      totalDistance: this.parseDistanceToKilometers(dto.totalDistance),
      estimatedDuration: this.parseIsoDurationToMinutes(dto.estimatedDuration),
      collectionDuration: this.parseIsoDurationToMinutes(dto.collectionDuration),
      returnDuration: this.parseIsoDurationToMinutes(dto.returnDuration),
      actualDuration: this.parseIsoDurationToMinutes(dto.actualDuration),
      currentLatitude: dto.currentLatitude ?? '',
      currentLongitude: dto.currentLongitude ?? '',
      lastLocationUpdate: DateTimeUtils.stringToLocalDateTime(dto.lastLocationUpdate),
      createdAt: DateTimeUtils.stringToLocalDateTime(dto.createdAt),
      updatedAt: DateTimeUtils.stringToLocalDateTime(dto.updatedAt)
    };
  }

  private static parseDistanceToKilometers(distance: string | null): number | null {
    if (!distance) return null;

    try {
      const parsed = parseFloat(distance);
      return isNaN(parsed) ? null : parsed;
    } catch {
      console.error('Error parsing distance:', distance);
      return null;
    }
  }

  private static parseIsoDurationToMinutes(isoDuration: string | null): number | null {
    if (!isoDuration) return null;

    const { totalMinutes } = DurationUtils.parse(isoDuration);
    return totalMinutes > 0 ? totalMinutes : null;
  }
}

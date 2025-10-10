import { RouteEntity } from '../../model';
import { RouteResponse } from '../types/route-response.type';
import { RouteStatusEnum } from '../../model';
import { RouteTypeEnum } from '../../model';

export class RouteEntityFromResponseMapper {
  static fromDtoToEntity(dto: RouteResponse): RouteEntity {
    return {
      id: dto.id ?? '',
      districtId: dto.districtId ?? '',
      vehicleId: dto.vehicleId,
      driverId: dto.driverId,
      routeType: RouteEntityFromResponseMapper.mapRouteType(dto.routeType),
      status: RouteEntityFromResponseMapper.mapRouteStatus(dto.status),
      scheduledDate: dto.scheduledDate ? new Date(dto.scheduledDate) : new Date(),
      startedAt: dto.startedAt ? new Date(dto.startedAt) : null,
      completedAt: dto.completedAt ? new Date(dto.completedAt) : null,
      waypoints: [], // Will be populated separately if needed
      totalDistance: dto.totalDistance?.value ?? null,
      estimatedDuration: RouteEntityFromResponseMapper.mapDuration(dto.estimatedDuration),
      actualDuration: RouteEntityFromResponseMapper.mapDuration(dto.actualDuration),
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapRouteType(routeType: string | null): RouteTypeEnum {
    const validTypes = Object.values(RouteTypeEnum) as string[];
    if (routeType && validTypes.includes(routeType.toLowerCase())) {
      return routeType.toLowerCase() as RouteTypeEnum;
    }
    return RouteTypeEnum.REGULAR; // Default fallback
  }

  private static mapRouteStatus(status: string | null): RouteStatusEnum {
    const validStatuses = Object.values(RouteStatusEnum) as string[];
    if (status && validStatuses.includes(status.toLowerCase())) {
      return status.toLowerCase() as RouteStatusEnum;
    }
    return RouteStatusEnum.DRAFT; // Default fallback
  }

  private static mapDuration(duration: { hours: number | null; minutes: number | null; seconds: number | null } | null): number | null {
    if (!duration) return null;

    const hours = duration.hours ?? 0;
    const minutes = duration.minutes ?? 0;
    const seconds = duration.seconds ?? 0;

    return hours * 60 + minutes + seconds / 60; // Convert to minutes
  }
}

import { RouteEntity } from '../../model';
import { UpdateRouteRequest } from '../types/update-route-request.type';

export class UpdateRouteRequestFromEntityMapper {
  static fromEntityToDto(entity: RouteEntity): UpdateRouteRequest {
    return {
      districtId: entity.districtId,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      routeType: entity.routeType,
      status: entity.status,
      scheduledDate: entity.scheduledDate.toISOString(),
      startedAt: entity.startedAt?.toISOString() ?? null,
      completedAt: entity.completedAt?.toISOString() ?? null,
      totalDistance: entity.totalDistance ? {
        value: entity.totalDistance,
        unit: 'km' // Default unit
      } : null,
      estimatedDuration: RouteEntityFromRequestMapper.mapDurationToResource(entity.estimatedDuration),
      actualDuration: RouteEntityFromRequestMapper.mapDurationToResource(entity.actualDuration)
    };
  }
}

class RouteEntityFromRequestMapper {
  static mapDurationToResource(durationMinutes: number | null): { hours: number | null; minutes: number | null; seconds: number | null } | null {
    if (!durationMinutes) return null;

    const hours = Math.floor(durationMinutes / 60);
    const minutes = Math.floor(durationMinutes % 60);
    const seconds = Math.floor((durationMinutes % 1) * 60);

    return {
      hours: hours || null,
      minutes: minutes || null,
      seconds: seconds || null
    };
  }
}

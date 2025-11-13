import { RouteEntity } from '../../model';
import { CreateRouteRequest } from '../types/create-route-request.type';

export class CreateRouteRequestFromEntityMapper {
  static fromEntityToDto(entity: RouteEntity): CreateRouteRequest {
    return {
      districtId: entity.districtId,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      routeType: entity.routeType,
      scheduledDate: entity.scheduledDate.toISOString(),
    };
  }
}

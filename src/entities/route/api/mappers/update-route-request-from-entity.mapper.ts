import { RouteEntity } from '../../model';
import { UpdateRouteRequest } from '../types/update-route-request.type';

export class UpdateRouteRequestFromEntityMapper {
  static fromEntityToDto(entity: RouteEntity): UpdateRouteRequest {
    return {
      routeId: entity.id,
      scheduledDate: entity.scheduledStartAt.toISOString(),
    };
  }
}

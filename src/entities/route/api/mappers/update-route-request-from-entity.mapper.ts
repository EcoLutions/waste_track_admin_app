import {RouteEntity} from '../../model';
import {UpdateRouteRequest} from '../types/update-route-request.type';
import {DateTimeUtils} from '../../../../shared/libs/utils/date-time.utils';

export class UpdateRouteRequestFromEntityMapper {
  static fromEntityToDto(entity: RouteEntity): UpdateRouteRequest {
    const scheduledDate = DateTimeUtils.localDateTimeToString(entity.scheduledStartAt);

    if (!scheduledDate) {
      throw new Error('scheduledStartAt is required for updating a route');
    }

    if (!entity.id || entity.id.trim() === '') {
      throw new Error('routeId is required for updating a route');
    }

    return {
      routeId: entity.id,
      scheduledDate,
    };
  }
}

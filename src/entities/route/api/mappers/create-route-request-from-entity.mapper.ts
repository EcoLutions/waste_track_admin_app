import {RouteEntity} from '../../model';
import {CreateRouteRequest} from '../types/create-route-request.type';
import {DateTimeUtils} from '../../../../shared/libs/utils/date-time.utils';

export class CreateRouteRequestFromEntityMapper {
  static fromEntityToDto(entity: RouteEntity): CreateRouteRequest {
    const scheduledDate = DateTimeUtils.localDateTimeToString(entity.scheduledStartAt);

    if (!scheduledDate) {
      throw new Error('scheduledStartAt is required for creating a route');
    }

    if (!entity.districtId || entity.districtId.trim() === '') {
      throw new Error('districtId is required for creating a route');
    }

    return {
      districtId: entity.districtId,
      vehicleId: entity.vehicleId,
      driverId: entity.driverId,
      scheduledDate,
    };
  }
}

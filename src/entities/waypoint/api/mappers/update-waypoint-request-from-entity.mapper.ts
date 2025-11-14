import { WaypointEntity } from '../../model';
import { UpdateWaypointRequest } from '../types/update-waypoint-request.type';

export class UpdateWaypointRequestFromEntityMapper {
  static fromEntityToDto(entity: WaypointEntity): UpdateWaypointRequest {
    return {
      sequenceOrder: entity.sequenceOrder,
      priority: entity.priority,
      estimatedArrivalTime: entity.estimatedArrivalTime?.toISOString() ?? null,
    };
  }
}

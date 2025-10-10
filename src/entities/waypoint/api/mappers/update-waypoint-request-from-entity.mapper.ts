import { WaypointEntity } from '../../model';
import { UpdateWaypointRequest } from '../types/update-waypoint-request.type';

export class UpdateWaypointRequestFromEntityMapper {
  static fromEntityToDto(entity: WaypointEntity): UpdateWaypointRequest {
    return {
      containerId: entity.containerId,
      sequenceOrder: entity.sequenceOrder,
      priority: entity.priority,
      status: entity.status,
      estimatedArrivalTime: entity.estimatedArrivalTime?.toISOString() ?? null,
      actualArrivalTime: entity.actualArrivalTime?.toISOString() ?? null,
      driverNote: entity.driverNote
    };
  }
}

import { WaypointEntity } from '../../model';
import { CreateWaypointRequest } from '../types/create-waypoint-request.type';

export class CreateWaypointRequestFromEntityMapper {
  static fromEntityToDto(entity: WaypointEntity): CreateWaypointRequest {
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

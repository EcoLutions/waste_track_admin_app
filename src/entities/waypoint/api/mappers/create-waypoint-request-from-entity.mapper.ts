import { WaypointEntity } from '../../model';
import { CreateWaypointRequest } from '../types/create-waypoint-request.type';

export class CreateWaypointRequestFromEntityMapper {
  static fromEntityToDto(entity: WaypointEntity): CreateWaypointRequest {
    return {
      containerId: entity.containerId,
      sequenceOrder: entity.sequenceOrder,
      priority: entity.priority,
    };
  }
}

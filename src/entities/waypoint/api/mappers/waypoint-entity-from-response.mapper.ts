import { WaypointEntity } from '../../model';
import { WaypointResponse } from '../types/waypoint-response.type';
import { PriorityEnum } from '../../model';
import { WaypointStatusEnum } from '../../model';

export class WaypointEntityFromResponseMapper {
  static fromDtoToEntity(dto: WaypointResponse): WaypointEntity {
    return {
      id: dto.id ?? '',
      containerId: dto.containerId ?? '',
      sequenceOrder: dto.sequenceOrder ?? 0,
      priority: WaypointEntityFromResponseMapper.mapPriority(dto.priority),
      status: WaypointEntityFromResponseMapper.mapWaypointStatus(dto.status),
      estimatedArrivalTime: dto.estimatedArrivalTime ? new Date(dto.estimatedArrivalTime) : null,
      actualArrivalTime: dto.actualArrivalTime ? new Date(dto.actualArrivalTime) : null,
      serviceTime: null,
      driverNote: dto.driverNote,
      createdAt: dto.createdAt ? new Date(dto.createdAt) : null,
      updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : null
    };
  }

  private static mapPriority(priority: string | null): PriorityEnum {
    const validPriorities = Object.values(PriorityEnum) as string[];
    if (priority && validPriorities.includes(priority.toLowerCase())) {
      return priority.toLowerCase() as PriorityEnum;
    }
    return PriorityEnum.MEDIUM; // Default fallback
  }

  private static mapWaypointStatus(status: string | null): WaypointStatusEnum {
    const validStatuses = Object.values(WaypointStatusEnum) as string[];
    if (status && validStatuses.includes(status.toLowerCase())) {
      return status.toLowerCase() as WaypointStatusEnum;
    }
    return WaypointStatusEnum.PENDING; // Default fallback
  }

  private static mapServiceTime(serviceTime: number | null): number | null {
    // Assuming serviceTime comes in minutes from the API
    return serviceTime;
  }
}
